import ms from 'ms';
import { Buffer } from 'buffer';

import api from '../api';
import { sleep } from '../utils';
import KeyGenerator from '../crypto/key-generator';
import { addCommonKey } from '../store'

const initSession = async ({
  chatId,
  chatSignature,
  ethAddress
}) => {
  // chat created already
  let commonKey = null;

  await api.addSignature(chatSignature);

  // first act like we is client1
  let keyGenerator = new KeyGenerator(); // can be regenerated if it client is second client
  const generatorParams = keyGenerator.getGeneratorParams();
  console.log('Trying to register first client');

  const client1RegistrationRes = await api.registerFirstClient(
    chatId,
    generatorParams[0],
    generatorParams[1],
    keyGenerator.getPublic()
  );

  if (client1RegistrationRes.ok) {
    // we should wait while client2 send pubKey2 to server
    let pubKey2 = null;
    do {
      console.log('Getting pub key 2');

      ({ pubKey2 } = await api.getSecondPubKey(chatId));
      await sleep(ms('0.1s'));
    } while (!pubKey2);

    // now we have pubKey2, so can get common key
    keyGenerator.generateSecret(Buffer.from(pubKey2.data));
  } else { // we are client 2
    const { pubKey1, generatorParam, prime} = client1RegistrationRes.data;
    if (!pubKey1) {
      throw new Error('have no data for key generation');
    }
    console.log('Trying to register second client');
    keyGenerator = new KeyGenerator(Buffer.from(prime.data), Buffer.from(generatorParam.data));
    keyGenerator.generateSecret(Buffer.from(pubKey1.data));
    const pubKey2 = await keyGenerator.getPublic();
    await api.registerSecondClient(chatId, pubKey2);
  }

  // tell server that we are ready
  console.log('Client is ready');

  await api.iAmReady(chatId);
  commonKey = keyGenerator.getSecret();
  addCommonKey(commonKey)

  let isChatReady = null;
  do {
    console.log('Check is chat ready');
    const { ok } = await api.isChatReady(chatId);
    isChatReady = ok;

    if (!isChatReady) {
      await sleep(ms('500ms'));
    }

  } while (!isChatReady);
  console.log('Chat is ready');
}

export default initSession;