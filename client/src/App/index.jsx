import React from 'react';
import createRoom from '../controllers/create-room';
import initSession from '../controllers/init-session';
import EthSigner from '../crypto/eth-signer';

const signer = new EthSigner();

class App extends React.Component {
  addresses = React.createRef()

  createRoomHandler = async () => {
    const [account] = await window.ethereum.enable();
    const addresses = this.addresses.current.value;
    const chatId = await createRoom(addresses.split(',').map(a => a.trim()));
    const sign = await signer.sign(chatId);

    console.log('initiating session, can take long time');

    await initSession({ chatId, chatSignature: sign, ethAddress: account });
    console.log('Session is ready');
  }

  render() {
    if (typeof window.ethereum == 'undefined') {
      return (
        <div>
          Please install <a href="https://metamask.io/">Metamask</a>
        </div>
      )
    }

    return (
      <div>
        <input placeholder='Addresses to allow room' ref={this.addresses}></input>
        <button onClick={this.createRoomHandler}>Create room</button>
      </div>
    )
  }
};

export default App;