"use strict";

const Command = require('../../core/command/Command');

const quoteManager = require('../quoteManager');

// -----
//  DelQuoteCommand
// -----

class DelQuoteCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!delquote';
  }

  get usage() {
    return '!delquote [number]'
  }

  get name() {
    return 'Delete Quote';
  }

  get description() {
    return 'Delete a quote.';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const params = request.params;
    if ( params.length > 0 ) {
      const number = parseInt(params[0]);

      quoteManager.delete(number, request.channel)
        .then((count) => {
          console.log(count);
          if ( count == 0 ) {
            reply(`I can't find quote #${ number }. FeelsBadMan`);
          }
          else {
            reply(`I've deleted quote #${ number }. You're welcome.`);
          }
        });
    }
  }
};

// Register
module.exports = DelQuoteCommand;