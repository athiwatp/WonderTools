"use strict";

const Variable = require('../../core/variable/Variable');

// -----
//  UserVariable
// -----

class UserVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$user';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    return request.viewer.displayName || request.viewer.username;
  }
}

// Exports
module.exports = UserVariable;