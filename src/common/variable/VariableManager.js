"use strict";

const path = require('path');

const glob = require('glob');

const Variable = require('./Variable');

// -----
//  Fields
// -----

const FULL_VARIABLE_REGEX = /(\$\w+)((?=\s|$)|(\((.+)\)(?=\s|$)))/gi;
const VARIABLE_NAME_REGEX = /(\$\w+)/i;

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

    if ( variable.name == null || variable.name.length === 0 || variable.name.indexOf(' ') >= 0 ) {
      throw new Error('The variable must have a name that does not contain spaces!');
    }

    this._variables = this._variables.filter(v => v.name !== variable.name);
    this._variables.push(variable);
  }

  _resolveOne(name, request) {
    return new Promise((resolve, reject) => {
      const vari = this.getOne(name);
      if ( vari != null ) {
        Promise.resolve(vari.resolve(null, request))
          .then((result) => {
            resolve(result);
          });
      }
      else {
        resolve(null);
      }
    });
  }

  _replaceVariables(message, variables) {
    variables = variables || [];

    let index = -1;
    const newMessage = message.replace(FULL_VARIABLE_REGEX, (match) => {
      index++;
      if ( index <= variables.length - 1 ) {
        return variables[index];
      }

      return match;
    });

    return newMessage; 
  }

  // -----
  //  Public
  // -----

  resolve(message, request) {
    return new Promise((resolve, reject) => {
      const fullMatches = message.match(FULL_VARIABLE_REGEX);

      if ( fullMatches != null && fullMatches.length > 0 ) {
        const promises = [];

        fullMatches.forEach((match) => {
          const vnmatch = match.match(VARIABLE_NAME_REGEX);
          if ( vnmatch != null && vnmatch.length > 0 ) {
            promises.push(this._resolveOne(vnmatch[0], request));
          }
        });

        Promise.all(promises)
          .then((result) => {
            return Promise.resolve(this._replaceVariables(message, result));
          })
          .then((result) => {
            resolve(result);
          })
      }
      else {
        resolve(message);
      }
    });
  }

  getOne(name) {
    return this._variables.find((v) => {
      return `$${ v.name }` === name;
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
module.exports = VariableManager;