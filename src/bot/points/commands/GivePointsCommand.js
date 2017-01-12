"use strict";

import Command from '../../core/command/Command.js';
import pointsManager from '../pointsManager.js';
import systemManager from '../../core/system/systemManager.js';

// -----
//  GivePointsCommand
// -----

class GivePointsCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    const pointsSystem = systemManager.getOne('$PointsSystem');
    const pointsName = (pointsSystem.metadata.name || 'points').toLowerCase();

    return `!give${ pointsName }`;
  }

  get usage() {
    const pointsSystem = systemManager.getOne('$PointsSystem');
    const pointsName = (pointsSystem.metadata.name || 'points').toLowerCase();

    return `!give${ pointsName } [target] [amount]`;
  }

  get name() {
    return 'GivePoints';
  }

  get description() {
    return 'Give user points to the target.';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const target = request.params[0];
    let amount = parseInt(request.params[1]);
    
    if ( isNaN(amount) ) {
      reply("That's not a number, what am I supposed to do with that?");
      return;
    }

    const userPoints = request.viewer.points
    if ( userPoints.amount < amount ) {
      amount = userPoints.amount;
    }

    pointsManager.getOne(target, request.channel)
      .then((targetPoints) => {
        return Promise.all([ 
          targetPoints.add(amount), 
          userPoints.remove(amount) 
        ]);
      })
      .then(() => {
        reply(`$user has given ${ target } ${ amount } $pointsName!`);
      })
      .catch((error) => {
        console.error(error);
        reply("I'm sorry, something went wrong. FeelsBadMan");
      });
  }
};

// Register
export default GivePointsCommand;