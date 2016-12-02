"use strict";

const Command = require('../../core/command/Command');

// -----
//  Points
// -----

class Points extends Command {
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
    const points = request.viewer.points;
    const sysConfig = this.config.system;

    reply(`$user has ${ points.amount } ${ sysConfig.name }! Rank: NO_RANK.`);
  }
};

// Register
module.exports = Points;