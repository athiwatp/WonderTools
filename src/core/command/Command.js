"use strict";

const moment = require('moment');
const _ = require('lodash');

const Document = require('camo').Document;

const config = require('../../../config.json');

// -----
//  CommandMetadata
// -----

class CommandMetadata extends Document {
  constructor() {
    super();

    this.commandName = String;

    this.counter = {
      type: Number,
      default: 0
    };
  }
};

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

  get metadata() {
    return this._metadata;
  }

  get counterType() {
    return Command.COUNTER_NONE;
  }

  // -----
  //  Private
  // -----

  _loadMetadata() {
    return new Promise((resolve, reject) => {
      CommandMetadata.findOne({ commandName: this.command })
        .then((metadata) => {
          if ( metadata != null ) {
            this._metadata = metadata;
            resolve(this._metadata);
          }
          else {
            CommandMetadata.create({ 
              commandName: this.command 
            }).save()
              .then((metadata) => {
                this._metadata = metadata;
                resolve(this._metadata);
              });
          }
        });
    });
  }

  _trackCooldown(username) {
    const now = moment().valueOf();

    if ( this.cooldown > 0 ) {
      this._cooldown['$global'] = now;
    }

    if ( this.userCooldown > 0 ) {
      this._cooldown[username] = now;
    }
  }

  _trackCounter(increase) {
    increase = increase || 1;

    this.metadata.counter += increase;
    this.metadata.save();

    return this.metadata.counter;
  }

  // -----
  //  Public
  // -----

  canExecute(viewer) {
    return viewer.accessLevel <= this.accessLevel;
  }

  onCooldown(username) {
    if ( this.cooldown <= 0 && this.userCooldown <= 0 ) {
      return false;
    }

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

  static get COUNTER_NONE() {
    return 1;
  }

  static get COUNTER_AUTOMATIC() {
    return 2;
  }

  static get COUNTER_MANUAL() {
    return 3;
  }
};

// Exports 
module.exports = Command;