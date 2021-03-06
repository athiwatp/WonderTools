"use strict";

import Points from './Points.js';

// -----
//  PointsManager
// -----

class PointsManager {
  // -----
  //  Public
  // -----
  getOne(username, channel) {
    username = username.toLowerCase();
    channel = channel.replace('#', '');
    
    return new Promise((resolve, reject) => {
      Points.findOne({ username, channel })
        .then((doc) => {
          if ( doc == null ) {
            const newPoints = Points.create({
              amount: 0,
              username, channel,
            });

            newPoints.save()
              .then((points) => {
                resolve(points);
              })
              .catch((error) => {
                reject(error);
              });
          }
          else {
            resolve(doc);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
};

// Exports
export default new PointsManager();