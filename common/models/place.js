'use strict';

var loopback = require('loopback');

module.exports = function(Place) {

  /**
  * Set active default false on create
  */
  Place.observe('before save', function filterProperties(ctx, next) {
    ctx.instance.active = false;
    next();
  });

  /**
  * Remote method explore
  * To find places nearby
  * @param lat
  * @param lng
  */
  Place.explore = function(lat, lng, cb) {
    // instance GeoPoint here based lat and lng
    var here = new loopback.GeoPoint({
      lat: lat,
      lng: lng
    });

    // find on places based here
    Place.find({
      where: {
        location: {
          near: here,
          maxDistance: 600,
          unit: 'meters'
        },
        active: true,
      },
      limit: 20
    }, function(err, results) {
      if (err) {
        cb(err, null);
      }
      else if(results) {
        // instance places list
        var places = [];

        // loop places
        results.forEach(function(place) {

          // calcule distance in meters
          var distance = loopback.GeoPoint.distanceBetween(here,
            place.location,
            {
              type: 'meters'
            }
          );

          // set distance
          place.distance = distance.toFixed(2);

          // added place to places
          places.push(place);
        });

        // output
        cb(null, places);

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
