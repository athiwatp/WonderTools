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
    return '$followdate';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    const viewer = request.viewer;
    if ( viewer.followDate == null ) {
      return '';
    }

    return viewer.followDate;
  }
}

// Exports
module.exports = UserVariable;