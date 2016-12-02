"use strict";

const config = require('../../../config.json');

// -----
//  System
// -----

class System {
  constructor() {}

  // -----
  //  Properties
  // -----

  get config() {
    let cfg = {};
    if ( config.systems != null ) {
      cfg = config.systems[this.name] || {};
    }

    return cfg;
  }

  get name() {
    return 'BaseSystem';
  }

  get isEnabled() {
    return true;
  }
};

// Exports
module.exports = System;