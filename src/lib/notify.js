import axios from 'axios';

/**
 * Notify - send notification of report received to notify endpoint
 * @class Notify
 */
export default class Notify {
 /**
   * Setup the Notify object to use specified logger
   * @param {Object} config Server configuration
   * @param {Object} logger Configured Winston logger instance
   */
    constructor(config, logger) {
        this.endpoint = config.NOTIFY_ENDPOINT;
        this.apikey = config.NOTIFY_API_KEY;
        this.logger = logger;
        this.axios = axios;
    }
    /**
     * send - Send notification method to notification endpoint
     * @method send
     * @param {Object} body - body of message to send
     * @param {number} body.reportId - report ID
     * @param {String} body.instanceRegionCode - region code of report
     * @param {String} body.language - language of report
     * @param {String} body.username - user network identifier
     * @return {Promise} - response
     */
    send(body) {
        return new Promise((resolve, reject) => {
            this.axios.post(this.endpoint, body,
                {'headers': {'x-api-key': this.apikey}})
                .then((response) => {
                    resolve(response);
                    }
                )
                .catch((err) => {
                    console.log('err object: ', err);
                    // Return response error object (contains error details)
                    reject(err.response.data);
                });
        });
    }
}
