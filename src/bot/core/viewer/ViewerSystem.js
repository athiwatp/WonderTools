"use strict";

import moment from 'moment';
import request from 'request';

import Viewer from './Viewer.js';
import System from '../system/System.js';

import viewerManager from './viewerManager.js';

// -----
//  Fields
// -----

const UPDATE_TIMER = 30;

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
        viewerManager._updateActiveViewers(args.channel)
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
export default ViewerSystem;
