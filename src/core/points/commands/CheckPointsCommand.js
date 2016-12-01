"use strict";

const Command = require('../../command/Command');

// -----
//  CheckPoints
// -----

class CheckPoints extends Command {
  // -----
  //  Properties
  // -----

  get usage() {
    const pointsName = (this.config.system.name || 'points').toLowerCase();
    return `!check${ pointsName } [target]`;
  }

  get name() {
    return 'CheckPoints';
  }

  get description() {
    return 'Check how many points target has.';
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

    pointsManager.getOne(target, request.channel)
      .then((points) => {
        const sysConfig = this.config.system;
        reply(`${ target } currently has ${ points.amount } ${ sysConfig.name }!`);
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

// Register
module.exports = CheckPoints;