"use strict";

const Command = require('../../core/command/Command');

// -----
//  CounterCommand
// -----

class CounterCommand extends Command {
  // -----
  //  Properties
  // -----

  get usage() {
    return '!counter';
  }

  get name() {
    return 'Counter';
  }

  get description() {
    return 'Counter test';
  }

  get counterType() {
    return Command.COUNTER_AUTOMATIC;
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    reply('This command has been called $counter times!');
  }
};

// Register
module.exports = CounterCommand;