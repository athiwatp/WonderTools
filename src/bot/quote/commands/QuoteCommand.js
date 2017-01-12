"use strict";

import moment from 'moment';

import Command from '../../core/command/Command.js';
import quoteManager from '../quoteManager.js';

// -----
//  QuoteCommand
// -----

class QuoteCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!quote';
  }

  get usage() {
    return '!quote [number]?'
  }

  get name() {
    return 'Get Quote';
  }

  get description() {
    return 'Get a quote.';
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const params = request.params;
    let number = null;

    if ( params.length >= 1 ) {
      number = parseInt(params[0]);
    }

    quoteManager.getOne(number, request.channel)
      .then((quote) => {
        if ( quote == null ) return;
        
        const date = moment(quote.date);
        reply(`#${ quote.number }: "${ quote.quote }" -${ quote.username } (${ date.format('MMM D, YYYY') })`);
      });
  }
};

// Register
export default QuoteCommand;