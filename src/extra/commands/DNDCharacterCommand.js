"use strict";

var Horseman = require('node-horseman');

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
    const adjective = this.config.adjective[(Math.floor(Math.random() * this.config.adjective.length) + 1 ) -1].toUpperCase();
    const race = this.config.race[(Math.floor(Math.random() * this.config.race.length) + 1 ) -1].toUpperCase();
    const klass = this.config.class[(Math.floor(Math.random() * this.config.class.length) + 1 ) -1].toUpperCase();
    const location = this.config.location[(Math.floor(Math.random() * this.config.location.length) + 1 ) -1].toUpperCase();
    const backstory = this.config.backstory[(Math.floor(Math.random() * this.config.backstory.length) + 1 ) -1].toUpperCase();

    reply(`$target is a FUCKING ${ adjective.toUpperCase() } ${ race } ${ klass } FROM ${ location } WHO ${ backstory}.`);
  }
};

// Register
module.exports = DNDCharacterCommand;