"use strict";

const moment = require('moment');
const _ = require('lodash');

const config = require('../../../config.json');

// -----
//  Command
// -----

class Command {
  constructor() {
    this._cooldown = {};
  }

  // -----
  //  Properties
  // -----

  get config() {
    let cfg = {};
    if ( config.commands != null ) {
      const globalConfig = config.commands.$global || {};
      const cmdConfig = config.commands[this.name.toLowerCase()] || {};

      cfg = _.merge(cfg, globalConfig, cmdConfig);
    }

    if ( config.systems != null && this.parentSystem != null && this.parentSystem.length > 0 ) {
      let syscfg = config.systems[this.parentSystem] || {};
      cfg = _.merge(cfg, { system: syscfg });
    }

    return cfg;
  }

  get command() {
    return this._command;
  }

  get params() {
    return this._params;
  }

  get messageTypes() {
    return [ 'chat' ];
  }

  get accessLevel() {
    return Command.LEVEL_VIEWER;
  }

  get cooldown() {
    return this.config.cooldown;
  }

  get userCooldown() {
    return this.config.userCooldown;
  }

  get pointCost() {
    return this.config.pointCost;
  }

  // -----
  //  Private
  // -----

  _trackCooldown(username) {
    const now = moment().valueOf();

    if ( this.cooldown > 0 ) {
      this._cooldown['$global'] = now;
    }

    if ( this.userCooldown > 0 ) {
      this._cooldown[username] = now;
    }
  }

  // -----
  //  Public
  // -----

  canExecute(viewer) {
    return viewer.accessLevel <= this.accessLevel;
  }

  onCooldown(viewer) {
    if ( this.cooldown <= 0 && this.userCooldown <= 0 ) {
      return false;
    }

    const username = viewer.username;
    const globalCD = this.cooldown / 1000;
    const userCD = this.userCooldown / 1000;

    // Check Global Cooldown
    const now = moment();

    if ( this._cooldown['$global'] != null ) {
      const lastGlobal = moment(this._cooldown['$global']);
      const globalDiff = Math.round(moment.duration(now.diff(lastGlobal)).asSeconds());

      if ( globalDiff < globalCD ) {
        return moment.duration(globalCD - globalDiff, 'seconds');
      }
    } 

    // Check User Cooldown
    if ( username != null && this._cooldown[username] != null ) {
      const lastUser = moment(this._cooldown[username]);
      const userDiff = Math.round(moment.duration(now.diff(lastUser)).asSeconds());

      if ( userDiff < userCD ) {
        return moment.duration(userCD - userDiff, 'seconds');
      }
    }

    return false;
  }

  action() {
    return Promise.resolve(true);
  }

  // -----
  //  Static
  // -----

  static get LEVEL_GOD() {
    return 1;
  }

  static get LEVEL_MOD() {
    return 2;
  }

  static get LEVEL_SUBSCRIBER() {
    return 3;
  }

  static get LEVEL_FOLLOWER() {
    return 4;
  }

  static get LEVEL_VIEWER() {
    return 5;
  }
};

// Exports 
module.exports = Command;