const store = {};

export const addCommonKey = (key) => {
  store.commonKey = key.toString('hex');
}

export const getCommonKey = () => store.commonKey;