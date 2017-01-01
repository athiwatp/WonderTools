"use strict";

const random = require('random-js')();

const Command = require('../../core/command/Command');

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
    const adjective = this.config.adjective[random.integer(0, this.config.adjective.length - 1)].toUpperCase();
    const race = this.config.race[random.integer(0, this.config.race.length - 1)].toUpperCase();
    const klass = this.config.class[random.integer(0, this.config.class.length - 1)].toUpperCase();
    const location = this.config.location[random.integer(0, this.config.location.length - 1)].toUpperCase();
    const backstory = this.config.backstory[random.integer(0, this.config.backstory.length - 1)].toUpperCase();

    reply(`$target is a FUCKING ${ adjective.toUpperCase() } ${ race } ${ klass } FROM ${ location } WHO ${ backstory}.`);
  }
};

// Register
module.exports = DNDCharacterCommand;