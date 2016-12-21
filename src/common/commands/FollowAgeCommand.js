"use strict";

const moment = require('moment');

const Command = require('../../core/command/Command');
const viewerManager = require('../../core/viewer/viewerManager');

// -----
//  FollowAgeCommand
// -----

class FollowAgeCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!followage2';
  }

  get name() {
    return 'FollowAge';
  }

  get description() {
    return 'How long have you been following for?';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const viewer = request.viewer;

    console.log(request.username, request.channel);
    viewerManager._updateFollowing(viewer, request.channel)
      .then((viewer) => {
        if ( viewer.isFollower === false ) {
          reply("Uhh $user, you're not following. You're bad and should feel bad.");
          return;
        }

        const date = moment(viewer.followDate);
        reply(`$user, you started following on ${ date.format('dddd, MMMM Do YYYY') } (${ date.fromNow() })`);
      });
  }
};

// Register
module.exports = FollowAgeCommand;