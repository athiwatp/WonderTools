"use strict";

const request = require('request');
const cheerio = require('cheerio');
const random = require('random-js')();

const System = require('../../core/system/System');
const viewerManager = require('../../core/viewer/viewerManager');

// -----
//  InsultSystem
// -----

class InsultSystem extends System {
  constructor() {
    super();

    this._updateCount = null;
  }

  // -----
  //  Properties
  // -----

  get name() {
    return '$InsultSystem';
  }

  // -----
  //  Private
  // -----

  _doInsult(channel, reply) {
    viewerManager.getActive(channel)
      .then((viewers) => {
        if ( viewers == null || viewers.length === 0 ) return;

        const viewer = viewers[random.integer(0, viewers.length - 1)];

        this._getInsult()
          .then((insult) => {
            reply(`Hey ${ viewer.displayName || viewer.username } - ${ insult }`);
          });
      });
  }

  _getInsult() {
    return new Promise((resolve, reject) => {
      request('http://www.randominsults.net/', (err, resp, body) => {
        const $ = cheerio.load(body);
        const insult = $('table[bordercolor="#000000"] strong i').text();

        resolve(insult);
      });
    });
  }

  // -----
  //  Public
  // -----

  onNotify(event, args) {
    if ( this.enabled === false ) return;
    
    if ( event === 'tick' ) {
      if ( this._updateCount == null ) {
        this._updateCount = 0;
        setTimeout(() => this._doInsult(args.channel, args.reply), 5000);
      }
      else {
        this._updateCount++;

        const targetMinutes = this.config.updateInterval;
        if ( this._updateCount >= targetMinutes ) {
          this._updateCount = 0;
          this._doInsult(args.channel, args.reply);
        }
      }
    }
  }
};

// Exports
module.exports = InsultSystem;