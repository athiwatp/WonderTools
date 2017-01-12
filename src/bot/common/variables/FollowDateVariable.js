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
};

// Exports
export default UserVariable;