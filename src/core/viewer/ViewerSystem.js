"use strict";

const moment = require('moment');
const request = require('request');

const Viewer = require('./Viewer');
const System = require('../system/System');

const viewerManager = require('./viewerManager');

// -----
//  Fields
// -----

const UPDATE_TIMER = 2;

// -----
//  ViewerSystem
// -----

class ViewerSystem extends System {
  constructor() {
    super();
    
    this._lastUpdateTime = null;
  }
  
  // -----
  //  Properties
  // -----

  get name() {
    return '$ViewerSystem';
  }

  // -----
  //  Public
  // -----

  onNotify(event, args) {
    if ( event === 'tick' ) {
      let doUpdate = false;
      if ( this._lastUpdateTime == null ) {
        doUpdate = true;
      }
      else {
        const start = moment(this._lastUpdateTime);
        const end = moment(args.time);

        const duration = moment.duration(end.diff(start));
        const minutes = Math.round(duration.asMinutes());
        
        doUpdate = minutes >= UPDATE_TIMER;
      }

      if ( doUpdate === true ) {
        console.info('[ WT ] [ INFO ] Start updating viewers ....');

        this._lastUpdateTime = args.time;
        viewerManager.get(args.channel)
          .then(() => {
            console.info('[ WT ] [ INFO ] Finish updating viewers ....');
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  }
};

// Exports
module.exports = ViewerSystem;
