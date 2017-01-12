"use strict";

import moment from 'moment';
import { Document } from 'camo';
import CamoClient from 'camo/lib/clients/index.js';

// -----
//  Command
// -----

class Command {
  constructor() {
    this._cooldownTimers = {};
    this._metadata = {};
  }

  // -----
  //  Properties
  // -----

  get defaultMetadata() {
    return {
      messageTypes: [ 'chat' ],
      accessLevel: Command.LEVEL_VIEWER,
      cooldown: 5000,
      userCooldown: 5000,
      pointCost: 0,
      counterType: Command.COUNTER_NONE,
      enabled: true
    };
  }

  get command() {
    return this._metadata.command;
  }

  get messageTypes() {
    return this._metadata.messageTypes || [ 'chat' ];
  }

  get accessLevel() {
    return this._metadata.accessLevel || Command.LEVEL_VIEWER;
  }

  get cooldown() {
    return this._metadata.cooldown;
  }

  get userCooldown() {
    return this._metadata.userCooldown;
  }

  get pointCost() {
    return this._metadata.pointCost || this._metadata.pointCost;
  }

  get metadata() {
    return this._metadata;
  }

  get counterType() {
    return this._metadata.counterType || Command.COUNTER_NONE;
  }

  get enabled() {
    if ( this._metadata.enabled != null ) {
      return this._metadata.enabled;
    }

    return true;
  }

  get viewConfig() {
    return null;
  }

  // -----
  //  Private
  // -----

  _loadMetadata() {
    const dbClient = CamoClient.getClient();
    

    return new Promise((resolve, reject) => {
      dbClient.findOne('commandmetadata', { commandName: this.command })
        .then((metadata) => {
          if ( metadata != null ) {
            this._metadata = metadata;
            resolve(this._metadata);
          }
          else {
            dbClient.save('commandmetadata', null, { commandName: this.command })
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
      this._cooldownTimers['$global'] = now;
    }

    if ( this.userCooldown > 0 ) {
      this._cooldownTimers[username] = now;
    }
  }

  _trackCounter(increase) {
    increase = increase || 1;

    if ( !Number.isInteger(this.metadata.counter) ) {
      this._metadata.counter = 0;
    }

    this._metadata.counter += increase;
    this._metadata.save();

    return this._metadata.counter;
  }

  // -----
  //  Public
  // -----

  enable(enabled) {
    this._metadata.enabled = enabled;
    return this._metadata.save();
  }

  canExecute(viewer) {
    return viewer.accessLevel <= this.accessLevel;
  }

  onCooldown(viewer) {
    const username = viewer.username.toLowerCase();

    if ( this.cooldown <= 0 && this.userCooldown <= 0 ) {
      return false;
    }

    if ( this._metadata.bypassCooldownLevel != null && viewer.accessLevel <= this._metadata.bypassCooldownLevel ) {
      return false;
    }

    const globalCD = this.cooldown / 1000;
    const userCD = this.userCooldown / 1000;

    // Check Global Cooldown
    const now = moment();

    if ( this._cooldownTimers['$global'] != null ) {
      const lastGlobal = moment(this._cooldownTimers['$global']);
      const globalDiff = Math.round(moment.duration(now.diff(lastGlobal)).asSeconds());

      if ( globalDiff < globalCD ) {
        return moment.duration(globalCD - globalDiff, 'seconds');
      }
    } 

    // Check User Cooldown
    if ( username != null && this._cooldownTimers[username] != null ) {
      const lastUser = moment(this._cooldownTimers[username]);
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
export default Command;