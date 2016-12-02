"use strict";

const Command = require('../../core/command/Command');

// -----
//  GivePoints
// -----

class GivePoints extends Command {
  // -----
  //  Properties
  // -----

  get usage() {
    const pointsName = (this.config.system.name || 'points').toLowerCase();
    return `!give${ pointsName } [target] [amount]`;
  }

  get name() {
    return 'GivePoints';
  }

  get description() {
    return 'Give user points to the target.';
  }

  get parentSystem() {
    return '$PointsSystem';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const pointsManager = request.plugins.pointsManager;
    const target = request.params.target;
    let amount = parseInt(request.params.amount);
    
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
        const sysConfig = this.config.system;
        reply(`${ request.viewer.displayName } has given ${target} ${ amount } ${ systemConfig.name }!`);
      })
      .catch((error) => {
        console.error(error);
        reply("I'm sorry, something went wrong. FeelsBadMan");
      });
  }
};

// Register
module.exports = GivePoints;