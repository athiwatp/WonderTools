"use strict";

import Command from '../../core/command/Command.js';
import pointsManager from '../pointsManager.js';
import systemManager from '../../core/system/systemManager.js';

// -----
//  CheckPointsCommand
// -----

class CheckPointsCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    const pointsSystem = systemManager.getOne('$PointsSystem');
    const pointsName = (pointsSystem.metadata.name || 'points').toLowerCase();

    return `!check${ pointsName }`;
  }

  get usage() {
    const pointsSystem = systemManager.getOne('$PointsSystem');
    const pointsName = (pointsSystem.metadata.name || 'points').toLowerCase();

    return `!check${ pointsName } [target]`;
  }

  get name() {
    return 'CheckPoints';
  }

  get description() {
    return 'Check how many points target has.';
  }

  get accessLevel() {
    return Command.LEVEL_MOD;
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const target = request.params[0];

    pointsManager.getOne(target, request.channel)
      .then((points) => {
        reply(`${ target } currently has ${ points.amount } $pointsName!`);
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

// Register
export default CheckPointsCommand;