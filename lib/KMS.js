'use strict';

const AWS = require('aws-sdk');
const AES = require('aes-js');
const crypto = require('crypto');


/**
 * Class to interface with KMS
 */
class KMS {
    
    /**
     * constructor - Build our KMS object
     * @param  string region The AWS region we're working with
     */
    constructor(region) {
        this.kms = new AWS.KMS({ region, apiVersion: '2014-11-10' });
    }
    
    
    /**
     * decryptItem - Decrypt a single item
     * @param  Object   item     An object literal built with the map function in the Dynamo class
     * @param  function callback Callback function
     */
    decryptItem(item, callback) {
        const params = {
            CiphertextBlob: new Buffer(item.key, 'base64'),
        };
        
        // Hit the KMS API to decrypt the key
        this.kms.decrypt(params, (err, data) => {
            if (err) return callback(err);
            
            const contents = new Buffer(item.contents, 'base64');
            
            // First 32 bytes are the key, the rest is our HMAC key
            const key = data.Plaintext.slice(0, 32);
            const hmacKey = data.Plaintext.slice(32);
            
            // Add our contents to our HMAC, then check it's correct
            const hmac = crypto.createHmac(item.digest, hmacKey);
            hmac.update(contents);
            
            if (item.hmac !== hmac.digest('hex')) {
                return callback('HMACs do not match');
            }
            
            const decrypt = new AES.ModeOfOperation.ctr(key);  // eslint-disable-line new-cap
            const plaintext = decrypt.decrypt(contents).toString('utf-8');
            
            callback(null, plaintext);
        });
    }
}

module.exports = KMS;