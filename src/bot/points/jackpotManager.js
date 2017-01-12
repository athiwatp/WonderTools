"use strict";

import Jackpot from './Jackpot.js';

// -----
//  JackpotManager
// -----

class JackpotManager {
  // -----
  //  Public
  // -----
  getOne(name, channel) {
    name = name.toLowerCase();
    channel = channel.replace('#', '');
    
    return new Promise((resolve, reject) => {
      Jackpot.findOne({ name, channel })
        .then((doc) => {
          if ( doc == null ) {
            const newPot = Jackpot.create({ name, channel });

            newPot.save()
              .then((pot) => {
                resolve(pot);
              })
              .catch((error) => {
                reject(error);
              });
          }
          else {
            resolve(doc);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
};

// Exports
export default new JackpotManager();