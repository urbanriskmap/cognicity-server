/**
 * testCAP module
 * @module test/testCAP
 * A module to test the CAP data format utility
 */

import * as test from 'unit.js'; // Unit testing module
import Cap from '../lib/cap';    // Cap formatter helper


/**
 * Test CAP data format utility
 * @alias module:test/testCAP
 * @param {Object} logger - CogniCity Server logger object
 */
export default function(logger) {
  describe('CAP Utility', function() {
    const cap = new Cap(logger); // Setup our cap formatter

    // dummy data (polygon)
    let feature = {'type': 'Feature',
                  'geometry':
                    {'type': 'Polygon',
                    'coordinates': [
                      [[106.8367359996, -6.2305420003],
                      [106.8367039999, -6.2307239997],
                      [106.8367995401, -6.2301399095],
                      [106.8367359996, -6.2305420003]]]},
                    'properties':
                      {'area_id': '1346',
                      'geom_id': '3171100002004000',
                      'area_name': 'RW 04',
                      'parent_name': 'KUNINGAN TIMUR',
                      'city_name': 'Jakarta',
                      'state': 4,
                      'last_updated': '2017-03-31T02:45:52.574Z',
                    },
                  };

    // Test geometry string creation
    it('Can create polygon strings from geojson features', function(done) {
      cap.createArea(feature);
      let result = cap.createArea(feature);
      test.value(typeof(result.polygon[0])).is('string');
      done();
    });

    // dummy data (multipolygon)
    feature = {'type': 'Feature',
              'geometry':
                {'type': 'MultiPolygon',
                'coordinates': [
                  [[[106.8367359996, -6.2305420003],
                  [106.8367039999, -6.2307239997],
                  [106.8367995401, -6.2301399095],
                  [106.8367359996, -6.2305420003]]]]},
                'properties':
                  {'area_id': '1346',
                  'geom_id': '3171100002004000',
                  'area_name': 'RW 04',
                  'parent_name': 'KUNINGAN TIMUR',
                  'city_name': 'Jakarta',
                  'state': 4,
                  'last_updated': '2017-03-31T02:45:52.574Z',
                },
              };

    // Test multigeometry string creation
    it('Will operate on multipolygon objects', function(done) {
      let result = cap.createArea(feature);
      test.value(typeof(result.polygon[0])).is('string');
      done();
    });

    // Test level severe
    it('Create the correct severity levels', function(done) {
      // dummy data (polygon)
      let feature = {'type': 'Feature',
                    'geometry':
                      {'type': 'Polygon',
                      'coordinates': [
                        [[106.8367359996, -6.2305420003],
                        [106.8367039999, -6.2307239997],
                        [106.8367995401, -6.2301399095],
                        [106.8367359996, -6.2305420003]]]},
                      'properties':
                        {'area_id': '1346',
                        'geom_id': '3171100002004000',
                        'area_name': 'RW 04',
                        'parent_name': 'KUNINGAN TIMUR',
                        'city_name': 'Jakarta',
                        'state': 4,
                        'last_updated': '2017-03-31T02:45:52.574Z',
                      },
                    };

      let result = cap.createInfo(feature);
      test.value(result.severity).is('Severe');
      done();
    });

    // Test level moderate
    it('Create the correct severity levels', function(done) {
      // dummy data (polygon)
      let feature = {'type': 'Feature',
                    'geometry':
                      {'type': 'Polygon', 'coordinates': [
                        [[106.8367359996, -6.2305420003],
                        [106.8367039999, -6.2307239997],
                        [106.8367995401, -6.2301399095],
                        [106.8367359996, -6.2305420003]]]},
                    'properties': {'area_id': '1346',
                                  'geom_id': '3171100002004000',
                                  'area_name': 'RW 04',
                                  'parent_name': 'KUNINGAN TIMUR',
                                  'city_name': 'Jakarta',
                                  'state': 3,
                                  'last_updated': '2017-03-31T02:45:52.574Z',
                      },
                    };

      let result = cap.createInfo(feature);
      test.value(result.severity).is('Moderate');
      done();
    });

    // Test level minor
    it('Create the correct severity levels', function(done) {
      // dummy data (polygon)
      let feature = {'type': 'Feature',
                    'geometry': {'type': 'Polygon', 'coordinates': [
                      [[106.8367359996, -6.2305420003],
                      [106.8367039999, -6.2307239997],
                      [106.8367995401, -6.2301399095],
                      [106.8367359996, -6.2305420003]]]},
                    'properties': {'area_id': '1346',
                                  'geom_id': '3171100002004000',
                                  'area_name': 'RW 04',
                                  'parent_name': 'KUNINGAN TIMUR',
                                  'city_name': 'Jakarta',
                                  'state': 2,
                                  'last_updated': '2017-03-31T02:45:52.574Z',
                                },
                    };

      let result = cap.createInfo(feature);
      test.value(result.severity).is('Minor');
      done();
    });

    // Test level Unknown
    it('Create the correct severity levels', function(done) {
      // dummy data (polygon)
      let feature = {'type': 'Feature',
                    'geometry': {'type': 'Polygon', 'coordinates': [
                      [[106.8367359996, -6.2305420003],
                      [106.8367039999, -6.2307239997],
                      [106.8367995401, -6.2301399095],
                      [106.8367359996, -6.2305420003]]]},
                    'properties': {'area_id': '1346',
                     'geom_id': '3171100002004000',
                     'area_name': 'RW 04',
                     'parent_name': 'KUNINGAN TIMUR',
                     'city_name': 'Jakarta',
                     'state': 1,
                     'last_updated': '2017-03-31T02:45:52.574Z',
                   },
                 };

      let result = cap.createInfo(feature);
      test.value(result.severity).is('Unknown');
      done();
    });

    // Test bad geometry will bubble up internall within CAP module
    it('Catch unsupported complex polygon geometry', function(done) {
      // dummy data (polygon)
      let feature = {'type': 'Feature',
                    'geometry': {'type': 'Polygon', 'coordinates': [
                      [[0, 0], [3, 6], [6, 1], [0, 0]],
                      [[2, 2], [3, 3], [4, 2], [2, 2]]]},
                    'properties': {'area_id': '1346',
                      'geom_id': '3171100002004000',
                      'area_name': 'RW 04',
                      'parent_name': 'KUNINGAN TIMUR',
                      'city_name': 'Jakarta',
                      'state': 1,
                      'last_updated': '2017-03-31T02:45:52.574Z',
                    },
                  };

      let result = cap.createInfo(feature);
      test.value(result).is(undefined);
      done();
    });
  });
}
