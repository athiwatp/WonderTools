"use strict";

import Random from 'random-js';

import Command from '../../core/command/Command.js';

const random = Random();

// -----
//  DNDCharacterCommand
// -----

class DNDCharacterCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!wtfdnd';
  }
  
  get usage() {
    return '!wtfdnd [target]?';
  }

  get name() {
    return 'DNDCharacter';
  }

  get description() {
    return 'What the fuck DND character are you?';
  }

  get userCooldown() {
    return 60000;
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    const adjective = this.metadata.adjective[random.integer(0, this.metadata.adjective.length - 1)].toUpperCase();
    const race = this.metadata.race[random.integer(0, this.metadata.race.length - 1)].toUpperCase();
    const klass = this.metadata.class[random.integer(0, this.metadata.class.length - 1)].toUpperCase();
    const location = this.metadata.location[random.integer(0, this.metadata.location.length - 1)].toUpperCase();
    const backstory = this.metadata.backstory[random.integer(0, this.metadata.backstory.length - 1)].toUpperCase();

    reply(`$target is a FUCKING ${ adjective.toUpperCase() } ${ race } ${ klass } FROM ${ location } WHO ${ backstory}.`);
  }
};

// Register
export default DNDCharacterCommand;