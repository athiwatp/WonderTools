"use strict";

import request from 'request';
import cheerio from 'cheerio';
import Random from 'random-js';

import System from '../../core/system/System.js';
import viewerManager from '../../core/viewer/viewerManager.js';

const random = Random();

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

  get enabled() {
    return false;
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

        const targetMinutes = this.metadata.updateInterval;
        if ( this._updateCount >= targetMinutes ) {
          this._updateCount = 0;
          this._doInsult(args.channel, args.reply);
        }
      }
    }
  }
};

// Exports
export default InsultSystem;