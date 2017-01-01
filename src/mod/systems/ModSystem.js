"use strict";

const moment = require('moment');
const isUrl = require('validator/lib/isUrl');

const System = require('../../core/system/System');
const viewerManager = require('../../core/viewer/viewerManager');

// -----
//  ModSystem
// -----

class ModSystem extends System {
  constructor() {
    super();

    this._permitList = [];
  }

  // -----
  //  Properties
  // -----

  get name() {
    return '$ModSystem';
  }

  // -----
  //  Private
  // -----

  _isLinkPermitActive(info) {
    const now = moment();
    const duration = moment.duration(now.diff(info.expires));

    return duration.asMinutes() <= this.config.linkPermitLength;
  }

  _isViewerLinkPermitted(username) {
    const permitted = this._permitList.find((item) => {
      return item.username === username;
    });

    if ( permitted != null ) {
      return this._isLinkPermitActive(permitted);
    }

    return false;
  }

  // -----
  //  Public
  // -----

  permitViewerLinks(username) {
    username = username.toLowerCase();

    const permitted = this._permitList.find((item) => {
      return item.username === username;
    });

    if ( permitted != null ) {
      permitted.expires = moment();
    }
    else {
      this._permitList.push({
        username,
        expires: moment()
      });
    }
  }

  hasLinks(text, viewer) {
    const linksConfig = this.config;

    if ( linksConfig.blockLinks !== true ) return false;
    if ( linksConfig.linkBypassLevel != null && viewer.accessLevel <= linksConfig.linkBypassLevel ) return false;
    if ( this._isViewerLinkPermitted(viewer.username) === true ) return false;

    const parts = text.split(' ');
    return parts.some((item) => isUrl(item));
  }

  onNotify(event, args) {
    this._permitList = this._permitList.filter((item) => {
      return this._isLinkPermitActive(item);
    });
  }
};

// Exports
module.exports = ModSystem;