"use strict";

import Variable from '../../core/variable/Variable.js';
import jackpotManager from '../jackpotManager.js';

// -----
//  JackpotVariable
// -----

class JackpotVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$jackpot';
  }

  // -----
  //  Private
  // -----

  _handle(pot, command, username, amount) {
    return new Promise((resolve, reject) => {
      switch ( command ) {
        case 'add': {
          pot.addEntry(username, amount);
          return resolve(pot.total);
        }

        case 'remove': {
          pot.removeEntry(username);
          return resolve(pot.total);
        }

        case 'empty': {
          return pot.empty();
        }
      }
    });
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    let potCommand = 'get';
    let potName = request.command;
    let potUser = (request.viewer.displayName || request.viewer.username).toLowerCase();
    let potAmount = 0;

    if ( args.length === 1 ) {
      potName = args[0];
    }
    else if ( args.length === 2 ) {
      potCommand = args[0];
      potAmount = parseInt(args[1]);
    }
    else if ( args.length === 3 ) {
      potCommand = args[0];
      potUser = args[1];
      potAmount = parseInt(args[2]);
    }
    else if ( args.length === 4 ) {
      potCommand = args[0];
      potName = args[1];
      potUser = args[2];
      potAmount = parseInt(args[3]);
    }
    else {
      return null;
    }

    if ( isNaN(potAmount) ) return null;
    if ( potName == null || potName == '' ) return null;
    if ( potUser == null || potUser == '' ) return null;

    return jackpotManager.getOne(potName, request.channel)
      .then((pot) => {
        return this._handle(pot, potCommand, potUser, potAmount);
      });
  }
};

// Exports
export default JackpotVariable;