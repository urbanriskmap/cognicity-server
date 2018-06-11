'use strict';
/**
 * CogniCity CAP data format utility
 * @module lib/cap
 * @param {Object} logger Configured Winston logger instance
 **/

// XML builder used to create XML output
import builder from 'xmlbuilder';
// moment module, JS date/time manipulation library
import moment from 'moment-timezone';
// Cap class
module.exports = class Cap {
  /**
   * Setup the CAP object to use specified logger
   * @alias module:lib/cap
   * @param {Object} config Server configuration
   * @param {Object} logger Configured Winston logger instance
   */
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }
  /**
   * Transform GeoJSON data to ATOM feed of CAP format XML data.
   * See {@link https://tools.ietf.org/html/rfc4287|ATOM syndication format}
   * @param {Object} features Peta Jakarta GeoJSON features object
   * @return {String} XML CAP data describing all areas
   **/
  geoJsonToAtomCap(features) {
    let self = this;
    let feed = {
      '@xmlns': 'http://www.w3.org/2005/Atom',
      'id': 'https://data.petabencana.id/floods',
      'title': 'petabencana.id Flood Affected Areas',
      'updated': moment().tz('Asia/Jakarta').format(),
      'author': {
        name: 'petabencana.id',
        uri: 'https://petabencana.id/',
      },
    };

    for (let feature of features) {
      let alert = self.createAlert( feature );
      // If alert creation failed, don't create the entry
      if (!alert) {
        continue;
      }

      if (!feed.entry) feed.entry = [];

      feed.entry.push({
        // Note, this ID does not resolve to a real resource
        // - but enough information is contained in the URL
        // that we could resolve the flooded report at the same point in time
        id: 'https://data.petabencana.id/floods?parent_name='
        +encodeURI(feature.properties.parent_name)
        +'&area_name='
        +encodeURI(feature.properties.area_name)
        +'&time='
        +encodeURI(moment.tz(feature.properties.last_updated, 'Asia/Jakarta'
                    ).format('YYYY-MM-DDTHH:mm:ssZ')),
        title: alert.identifier + ' Flood Affected Area',
        updated: moment.tz(feature.properties.last_updated, 'Asia/Jakarta'
                    ).format('YYYY-MM-DDTHH:mm:ssZ'),
        content: {
          '@type': 'text/xml',
          'alert': alert,
        },
      });
    }

    return builder.create( {feed: feed} ).end();
  }

  /**
   * Create CAP ALERT object.
   * See {@link `http://docs.oasis-open.org/emergency/cap/v1.2/`
                  + `CAP-v1.2-os.html#_Toc97699527|`
                  + `CAP specification 3.2.1 "alert" Element and Sub-elements`}
   * @param {Object} feature petabencana.id GeoJSON feature
   * @return {Object} Object representing ALERT element for xmlbuilder
   */
  createAlert(feature) {
    let self = this;

    let alert = {};

    alert['@xmlns'] = 'urn:oasis:names:tc:emergency:cap:1.2';

    let identifier = feature.properties.parent_name + '.'
      + feature.properties.area_name + '.'
      + moment.tz(feature.properties.last_updated, 'Asia/Jakarta'
        ).format('YYYY-MM-DDTHH:mm:ssZ');
    identifier = identifier.replace(/ /g, '_');
    alert.identifier = encodeURI(identifier);

    alert.sender = 'BPBD.JAKARTA.GOV.ID';
    alert.sent = moment.tz(feature.properties.last_updated,
                  self.config.CAP_TIMEZONE).format('YYYY-MM-DDTHH:mm:ssZ');
    alert.status = 'Actual';
    alert.msgType = 'Alert';
    alert.scope = 'Public';

    alert.info = self.createInfo( feature );
    // If info creation failed, don't create the alert
    if (!alert.info) {
      return;
    }

    return alert;
  }

  /**
   * Create a CAP INFO object.
   * See {@link `http://docs.oasis-open.org/emergency/cap/v1.2/`
                  + `CAP-v1.2-os.html#_Toc97699542|`
                  + `CAP specification 3.2.2 "info" Element and Sub-elements`}
   * @param {Object} feature petabencana.id GeoJSON feature
   * @return {Object} Object representing INFO element suitable for xmlbuilder
   */
  createInfo(feature) {
    let self = this;

    let info = {};

    info.category = 'Met';
    info.event = 'FLOODING';
    info.urgency = 'Immediate';

    let severity = '';
    let levelDescription = '';
    if ( feature.properties.state === 1 ) {
      severity = 'Unknown';
      levelDescription = 'AN UNKNOWN LEVEL OF FLOODING - USE CAUTION -';
    } else if ( feature.properties.state === 2 ) {
      severity = 'Minor';
      levelDescription = 'FLOODING OF BETWEEN 10 and 70 CENTIMETERS';
    } else if ( feature.properties.state === 3 ) {
      severity = 'Moderate';
      levelDescription = 'FLOODING OF BETWEEN 71 and 150 CENTIMETERS';
    } else if ( feature.properties.state === 4 ) {
      severity = 'Severe';
      levelDescription = 'FLOODING OF OVER 150 CENTIMETERS';
    } else {
      self.logger.silly('Cap: createInfo(): State '
        + feature.properties.state
        + ' cannot be resolved to a severity');
      return;
    }
    info.severity = severity;

    info.certainty = 'Observed';
    info.senderName = 'JAKARTA EMERGENCY MANAGEMENT AGENCY';
    info.headline = 'FLOOD WARNING';

    let descriptionTime = moment(feature.properties.last_updated
                            ).tz('Asia/Jakarta').format('HH:mm z');
    let descriptionArea = feature.properties.parent_name
                          + ', ' + feature.properties.area_name;
    info.description = 'AT '
                        + descriptionTime
                        + ' THE JAKARTA EMERGENCY MANAGEMENT AGENCY OBSERVED '
                        + levelDescription + ' IN ' + descriptionArea + '.';

    info.web = 'https://petabencana.id/';

    info.area = self.createArea( feature );
    // If area creation failed, don't create the info
    if (!info.area) {
      return;
    }

    // Add expiry time to information
    info.expires = moment.tz(new Date().getTime()
                + self.config.CAP_DEFAULT_EXPIRE_SECONDS * 1000,
                  self.config.CAP_TIMEZONE).format('YYYY-MM-DDTHH:mm:ssZ');

    return info;
  }

  /**
   * Create a CAP AREA object.
   * See {@link `http://docs.oasis-open.org/emergency/cap/v1.2/`
                + `CAP-v1.2-os.html#_Toc97699550|`
                + `CAP specification 3.2.4 "area" Element and Sub-elements`}
   * @param {Object} feature petabencana.id GeoJSON feature
   * @return {Object} Object representing AREA element for XML xmlbuilder
   */
  createArea(feature) {
    let self = this;

    let area = {};

    area.areaDesc = feature.properties.area_name
                    + ', ' + feature.properties.parent_name;

    // Collate array of polygon-describing strings from different geometry types
    area.polygon = [];
    let featurePolygons;
    if ( feature.geometry.type === 'Polygon' ) {
      featurePolygons = [feature.geometry.coordinates];
    } else if ( feature.geometry.type === 'MultiPolygon' ) {
      featurePolygons = feature.geometry.coordinates;
    } else {
      /* istanbul ignore next */
      self.logger.error( 'Cap: createInfo(): Geometry type \''
                          + feature.geometry.type + '\' not supported' );
      /* istanbul ignore next */
      return;
    }

    // Construct CAP suitable polygon strings
    // (whitespace-delimited WGS84 coordinate pairs - e.g. "lat,lon lat,lon")
    // See: `http://docs.oasis-open.org/emergency/cap/v1.2/`
    //          + `CAP-v1.2-os.html#_Toc97699550 - polygon`
    // See: `http://docs.oasis-open.org/emergency/cap/v1.2/`
    //          + `CAP-v1.2-os.html#_Toc520973440`
    self.logger.debug( 'Cap: createInfo(): '
                        + featurePolygons.length
                        + ' polygons detected for '
                        + area.areaDesc );
    for (let polygonIndex=0; polygonIndex < featurePolygons.length;
      polygonIndex++) {
      // Assume all geometries to be simple Polygons of single LineString
      if ( featurePolygons[polygonIndex].length > 1 ) {
        /* istanbul ignore next */
        self.logger.error( `Cap: createInfo(): Polygon with interior rings is
                            not supported` );
        /* istanbul ignore next */
        return;
      }

      let polygon = '';
      self.logger.debug( 'Cap: createInfo(): '
                        + featurePolygons[polygonIndex][0].length
                        + ' points detected in polygon '
                        + polygonIndex );
      for (let pointIndex=0; pointIndex <
        featurePolygons[polygonIndex][0].length; pointIndex++) {
          let point = featurePolygons[polygonIndex][0][pointIndex];
          polygon += point[1] + ',' + point[0] + ' ';
        }
      area.polygon.push( polygon );
    }

    return area;
  }
};
