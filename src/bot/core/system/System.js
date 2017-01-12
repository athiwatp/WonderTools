"use strict";

import CamoClient from 'camo/lib/clients/index.js';

// -----
//  System
// -----

class System {
  constructor() {
    this._metadata = {};
  }

  // -----
  //  Properties
  // -----

  get metadata() {
    return this._metadata;
  }

  get name() {
    return 'BaseSystem';
  }

  get enabled() {
    if ( this._metadata.enabled != null ) {
      return this._metadata.enabled;
    }

    return true;
  }

  // -----
  //  Private
  // -----

  _loadMetadata() {
    const dbClient = CamoClient.getClient();
    

    return new Promise((resolve, reject) => {
      dbClient.findOne('systemmetadata', { systemName: this.name })
        .then((metadata) => {
          if ( metadata != null ) {
            this._metadata = metadata;
            resolve(this._metadata);
          }
          else {
            dbClient.save('systemmetadata', null, { systemName: this.name })
              .then((metadata) => {
                this._metadata = metadata;
                resolve(this._metadata);
              });
          }
        });
    });
  }
};

// Exports
export default System;