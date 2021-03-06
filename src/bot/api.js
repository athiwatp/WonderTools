"use strict";

import request from 'request';

// -----
//  Private
// -----

// 121192290

// _getDefaultHeaders()
const _getDefaultHeaders = function _getDefaultHeaders() {
  return {
    "Accept": "application/vnd.twitchtv.v3+json",
    "Client-ID": "1waeylmp9j0i6yc3xpi8kzalqfza8ly",
  };
}; //- _getDefaultHeaders()

// -----
//  Public
// -----

// getChannelViewers()
const getChannelViewers = function getChannelViewers(channel) {
  channel = channel.replace('#', '');
  return new Promise((resolve, reject) => {
    request({
      url: `https://tmi.twitch.tv/group/user/${ channel }/chatters`,
      method: 'GET',
      headers: _getDefaultHeaders()
    }, (err, resp, body) => {
      if ( err != null ) return reject(err);

      body = JSON.parse(body);

      const chatters = body.chatters || {};
      if ( body.chatters == null ) {
        console.log('[ WT ] Failed to load chatters. Dunno what happened here.');
        return resolve([]);
      }

      const viewers = [];
      Object.keys(chatters).forEach((key) => {
        const array = chatters[key];
        array.forEach((viewer) => {
          viewers.push({
            username: viewer,
            isModerator: key.toLowerCase() !== 'viewers',
            channel
          });
        });
      });

      resolve(viewers);
    });
  });
}; //- getChannelViewers()

// getUser()
const getUser = function getUser(username) {
  const url = `https://api.twitch.tv/kraken/users/${ username }`;
  return new Promise((resolve, reject) => {
    request({
      url,
      method: 'GET',
      headers: _getDefaultHeaders()
    }, (err, resp, body) => {
      if ( err != null ) return reject(err);

      body = JSON.parse(body);
      resolve({
        userId: body._id,
        username: body.name,
        displayName: body.display_name
      });
    });
  });
}; //- getUser()

// getUserFollowsChannel()
const getUserFollowsChannel = function getUserFollowsChannel(username, channel) {
  channel = channel.replace('#', '');

  const url = `https://api.twitch.tv/kraken/users/${ username }/follows/channels/${ channel }`;
  return new Promise((resolve, reject) => {
    request({
      url,
      method: 'GET',
      headers: _getDefaultHeaders()
    }, (err, resp, body) => {
      if ( err != null ) return reject(err);

      if ( resp.statusCode === 404 ) {
        resolve(false);
      }
      else {
        resolve(new Date(JSON.parse(body).created_at));
      }
    });
  });
}; //- getUserFollowsChannel()

// Exports
export default { getChannelViewers, getUser, getUserFollowsChannel };
