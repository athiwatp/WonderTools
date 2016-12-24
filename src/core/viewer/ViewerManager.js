"use strict";

const moment = require('moment');

const Viewer = require('./Viewer');
const api = require('../../api');

// -----
//  ViewerManager
// -----

// *** 
// TODO: This whole file needs a clean up
// ***
class ViewerManager {
  constructor() {
    this._activeViewers = {};
  }

  // -----
  //  Private
  // -----

  _findAndUpdateViewer(viewer) {
    const username = viewer.username.toLowerCase();
    const channel = viewer.channel.replace('#', '').toLowerCase();
    
    return Viewer.findOne({ username, channel })
      .then((v) => {
        let foundViewer = v;
        if ( foundViewer != null ) {
          for ( var key in viewer ) {
            foundViewer[key] = viewer[key];
          }
        }
        else {
          foundViewer = Viewer.create(viewer);
        }

        return foundViewer.save();
      });
  }

  _updateFollowing(viewer, channel) {
    channel = channel.replace('#', '');

    return api.getUserFollowsChannel(viewer.username, channel)
      .then((follows) => {
        if ( follows === false ) {
          viewer.isFollower = follows;
          viewer.followDate = null;
        }
        else {
          viewer.isFollower = true;
          viewer.followDate = follows;
        }

        return viewer.save();
      });
  }

  _updateActiveViewers(channel) {
    channel = channel.replace('#', '');

    return api.getChannelViewers(channel)
      .then((viewers) => {
        return Promise.all(viewers.map((v) => this._trackActive(v.username, channel, true, v)));
      })
      .catch((error) => {
        console.error('$ViewerManager', error);
      });
  }

  _trackActive(username, channel, active, data, setLastSeen) {
    data = data || {};
    channel = channel.replace('#', '');

    const viewer = Object.assign(data, { username, channel });
    if ( setLastSeen === true ) viewer.lastSeen = new Date();

    return this._findAndUpdateViewer(viewer)
      .then((viewer) => {
        this._activeViewers[channel] = (this._activeViewers[channel] || []).filter((v) => {
          return v.username.toLowerCase() !== viewer.username.toLowerCase();
        });

        if ( active === true ) {
          this._activeViewers[channel].push(viewer);
        }

        return Promise.resolve(viewer);
      });
  }

  // -----
  //  Public
  // -----
  
  get(channel) {
    channel = channel.replace('#', '');
    const viewers = this._activeViewers[channel] || [];

    return Promise.resolve(viewers);
  }

  getOne(username, channel) {
    channel = channel.replace('#', '');
    const viewers = this._activeViewers[channel] || [];

    return new Promise((resolve, reject) => {
      resolve(viewers.find((v) => v.username.toLowerCase() === username.toLowerCase()));
    });
  }

  getActive(channel) {
    return this.get(channel)
      .then((viewers) => {
        try {
          const now = moment();
          const active = viewers.filter((v) => {
            if ( v.lastSeen == null ) return false;

            const lastSeen = moment(v.lastSeen);
            const duration = moment.duration(now.diff(lastSeen));

            return duration.asMinutes() <= 5;
          });

          return Promise.resolve(active);
        } catch ( e ) {
          console.error('viewerManager', e);
          return Promise.reject(e);
        }
      });
  }
};

// Exports
module.exports = new ViewerManager();