"use strict";

const Command = require('../../core/command/Command');

// -----
//  PointsCommand
// -----

class PointsCommand extends Command {
  // -----
  //  Properties
  // -----

  get usage() {
    const pointsName = (this.config.system.name || 'points').toLowerCase();
    return `!${ pointsName }`;
  }

  get name() {
    return 'Points';
  }

  get description() {
    return 'Check how many points you have';
  }

  get parentSystem() {
    return '$PointsSystem';
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
module.exports = PointsCommand;