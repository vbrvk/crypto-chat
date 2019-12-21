import { bufferToHex } from 'ethereumjs-util';
import { Buffer } from 'buffer';
import Eth from 'ethjs';

const web3 = window.web3;

const eth = new Eth(web3.currentProvider)

class EthSigner {
  async sign(data) {
    const from = web3.eth.accounts[0];
    const msg = bufferToHex(Buffer.from(data));
    console.log('Going to sign message:', msg);

    const sign = await eth.personal_sign(msg, from);

    return sign;
  }
}

export default EthSigner