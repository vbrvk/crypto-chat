import ky from 'ky';


class Api {
  constructor() {
    this.request = ky.extend({
      prefixUrl: 'http://localhost:1337'
    });
  }

  addSignature(sign) {
    this.sign = sign;

    this.request = ky.extend({
      prefixUrl: 'http://localhost:1337',
      headers: {
        'x-sign': sign
      }
    });
  }

  async createChatRoom(addresses) {
    return this.request.post('new-room', { json: { addresses }}).json();
    // return {
    //   ok: true,
    //   id: 'test_id', // id of room, also link to chat
    // };
  }

  async registerFirstClient(chatId, prime, generatorParam, pubKey1) {
    return this.request.put(`register-first-client/${chatId}`, { json: { prime, generatorParam, pubKey1 } }).json();

    /* can return error:
    {
      ok: false,
      errorMessage: "First client already exist",
      data: {
        pubKey1: string,
        prime: string,
        generatorParam: string,
      }
    }
    */
  }

  async registerSecondClient(chatId, pubKey2) {
    return this.request.put(`register-second-client/${chatId}`, { json: { pubKey2 } }).json();

    // return {
    //   ok: true,
    // }
  }

  async isChatReady(chatId) { // tell if both clients are have same PrivKey
    return this.request.get(`is-chat-ready/${chatId}`).json();

    // return {
    //   ok: true
    // }
  }

  async iAmReady(chatId) { // tell server that client has common PrivKey
    return this.request.put(`i-am-ready/${chatId}`).json();

    // return {
    //   ok: true
    // }
  }

  async getSecondPubKey(chatId) { // ask server for pubKey2
    return this.request.get(`second-pubkey/${chatId}`).json();

    // return {
    //   ok: true,
    //   pubKey2: 'test_pub_key',
    // }

    /*
    Or
      {
        ok: false,
        errorMessage: 'pubKey2 is not ready yet'
      }
     */
  }
}

export default Api;
