"use strict";

const uuid = require('node-uuid');

// -----
//  Request
// -----

class Request {
  constructor(channel, message, messageType, username) {
    this._requestId = uuid.v4();
    this._channel = channel;
    this._message = message;
    this._messageType = messageType;
    this._username = username;

    this._viewer = null;
    this._command = null;
    this._params = null;
  }

  // -----
  //  Properties
  // -----

  get requestId() {
    return this._requestId;
  }

  get channel() {
    return this._channel;
  }

  get command() {
    return this._command;
  }

  get params() {
    return this._params;
  }

  get messageType() {
    return this._messageType;
  }

  get username() {
    return this._username;
  }

  get viewer() {
    return this._viewer;
  }

  get message() {
    return this._message;
  }

  get config() {
    return this._config;
  }
};

module.exports = Request;