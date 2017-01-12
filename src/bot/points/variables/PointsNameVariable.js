"use strict";

import Variable from '../../core/variable/Variable.js';
import systemManager from '../../core/system/systemManager.js';

// -----
//  PointsNameVariable
// -----

class PointsNameVariable extends Variable {
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

    return pointsSystem.metadata.name || 'Points';
  }
};

// Exports
export default PointsNameVariable;