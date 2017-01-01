"use strict";

const Command = require('../../core/command/Command');

const viewerManager = require('../../core/viewer/viewerManager');
const quoteManager = require('../quoteManager');

// -----
//  AddQuoteCommand
// -----

class AddQuoteCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!addquote';
  }

  get usage() {
    return '!addquote [user] "[quote]"'
  }

  get name() {
    return 'Add Quote';
  }

  get description() {
    return 'Add a quote.';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const params = request.params;
    const channel = request.channel;
    let username = params[0];
    let quote = params[1];

    if ( params.length > 2 ) {
      quote = params.slice(1).join(' ');
    }

    viewerManager.getOne(username, channel)
      .then((viewer) => {
        if ( viewer != null ) {
          username = viewer.displayName || username;
        }

        quoteManager.add(username, quote, channel)
          .then((doc) => {
            reply(`I've added quote #${ doc.number } to the database. You're welcome.`);
          });
      });
  }
};

// Register
module.exports = AddQuoteCommand;