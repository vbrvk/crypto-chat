import React from 'react';
import ms from 'ms';
import createRoom from '../controllers/create-room';
import initSession from '../controllers/init-session';
import { getNewMessages, sendMessage } from '../controllers/messages';
import EthSigner from '../crypto/eth-signer';

const signer = new EthSigner();

class App extends React.Component {
  state = {
    screen: 'init',
    messages: [{
      text: 'Start of the chat',
      time: Date.now(),
      address: 'System'
    }]
  }

  addresses = React.createRef()
  message = React.createRef()

  createRoomHandler = async () => {
    const [account] = await window.ethereum.enable();
    const addresses = this.addresses.current.value.split(',').map(a => a.trim());
    await createRoom([...addresses, account]);
    await this.connectToRoomHandler();
  }

  connectToRoomHandler = async () => {
    const [account] = await window.ethereum.enable();
    const chatId = window.location.pathname.split('/').pop();
    const sign = await signer.sign(chatId);

    console.log('initiating session, can take long time');
    await initSession({ chatId, chatSignature: sign, ethAddress: account });
    console.log('Session is ready');
    this.setState({ screen: 'chat' });
    this.startMessagesUpdate()
  }

  startMessagesUpdate = () => {
    setInterval(async () => {
      const chatId = window.location.pathname.split('/').pop();

      const newMessages = await getNewMessages(chatId, this.state.messages[this.state.messages.length - 1].time);

      this.setState(state => {
        return {
          ...state,
          messages: [...state.messages, ...newMessages]
        }
      });
    }, ms('300ms'));
  }

  sendMessage = async () => {
    const chatId = window.location.pathname.split('/').pop();

    const text = this.message.current.value;
    await sendMessage(chatId, text);

    this.message.current.value = '';
  }

  render() {
    if (typeof window.ethereum == 'undefined') {
      return (
        <div>
          Please install <a href="https://metamask.io/">Metamask</a>
        </div>
      )
    }

    if (this.state.screen === 'init') {
      return (
        <div>
          <input placeholder='Addresses to allow room' ref={this.addresses}></input>
          <button onClick={this.createRoomHandler}>Create new room</button>
          <button onClick={this.connectToRoomHandler}>Connect to room</button>
        </div>
      )
    }

    if (this.state.screen === 'chat') {
      return (
        <div>
          <ul>
            {
              this.state.messages.map(message => (
                <li key={message.time}>
                  <strong>{message.address}</strong>:{' '}
                  {message.text}
                </li>
              ))
            }
          </ul>
          <textarea ref={this.message} placeholder="Type message here"></textarea>
          <button onClick={this.sendMessage}>Send</button>
        </div>
      )
    }

  }
};

export default App;