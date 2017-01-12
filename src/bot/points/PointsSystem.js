"use strict";

import System from '../core/system/System.js';
import viewerManager from '../core/viewer/viewerManager.js';
import pointsManager from './pointsManager.js';

// -----
//  PointsSystem
// -----

class PointsSystem extends System {
  constructor() {
    super();

    this._updateCount = null;
  }

  // -----
  //  Properties
  // -----

  get name() {
    return '$PointsSystem';
  }

  // -----
  //  Public
  // -----

  onNotify(event, args) {
    if ( event === 'tick' ) {
      if ( this._updateCount == null ) {
        this._updateCount = 0;
      }
      else {
        this._updateCount++;

        const targetMinutes = this.metadata.updateInterval;
        if ( this._updateCount >= targetMinutes ) {
          viewerManager.get(args.channel)
            .then((viewers) => {
              return Promise.all(viewers.map((v) => pointsManager.getOne(v.username, args.channel)));
            })
            .then((points) => {
              return Promise.all(points.map((p) => {
                p.add(this.metadata.awardAmount);
                return p.save();
              }));
            })
            .then(() => Promise.resolve(this._updateCount = 0))
            .catch((error) => {
              console.error(error);
            });
        }
      }
    }
  }
};

// Exports
export default PointsSystem;