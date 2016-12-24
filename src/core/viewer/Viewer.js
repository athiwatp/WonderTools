"use strict";

const Document = require('camo').Document;

const Command = require('../command/Command');

// -----
//  Viewer
// -----

class Viewer extends Document {
  constructor() {
    super();

    this.userId = String;
    this.username = String;
    this.displayName = String;
    this.channel = String;

    this.isModerator = {
      type: Boolean,
      default: false
    };

    this.isFollower = {
      type: Boolean,
      default: false
    };

    this.isSubscriber = {
      type: Boolean,
      default: false
    };

    this.isBroadcaster = {
      type: Boolean,
      default: false
    };

    this.lastSeen = {
      type: Date,
      default: null
    };

    this.followDate = {
      type: Date,
      default: null
    };
  }

  // -----
  //  Properties
  // -----

  get accessLevel() {
    if ( this.isBroadcaster === true ) {
      return Command.LEVEL_GOD;
    }

    if ( this.isModerator === true ) {
      return Command.LEVEL_MOD;
    }

    if ( this.isSubscriber === true ) {
      return Command.LEVEL_SUBSCRIBER;
    }

    if ( this.isFollower === true ) {
      return Command.LEVEL_FOLLOWER;
    }

    return Command.LEVEL_VIEWER;
  }
};

// Exports
module.exports = Viewer;