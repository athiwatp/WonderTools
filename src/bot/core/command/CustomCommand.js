"use strict";

import moment from 'moment';
import { Document } from 'camo';

import Command from './Command.js';

const copyKeys = [
  'command', 'cooldown', 'userCooldown',
  'accessLevel', 'pointCost', 'counterType',
  'messageTypes'
];

// -----
//  CustomCommand
// -----

class CustomCommand extends Document {
  constructor() {
    super();

    this.command = String;
    this.reply = String;

    this.cooldown = {
      type: Number,
      default: 0
    };

    this.userCooldown = {
      type: Number,
      default: 0
    };

    this.pointCost = {
      type: Number,
      default: 0
    };

    this.accessLevel = {
      type: Number,
      default: 5
    };

    this.counterType = {
      type: Number,
      default: 1
    };

    this.messageTypes = {
      type: [ String ],
      default: [ 'chat' ]
    };
  }

  // -----
  //  Private
  // -----

  _toCommand() {
    const command = new Command();
    command.__isCustom = true;
    
    copyKeys.forEach((key) => {
      command[`_${ key }`] = this[key];
    });

    const response = this.reply;
    command.action = function customCommandAction(request, reply) {
      reply(response);
    };

    return command;
  }
};

// Exports 
export default CustomCommand;