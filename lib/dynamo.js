'use strict';

const AWS = require('aws-sdk');

/**
 * Class to interface with DynamoDB
 */
class Dynamo {
    
    /**
     * constructor - Build our Dynamo object
     * @param  string region The region we're working in
     * @param  string table  Table our credstash data is stored in
     */
    constructor(region, table) {
        this.table = table;
        this.connection = new AWS.DynamoDB({ region, apiVersion: '2012-08-10' });
    }
    
    /**
     * mapItem - Turn a response from DynamoDB in to an object used in the KMS class
     * @param  string item The item we want to pull down
     */
    static mapItem(item) {
        const map = {
            contents: item.contents.S,
            hmac: item.hmac.S || item.hmac.B.toString(),
            key: item.key.S,
            digest: item.digest.S
        };
        
        return map;
    }
    
    /**
     * getItem - Get our item from DynamoDB
     * @param  string   item     The item's name
     * @param  function callback Callback function
     */
    getItem(item, callback) {
        const table = this.table;
         
        // AWS API parameters
        // ScanIndexForward is false and limit is 1, so we get the most recent version
        const params = {
            TableName: table,
            ConsistentRead: true,
            ScanIndexForward: false,
            Limit: 1,
            KeyConditions: {
                name: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [{
                        S: item
                    }]
                }
            }
        };
         
        this.connection.query(params, (err, data) => {
            if (err) return callback(err);
            
            if (!data.Items.length) {
                return callback('Item does not exist');
            }
            
            callback(null, Dynamo.mapItem(data.Items[0]));
        });
    }
    
    /**
     * getLatestVersion - Get the latest version number of an item
     * @param  string   item     The item name
     * @param  function callback Callback function
     */
    getLatestVersion(item, callback) {
        const table = this.table;
        
        const params = {
            TableName: table,
            ConsistentRead: true,
            ScanIndexForward: false,
            Limit: 1,
            KeyConditions: {
                name: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [{
                        S: item
                    }]
                }
            }
        };
        
        this.connection.query(params, (err, data) => {
            if (err) return callback(err);
            
            if (!data.Items.length) {
                return callback();
            }
            
            callback(null, parseInt(data.Items[0].version.S, 10));
        });
    }

    /**
     * putItem - Push an item in to DyanmoDB
     * @param  object   item     An object literal where key = column
     * @param  function callback Callback function
     */
    putItem(item, callback) {
        const table = this.table;
        
        const params = {
            TableName: table,
            Item: {}
        };
        
        Object.keys(item).forEach((key) => {
            params.Item[key] = { S: item[key] };
        });

        this.connection.putItem(params, callback);
    }
}

module.exports = Dynamo;
