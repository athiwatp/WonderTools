"use strict";

import Command from '../../core/command/Command.js';
import systemManager from '../../core/system/systemManager.js';

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

  // -----
  //  Public
  // -----
  action(request, reply) {
    if ( request.params.length === 0 ) return;

    const modSystem = systemManager.getOne('$ModSystem');
    modSystem.permitViewerLinks(request.params[0]);

    const linksConfig = modSystem.metadata;
    reply(`$target has been permitted to post links for ${ linksConfig.linkPermitLength } minute(s)!`);
  }
};

// Register
export default PermitCommand;