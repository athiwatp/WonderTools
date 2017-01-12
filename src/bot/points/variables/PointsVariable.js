"use strict";

import Variable from '../../core/variable/Variable.js';

// -----
//  PointsVariable
// -----

class PointsVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$points';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    const points = request.viewer.points;

    return points.amount;
  }
};

// Exports
export default PointsVariable;