'use strict';

const Dynamo = require('./lib/dynamo');
const KMS = require('./lib/KMS');
const async = require('async');
const leftPad = require('left-pad');

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
            if (err) return callback(err);
            // Decrypt the item
            this.kms.decryptItem(encryptedItem, callback);
        });
    }
    
    /**
     * getAll - Get multiple credstash'd items
     * @param  array    items    An array of item keys
     * @param  function callback Callback function
     */
    getAll(items, callback) {
        const decryptedItems = {};
        
        async.each(items, (item, callback) => {
            // Get the item from DyanmoDB
            this.dynamo.getItem(item, (err, encryptedItem) => {
                if (err) return callback(err);
                // Decrypt the item
                this.kms.decryptItem(encryptedItem, (err, decryptedItem) => {
                    if (err) return callback(err);
                    
                    decryptedItems[item] = decryptedItem;
                    
                    callback();
                });
            });
        }, (err) => {
            if (err) return callback(err);
            
            callback(null, decryptedItems);
        });
    }
    
    /**
     * put - Put a item/value in to the credstash
     * @param  string   item     The key to store with the encrypted value
     * @param  string   value    The value which will be encrypted and stored
     * @param  function callback Callback function
     */
    put(item, value, callback) {
        // Grab the row we'll insert in to DynamoDB
        this.kms.encryptItem(item, value, (err, row) => {
            if (err) return callback(err);
            
            // Increment the version or initialise it if this is a new item
            this.dynamo.getLatestVersion(item, (err, version) => {
                if (err) return callback(err);
                
                if (version) {
                    row.version = leftPad(version + 1, 19, 0);
                } else {
                    row.version = leftPad(1, 19, 0);
                }
                
                // Push the item in to DynamoDB
                this.dynamo.putItem(row, callback);
            });
        });
    }
}

module.exports = Credstash;
