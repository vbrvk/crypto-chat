import ms from 'ms';
import Api from '../api';
import { sleep } from '../utils';
import KeyGenerator from '../crypto/key-generator';
import { addCommonKey } from '../store'

const api = new Api();

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
    keyGenerator.generateSecret(pubKey2);
  } else { // we are client 2
    const { pubKey1, generatorParam, prime} = client1RegistrationRes;
    if (!pubKey1) {
      throw new Error('have no data for key generation');
    }

    keyGenerator = new KeyGenerator(prime, generatorParam);
    keyGenerator.generateSecret(pubKey1);
    const pubKey2 = await keyGenerator.getPublic();
    await api.registerSecondClient(chatId, pubKey2);
  }

  // tell server that we are ready
  await api.iAmReady(chatId);
  commonKey = keyGenerator.getSecret();
  addCommonKey(commonKey)

  let isChatReady = null;
  do {
    const { ok } = await api.isChatReady(chatId);
    isChatReady = ok;

    if (!isChatReady) {
      await sleep(ms('100ms'));
    }

  } while (!isChatReady);
}

export default initSession;