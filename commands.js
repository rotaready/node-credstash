#!/usr/bin/env node

const argv = require('yargs')
    .default('region', process.env.AWS_DEFAULT_REGION ? process.env.AWS_DEFAULT_REGION : 'us-east-1')
    .default('table', 'credential-store')
    .argv;
const Credstash = require('./index');

const command = argv._[0];
const itemName = argv._[1];
const value = argv._[2];

const credstash = new Credstash(argv.region, argv.table);

switch (command) {
    case 'get':
        credstash.get(itemName, (err, item) => {
            if (err) {
                return console.log(err);
            }
            
            console.log(item);
        });
        break;
    case 'put':
        credstash.put(itemName, value, (err) => {
            if (err) {
                return console.log(err);
            }
            
            console.log(`Item ${itemName} pushed to credstash`);
        });
        break;
    default:
        break;
}
