"use strict";

const Variable = require('../../core/variable/Variable');

// -----
//  User
// -----

class User extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return 'user';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    return request.viewer.displayName;
  }
}

// Exports
module.exports = User;