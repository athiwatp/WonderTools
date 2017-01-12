"use strict";

import { Document } from 'camo';

// -----
//  Quote
// -----

class Quote extends Document {
  constructor() {
    super();

    this.username = String;
    this.channel = String;
    this.quote = String;
    this.number = Number;
    this.date = {
      type: Date,
      default: new Date()
    };
  }

  // -----
  //  Hooks
  // -----

  preSave() {
    return Quote.find({ channel: this.channel }, { sort: '-number' })
      .then((docs) => {
        let number = 1;
        if ( docs.length > 0 ) {
          number = docs[0].number + 1;
        }

        this.number = number;
      })    
  }
};

// Exports
export default Quote;