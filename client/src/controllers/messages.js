import crypto from 'crypto-js/tripledes';
import Utf8 from 'crypto-js/enc-utf8';
import api from '../api'
import { getCommonKey } from '../store';

export const getNewMessages = async (chatId, lastMessageTime) => {
  const privKey = getCommonKey();
  const { messages } = await api.getNewMessages(chatId, lastMessageTime);

  return messages.map(m => ({
    ...m,
    text: crypto.decrypt(m.text, privKey).toString(Utf8)
  }));
}

export const sendMessage = async (chatId, text) => {
  const privKey = getCommonKey();

  const encryptedMessage = crypto.encrypt(text, privKey).toString()

  await api.sendMessage(chatId, encryptedMessage);
}