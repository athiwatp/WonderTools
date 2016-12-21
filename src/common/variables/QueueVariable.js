"use strict";

const Variable = require('../../core/variable/Variable');

// -----
//  QueueVariable
// -----

class QueueVariable extends Variable {
  constructor() {
    super();

    this._queues = {};
  }
  // -----
  //  Properties
  // -----

  get name() {
    return '$queue';
  }

  // -----
  //  Public
  // -----

  resolve(args, request) {
    if ( args.length === 0 ) {
      return null;
    }

    const queueCommand = args[0].toLowerCase();
    let queueName = request.command;
    let queuer = request.viewer.username;

    if ( args.length >= 2 ) {
      queueName = args[1].toLowerCase();
    }

    if ( args.length >= 3 ) {
      queuer = args[2].toLowerCase();
    }

    if ( this._queues[queueName] == null ) {
      this._queues[queueName] = [];
    }

    switch ( queueCommand ) {
      case 'add': {
        this._queues[queueName].push(queuer);
        return this._queues[queueName].length;
      }

      case 'pop': {
        return this._queues[queueName].shift();
      }

      case 'remove': {
        this._queues[queueName].filter((u) => u !== queuer);
        return this._queues[queueName].length;
      }
    }
  }
}

// Exports
module.exports = QueueVariable;