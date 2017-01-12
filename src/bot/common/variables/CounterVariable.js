"use strict";

import Variable from '../../core/variable/Variable.js';
import commandManager from '../../core/command/commandManager.js';

// -----
//  CounterVariable
// -----

class CounterVariable extends Variable {
  // -----
  //  Properties
  // -----

  get name() {
    return '$counter';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    if ( args.length > 0 ) {
      const command = commandManager.getOne(args[0], request.messageType);
        
      if ( command == null ) {
        return null;
      }

      return command.metadata.counter;
    }

    return request.metadata.counter;
  }
};

// Exports
export default CounterVariable;