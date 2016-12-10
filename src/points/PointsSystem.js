"use strict";

const moment = require('moment');

const System = require('../core/system/System');
const viewerManager = require('../core/viewer/viewerManager');
const pointsManager = require('./pointsManager');

// -----
//  PointSystem
// -----

class PointSystem extends System {
  constructor() {
    super();

    this._lastUpdateTime = null;
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
      if ( this._lastUpdateTime == null ) {
        this._lastUpdateTime = args.time;
      }
      else {
        const start = moment(this._lastUpdateTime);
        const end = moment(args.time);

        const duration = moment.duration(end.diff(start));
        const minutes = Math.round(duration.asMinutes());
        const targetMinutes = this.config.updateInterval / 60000;

        if ( minutes >= targetMinutes ) {
          viewerManager.get(args.channel)
            .then((viewers) => {
              return Promise.all(viewers.map((v) => pointsManager.getOne(v.username, args.channel)));
            })
            .then((points) => {
              return Promise.all(points.map((p) => {
                p.add(this.config.awardAmount);
                return p.save();
              }));
            })
            .then(() => Promise.resolve(this._lastUpdateTime = moment().valueOf()))
            .catch((error) => {
              console.error(error);
            });
        }
      }
    }
  }
};

// Exports
module.exports = PointSystem;