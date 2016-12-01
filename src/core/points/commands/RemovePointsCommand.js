"use strict";

const Command = require('../../command/Command');

// -----
//  RemovePoints
// -----

class RemovePoints extends Command {
  // -----
  //  Properties
  // -----

  get usage() {
    const pointsName = (this.config.system.name || 'points').toLowerCase();
    return `!remove${ pointsName } [target] [amount]`;
  }

  get name() {
    return 'RemovePoints';
  }

  get description() {
    return 'Remove points from a user.';
  }

  get parentSystem() {
    return '$PointsSystem';
  }

  get accessLevel() {
    return Command.LEVEL_MOD;
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

    pointsManager.getOne(target, request.channel)
      .then((points) => {
        if ( points.amount < amount ) {
          amount = points.amount;
        }
        
        points.remove(amount)
          .then(() => {
            const sysConfig = this.config.system;
            reply(`I've removed ${ amount } ${ sysConfig.name } from ${ target }!`);
          })
          .catch((error) => {
            console.error(error);
            reply("I'm sorry, something went wrong. FeelsBadMan");
          });
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

// Register
module.exports = RemovePoints;