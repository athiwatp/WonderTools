"use strict";

import { Document } from 'camo';

// -----
//  Points
// -----

class Points extends Document {
  constructor() {
    super();

    this.username = String;
    this.channel = String;

    this.amount = {
      type: Number,
      default: 0
    };
  }

  // -----
  //  Public
  // -----

  add(amount) {
    if ( typeof(amount) === String ) amount = parseInt(amount);
    if ( isNaN(amount) ) return Promise.resolve(this);

    this.amount += amount;

    return this.save();
  }

  remove(amount) {
    if ( typeof(amount) === String ) amount = parseInt(amount);
    if ( isNaN(amount) ) return Promise.resolve(this);
    
    this.amount -= amount;
    if ( this.amount < 0 ) this.amount = 0;

    return this.save();
  }

  // -----
  //  Static
  // -----

  static collectionName() {
    return 'points';
  }
};

// Exports
export default Points;