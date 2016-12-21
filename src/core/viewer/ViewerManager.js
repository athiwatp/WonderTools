"use strict";

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
    const username = viewer.username;
    const channel = viewer.channel.replace('#', '');
    
    return Viewer.findOne({ username, channel })
      .then((v) => {
        let foundViewer = v;
        if ( v != null ) {
          for ( var key in foundViewer ) {
            v[key] = foundViewer[key];
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

  _trackActive(username, channel, active, data) {
    data = data || {};
    channel = channel.replace('#', '');

    const viewer = Object.assign(data, { username, channel });
    if ( active ) viewer.lastSeen = Date.now();

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
};

// Exports
module.exports = new ViewerManager();