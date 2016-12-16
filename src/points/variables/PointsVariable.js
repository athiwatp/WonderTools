"use strict";

const Variable = require('../../core/variable/Variable');

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
}

// Exports
module.exports = PointsVariable;