'use strict';

const Dynamo = require('./lib/dynamo');
const KMS = require('./lib/KMS');

class Credstash {
    
    /**
     * constructor - Build our Credstash object
     * @param  string region The region we're working in
     * @param  string table  The name of the table our credstash credentials are in
     */
    constructor(region, table) {
        this.region = region;
        this.table = table;
        this.dynamo = new Dynamo(region, table);
        this.kms = new KMS(region);
    }
    
    
    /**
     * get - Get an item that's been credstash'd
     * @param  string   item     The item's key
     * @param  function callback Callback function
     */
    get(item, callback) {
        // Get the item from DyanmoDB
        this.dynamo.getItem(item, (err, encryptedItem) => {
            // Decrypt the item
            this.kms.decryptItem(encryptedItem, callback);
        });
    }
    
}

module.exports = Credstash;
