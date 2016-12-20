"use strict";

const Variable = require('../../core/variable/Variable');

// -----
//  CounterVariable
// -----

class CounterVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$counter';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    return request.metadata.counter;
  }
}

// Exports
module.exports = CounterVariable;