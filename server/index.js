import express from 'express'
import bodyParser from 'body-parser';
import cors from 'cors';
import { uuid } from 'uuidv4';
import { fromRpcSig, ecrecover, bufferToHex, pubToAddress, hashPersonalMessage } from 'ethereumjs-util'

const app = express()

// parse application/json
app.use(bodyParser.json())
app.options('*', cors());
app.use(cors());

const checkSign = (req, res, next) => {
  const { chatId } = req.params;

  if (!store.rooms[chatId]) {
    return res.json({
      ok: false,
      error: 404
    });
  }

  const sig = fromRpcSig(req.headers['x-sign']);

  const pub = ecrecover(hashPersonalMessage(Buffer.from(chatId)), sig.v, sig.r, sig.s);
  const address = bufferToHex(pubToAddress(pub));

  if (!store.rooms[chatId].addresses.includes(address)) {
    return res.json({
      ok: false,
      error: 403
    });
  }

  req.ethAddress = address;

  next();
}

const store = {
  rooms: {}
};

app.post('/new-room', async (req, res) => {
  const id = uuid();

  const { addresses } = req.body;

  // create room
  store.rooms[id] = {
    addresses,
    ready: {}
  }

  return res.json({
    id,
    ok: true,
  });
});

app.put('/register-first-client/:chatId', checkSign, async (req, res) => {
  const { chatId } = req.params;
  const { prime, generatorParam, pubKey1 } = req.body;
  const room = store.rooms[chatId];

  if (room.crypto) {
    return res.json({
      ok: false,
      errorMessage: "First client already exist",
      data: {
        pubKey1: room.crypto.pubKey1,
        prime: room.crypto.prime,
        generatorParam: room.crypto.generatorParam,
      }
    })
  }

  room.crypto = { prime, generatorParam, pubKey1 };

  return res.json({ ok: true });
})

app.put('/register-second-client/:chatId', checkSign, async (req, res) => {
  const { chatId } = req.params;
  const { pubKey2 } = req.body;
  const room = store.rooms[chatId];

  room.crypto.pubKey2 = pubKey2;

  return res.json({ ok: true });
})

app.get('/is-chat-ready/:chatId', checkSign, async (req, res) => {
  const { chatId } = req.params;
  const room = store.rooms[chatId];

  return res.json({ ok: Object.keys(room.ready).length === 2 });
})

app.put('/i-am-ready/:chatId', checkSign, async (req, res) => {
  const { chatId } = req.params;
  const room = store.rooms[chatId];

  room.ready[req.ethAddress] = true;

  return res.json({ ok: true });
})

app.get('/second-pubkey/:chatId', checkSign, async (req, res) => {
  const { chatId } = req.params;
  const room = store.rooms[chatId];

  if (room.crypto.pubKey2) {
    return res.json({ ok: true, pubKey2: room.crypto.pubKey2 });
  }

  return res.json({ ok: false, errorMessage: 'pubKey2 is not ready yet' });
})

app.use(function (req, res) {
  res.setHeader('Content-Type', 'text/plain');

  return res.json({
    id: 'test',
  });
})

app.listen(1337, () => {
  console.log('Server listened on http://localhost:1337');
})