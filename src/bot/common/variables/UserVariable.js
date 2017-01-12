"use strict";

import Variable from '../../core/variable/Variable.js';

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
};

// Exports
export default UserVariable;