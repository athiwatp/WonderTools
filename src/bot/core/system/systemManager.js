"use strict";

import path from 'path';
import glob from 'glob';

import System from './System.js';

import builtInSystems from './systems.js';

// -----
//  SystemManager
// -----

class SystemManager {
  constructor() {
    this._systems = [];
  }

  // -----
  //  Private
  // -----

  _register(system) {
    return new Promise((resolve, reject) => {
      if ( system == null ) {
        return reject(new Error('System not provided!'));
      }

      if ( system.name == null || system.name.length === 0 || system.name.indexOf(' ') >= 0 ) {
        return reject(new Error('The system must have a name that does not contain spaces!'));
      }

      this._systems = this._systems.filter(sys => sys.name !== system.name);
      this._systems.push(system);

      return system._loadMetadata()
        .then(() => {
          resolve(system); 
        })
    });
  }

  // -----
  //  Public
  // -----

  getOne(name) {
    return this._systems.find(sys => sys.name === name);
  }

  load() {
    this._systems = [];

    return new Promise((resolve, reject) => {
      const promises = [];
      builtInSystems.forEach((system) => {
        try {
          promises.push(this._register(new system()));
        }
        catch ( e ) {
          promises.push(Promise.reject(e));
        }
      });

      Promise.all(promises)
        .then(resolve)
        .catch(reject);
    });
  }

  notify(event, args) {
    this._systems.forEach((sys) => {
      if ( sys.enabled === true && typeof(sys.onNotify) === 'function' ) {
        sys.onNotify.call(sys, event, args);
      }
    });
  }
};

// Exports
export default new SystemManager();