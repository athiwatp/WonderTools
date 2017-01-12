"use strict";

import Random from 'random-js';

import Command from '../../core/command/Command.js';
import jackpotManager from '../../points/jackpotManager.js';

const random = Random();

// -----
//  SlotsCommand
// -----

class SlotsCommand extends Command {
  // -----
  //  Properties
  // -----

  get command() {
    return '!slots2';
  }

  get name() {
    return 'Slots';
  }

  get description() {
    return 'Play some slots!';
  }

  get userCooldown() {
    return 60000;
  }

  // -----
  //  Private
  // -----

  _getRandomEmote() {
    return this.metadata.emotes[random.integer(0, this.metadata.emotes.length - 1)];
  }

  // -----
  //  Public
  // -----
  action(request, reply) {
    jackpotManager.getOne('$SlotsJackpot', request.channel)
      .then((pot) => {
        return pot.addEntry(request.username, this.metadata.pointCost);
      })
      .then((pot) => {
        const rolled = [ this._getRandomEmote(), this._getRandomEmote(), this._getRandomEmote() ];
        if ( rolled.every((val, i, arr) => val === arr[0] ) ) {
          request.viewer.points.add(pot.total)
            .then(() => pot.empty())
            .then((total) => {
              reply(`${ rolled.join(' ') } rolled by $user and won the jackpot of ${ total } $pointsName!! FeelsGoodMan`);
            });
        }
        else {
          reply(`${ rolled.join(' ') } rolled by $user and added ${ this.metadata.pointCost } $pointsName to the jackpot of ${ pot.total }!`);
        }
      });
  }
};

// Register
export default SlotsCommand;