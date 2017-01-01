"use strict";

const commandManager = require('../../core/command/commandManager');
const Command = require('../../core/command/Command');

// -----
//  AddCmdCommand
// -----

class AddCmdCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!addcmd';
  }

  get usage() {
    return '!addcmd [name] "[response]" [--flags]'
  }

  get name() {
    return 'AddCommand';
  }

  get description() {
    return 'Add a command to the bot';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const params = request.params;
    if ( params.length < 2 ) {
      reply(`USAGE: ${ this.usage }`);
      return;
    }

    const commandData = {
      command: params[0],
      reply: params[1],
      counterType: parseInt(params.flags['counterType']) || Command.COUNTER_NONE,
      accessLevel: parseInt(params.flags['accessLevel']) || Command.LEVEL_VIEWER,
      cooldown: parseInt(params.flags['cooldown']) || 0,
      userCooldown: parseInt(params.flags['userCooldown']) || 0,
      pointCost: parseInt(params.flags['pointCost']) || 0
    };

    // Create our command
    commandManager._createCustomCommand(commandData)
      .then((command) => {
        reply(`I've successfully created the ${ command.command } command. You're welcome.`);
      })
      .catch((error) => {
        console.error(error);
        reply('Dang it! I screwed up trying to create this command. Sorry homie!');
      });
  }
};

// Register
module.exports = AddCmdCommand;