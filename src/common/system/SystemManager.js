"use strict";

const path = require('path');

const glob = require('glob');

const System = require('./System');

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
    if ( system == null ) {
      throw new Error('System not provided!');
    }

    if ( system.name == null || system.name.length === 0 || system.name.indexOf(' ') >= 0 ) {
      throw new Error('The system must have a name that does not contain spaces!');
    }

    this._systems = this._systems.filter(sys => sys.name !== system.name);
    this._systems.push(system);
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
      const root = path.join(path.resolve(__dirname, '..', '..'), '**', '*System.js');
      glob(root, (error, files) => {
        if ( error != null ) return reject(error);

        let err = null;
        files.forEach((file) => {
          try {
            const sysClass = require(file);
            if ( (sysClass.prototype instanceof System) === true ) {
              const sys = new sysClass();
              this._register(sys);
            }
          } 
          catch ( e ) {
            err = e;
            return;
          }
        });

        if ( err != null ) {
          reject(err);
        } 
        else {
          resolve();
        }
      });
    });
  }

  notify(event, args) {
    this._systems.forEach((sys) => {
      if ( sys.isEnabled === true && typeof(sys.onNotify) === 'function' ) {
        sys.onNotify.call(sys, event, args);
      }
    });
  }
};

// Exports
module.exports = SystemManager;