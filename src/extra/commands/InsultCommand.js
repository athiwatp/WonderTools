"use strict";

const systemManager = require('../../core/system/systemManager');
const Command = require('../../core/command/Command');

// -----
//  DNDCharacterCommand
// -----

class DNDCharacterCommand extends Command {
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
module.exports = DNDCharacterCommand;