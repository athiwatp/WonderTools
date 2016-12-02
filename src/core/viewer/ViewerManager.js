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
  // -----
  //  Private
  // -----

  _getViewerInfo(username, channel, data) {
    return new Promise((resolve, reject) => {
      username = username.toLowerCase();

      Viewer.findOne({ username })
        .then((doc) => {
          if ( doc == null ) {
            if ( data == null ) {
              api.getUser(username)
                .then((user) => {

                  const newViewer = Viewer.create({
                    userId: user.userId.toString(),
                    username: user.username,
                    displayName: user.displayName,
                    channel: channel,
                  });

                  return newViewer.save();
                })
                .then((v) => {
                  resolve(v);
                })
                .catch((error) => {
                  reject(error);
                });
            }
            else {
              const newViewer = Viewer.create(data);
              return newViewer.save();
            }
          }
          else {
            resolve(doc);
          }
        });
    });
  }

  _updateFollowing(viewer, channel) {
    return api.getUserFollowsChannel(viewer.username, channel)
      .then((follows) => {
        viewer.isFollower = follows;
        return Promise.resolve(viewer);
      });
  }

  // -----
  //  Public
  // -----

  get(channel, data) {
    return api.getChannelViewers(channel)
      .then((viewers) => {
        return Promise.all(viewers.map((v) => {
          return this._getViewerInfo(v.name, channel, data)
            .then((viewer) => {
              viewer.isModerator = v.isMod;
              return viewer.save();
            });
        }));
      })
      .then((viewers) => {
        return Promise.all(viewers.map(v => this._updateFollowing(v, channel)));
      })
      .catch((error) => {
        console.error('$ViewerManager', error);
      });
  }

  getOne(username, channel, data) {
    return this._getViewerInfo(username, channel, data)
      .then((viewer) => {
        if ( data != null ) {
          viewer.isModerator = data.isModerator;
          viewer.isSubscriber = data.isSubscriber;
          viewer.isBroadcaster = data.isBroadcaster;
        }

        return Promise.resolve(viewer);
      })
      .then((viewer) => {
        return this._updateFollowing(viewer, channel);
      })
      .then((viewer) => {
        return viewer.save();
      });
  }
};

// Exports
module.exports = ViewerManager;