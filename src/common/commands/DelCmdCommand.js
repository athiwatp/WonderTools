"use strict";

const commandManager = require('../../core/command/commandManager');
const Command = require('../../core/command/Command');

// -----
//  DelCmdCommand
// -----

class DelCmdCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!delcmd';
  }

  get usage() {
    return '!addcmd [name]'
  }

  get name() {
    return 'DeleteCommand';
  }

  get description() {
    return 'Delete a custom command.';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const params = request.params;
    if ( params.length < 1 ) {
      reply(`USAGE: ${ this.usage }`);
      return;
    }

    const commandName = params[0];
    commandManager._removeCustomCommand(commandName)
      .then((result) => {
        console.log('hi');
        reply(`I've successfully removed the ${ commandName } command. You're welcome.`);
      })
      .catch((result) => {
        reply('Dang it! I screwed up trying to remove this command. Sorry homie!');
      });
  }
};

// Register
module.exports = DelCmdCommand;