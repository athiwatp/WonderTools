"use strict";

const uuid = require('node-uuid');

// -----
//  Request
// -----

class Request {
  constructor(channel, message, messageType, username, plugins) {
    this._requestId = uuid.v4();
    this._channel = channel;
    this._message = message;
    this._messageType = messageType;
    this._username = username;
    this._plugins = plugins || {};
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

  get plugins() {
    return this._plugins;
  }

  get viewer() {
    return this._viewer;
  }

  get message() {
    return this._message;
  }
};

module.exports = Request;