"use strict";

import Command from '../../core/command/Command.js';
import systemManager from '../../core/system/systemManager.js';

// -----
//  PointsCommand
// -----

class PointsCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    const pointsSystem = systemManager.getOne('$PointsSystem');
    const pointsName = (pointsSystem.metadata.name || 'points').toLowerCase();
    
    console.log(pointsName);

    return `!${ pointsName }`;
  }

  get name() {
    return 'Points';
  }

  get description() {
    return 'Check how many points you have';
  }

  get userCooldown() {
    return 5000;
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    reply(`$user has $points $pointsName!`);
  }
};

// Register
export default PointsCommand;