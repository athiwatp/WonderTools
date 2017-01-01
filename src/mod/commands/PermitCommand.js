"use strict";

const Command = require('../../core/command/Command');

const systemManager = require('../../core/system/systemManager');

// -----
//  PermitCommand
// -----

class PermitCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!permit'
  }

  get name() {
    return 'Permit';
  }

  get description() {
    return 'Permit a user to post links';
  }

  get parentSystem() {
    return '$ModSystem';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    if ( request.params.length === 0 ) return;

    const modSystem = systemManager.getOne('$ModSystem');
    modSystem.permitViewerLinks(request.params[0]);

    const linksConfig = modSystem.config;
    reply(`$target has been permitted to post links for ${ linksConfig.linkPermitLength } minute(s)!`);
  }
};

// Register
module.exports = PermitCommand;