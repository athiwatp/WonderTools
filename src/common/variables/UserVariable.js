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
    return request.viewer.displayName;
  }
}

// Exports
module.exports = UserVariable;