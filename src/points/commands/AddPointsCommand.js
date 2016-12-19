"use strict";

const Command = require('../../core/command/Command');
const pointsManager = require('../pointsManager');

// -----
//  AddPointsCommand
// -----

class AddPointsCommand extends Command {
  // -----
  //  Properties
  // -----

  get usage() {
    const pointsName = (this.config.system.name || 'points').toLowerCase();
    return `!add${ pointsName } [target] [amount]`;
  }

  get name() {
    return 'AddPoints';
  }

  get description() {
    return 'Add points to a user.';
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
    const target = request.params[0];
    let amount = parseInt(request.params[1]);
    
    if ( isNaN(amount) ) {
      reply("That's not a number, what am I supposed to do with that?");
      return;
    }

    pointsManager.getOne(target, request.channel)
      .then((points) => {
        points.add(amount)
          .then(() => {
            const sysConfig = this.config.system;
            reply(`I've added ${ amount } $pointsName to ${ target }!`);
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
module.exports = AddPointsCommand;