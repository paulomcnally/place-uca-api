'use strict';

var loopback = require('loopback');

module.exports = function(Place) {

  Place.explore = function(lat, lng, cb) {
    // instance GeoPoint here based lat and lng
    var here = new loopback.GeoPoint({
      lat: lat,
      lng: lng
    });

    // find on venues based here
    Place.find({
      where: {
        location: {
          near: here,
          maxDistance: 600,
          unit: 'meters'
        }
      },
      limit: 20
    }, function(err, results) {
      if (err) {
        cb(err, null);
      }
      else if(results) {
        // instance venues list
        var venues = [];

        // loop venues
        results.forEach(function(venue) {

          // calcule distance in meters
          var distance = loopback.GeoPoint.distanceBetween(here,
            venue.location,
            {
              type: 'meters'
            }
          );

          // set distance
          venue.distance = distance.toFixed(2);

          // added venue to venues
          venues.push(venue);
        });

        // output
        cb(null, venues);

      }
      else {
        cb(null, []);
      }
    });
  };

  // definde remote method
  Place.remoteMethod(
    'explore',
    {
      accepts: [
        {
          arg: 'lat',
          type: 'number',
          required: true
        },
        {
          arg: 'lng',
          type: 'number',
          required: true
        }
      ],
      returns: {
        root: true,
        type: 'object'
      }
    }
  );


};
