"use strict";

const Variable = require('../../core/variable/Variable');
const systemManager = require('../../core/system/systemManager');

// -----
//  PointsName
// -----

class PointsName extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$pointsName';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    const pointsSystem = systemManager.getOne('$PointsSystem');
    
    return pointsSystem.config.name;
  }
}

// Exports
module.exports = PointsName;