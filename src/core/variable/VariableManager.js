"use strict";

const path = require('path');

const glob = require('glob');

const Variable = require('./Variable');

// -----
//  Fields
// -----

const FULL_VARIABLE_REGEX = /(\$\w+)((?=[^(]|\s|$)|(\(([^)]*)\)(?=\s|$)))/gi;
const VARIABLE_NAME_REGEX = /(\$\w+)/i;

// -----
//  Helpers
// -----

// _variableNamesMatch()
const _variableNamesMatch = function _variableNamesMatch(a, b) {
  if ( a instanceof RegExp ) {
    return a.test(b);
  }

  return a === b;
}; //- _variableNamesMatch()

// -----
//  VariableManager
// -----

class VariableManager {
  constructor() {
    this._variables = [];
  }

  // -----
  //  Private
  // -----

  _register(variable) {
    if ( variable == null ) {
      throw new Error('Variable not provided!');
    }

    if ( typeof(variable.name) === 'string' ) {
      if ( variable.name == null || variable.name.length === 0 || variable.name.indexOf(' ') >= 0 ) {
        throw new Error('The variable must have a name that does not contain spaces!');
      }
    }
    else if ( !(variable.name instanceof RegExp) ) {
      throw new Error('The variable must have a name that does not contain spaces!');
    }

    this._variables = this._variables.filter(v => !_variableNamesMatch(v.name, variable.name));
    this._variables.push(variable);
  }

  // -----
  //  Public
  // -----

  getOne(name) {
    return this._variables.find((v) => {
      return _variableNamesMatch(v.name, name);
    });
  }

  load() {
    this._variables = [];

    return new Promise((resolve, reject) => {
      const root = path.join(path.resolve(__dirname, '..', '..'), '**', '*Variable.js');
      glob(root, (error, files) => {
        if ( error != null ) return reject(error);

        let err = null;
        files.forEach((file) => {
          try {
            const varClass = require(file);
            if ( (varClass.prototype instanceof Variable) === true ) {
              const variable = new varClass();
              this._register(variable);
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
};

// Exports
module.exports = new VariableManager();