"use strict";

const Command = require('../../core/command/Command');

// -----
//  ActiveCommand
// -----

class ActiveCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!active?';
  }

  get name() {
    return 'Active?';
  }

  get description() {
    return 'Check if WonderToys (the Bot) is online';
  }

  get cooldown() {
    return 30000;
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    reply(`WonderToys (the Bot) powers are activated!`);
  }
};

// Register
module.exports = ActiveCommand;