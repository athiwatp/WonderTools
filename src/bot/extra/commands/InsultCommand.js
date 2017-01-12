"use strict";

import Command from '../../core/command/Command.js';
import systemManager from '../../core/system/systemManager.js';

// -----
//  InsultCommand
// -----

class InsultCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!insult';
  }

  get name() {
    return 'Insult';
  }

  get description() {
    return 'Insult yourself!';
  }

  get userCooldown() {
    return 60000;
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const insultSystem = systemManager.getOne('$InsultSystem');
    insultSystem._getInsult()
      .then((insult) => {
        reply(`Hey $user - ${ insult }`);
      });
  }
};

// Register
export default InsultCommand;