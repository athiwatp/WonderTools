"use strict";

const path = require('path');
const connect = require('camo').connect;

const client = require('./src/client');

const uri = `nedb://${ path.join(__dirname, 'data', 'store.db') }`;
connect(uri)
  .then(client.connect)
  .catch((e) => {
    console.error(e);
  });