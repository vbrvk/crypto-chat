import got from 'got';

const request = got.extend({
  prefixUrl: 'localhost:3060/',
  responseType: 'json'
})

const API = {

};

export default API;
