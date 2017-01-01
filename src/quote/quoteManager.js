"use strict";

const random = require('random-js')();

const Quote = require('./Quote');

// -----
//  QuoteManager
// -----

class QuoteManager {
  // -----
  //  Private
  // -----

  _getByNumber(number, channel) {
    return Quote.findOne({ number, channel });
  }

  _getRandomQuote(channel) {
    return Quote.find({ channel })
      .then((docs) => {
        const number = random.integer(0, docs.length - 1);
        return Promise.resolve(docs[number]);
      });
  }

  // -----
  //  Public
  // -----

  getOne(number, channel) {
    channel = channel.replace('#', '');

    if ( number != null ) {
      return this._getByNumber(number, channel);
    }

    return this._getRandomQuote(channel);
  }

  add(username, quote, channel) {
    channel = channel.replace('#', '');

    const doc = Quote.create({ username, quote, channel });
    return doc.save();
  }

  delete(number, channel) {
    channel = channel.replace('#', '');

    if ( number == null ) {
      return Promise.resolve(0);
    }

    return Quote.deleteOne({ number, channel });
  }
};

// Exports
module.exports = new QuoteManager();