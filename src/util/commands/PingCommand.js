"use strict";

const Command = require('../../common/command/Command');

// -----
//  Ping
// -----

class Ping extends Command {
  constructor() {
    super();
  }

  // -----
  //  Properties
  // -----

  get usage() {
    return '!ping';
  }

  get name() {
    return 'Ping';
  }

  get description() {
    return 'Check if the bot is online or not.';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    reply('pong');
  }
};

// Register
module.exports = Ping;