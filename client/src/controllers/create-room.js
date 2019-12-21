import Api from '../api'

const api = new Api();

const createRoom = async (addresses) => {
  const { id } = await api.createChatRoom(addresses);

  window.history.pushState({ chatId: id }, 'Chat room', `./${id}`);

  return id;
}

export default createRoom;