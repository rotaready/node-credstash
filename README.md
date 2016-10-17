# node-credstash
Node.js port of [credstash](https://github.com/fugue/credstash)

## Installation
As a command line tool:
```
npm install node-credstash -g
```

As a project dependency:
```
npm install node-credstash --save
```

## Setup
Setup of the credtash table is on it's way, but for now we recommend using [credstash](https://github.com/fugue/credstash), or building the table yourself.

## Usage
### Command line tool
**Put**

To store a value called `super_secret` with a value `abc123`, we'd do the following:
```node-credstash put super_secret abc123```

**Get**

To get the value of `super_secret`:
`node-credstash get super_secret`

**Options**

You can pass two arguments to both commands:
* `--region` Your desired AWS region (this should be the same as your credstash table). Defaults to `us-east-1`
* `--table` Your credstash table name. Defaults to `credential-store`

### Node.js Module
**Initialise**

```javascript
const Credstash = require('node-credstash');
const credstash = new Credstash('us-east-1', 'credential-store');
```
The constructor takes two arguments:
* `region` Your desired AWS region (this should be the same as your credstash table)
* `table` Your credstash table name

**Put**

```javascript
credstash.put('super_secret', 'abc123', (err) => {
    
});
```
The arguments are:
* `key` The key's name
* `value` This is the value to be encrypted
* `callback` A callback function

**Get**

You can either get one item:
```javascript
credstash.get('super_secret', (err, value) => {
    
});
```

Or multiple:
```javascript
credstash.getAll(['super_secret', 'more_secret'], (err, values) => {
    // values.super_secret = abc123
    // ...
});
```

The arguments are:
* `item(s)` Either a string for `get` or an array of strings for `getAll`
* `callback` Callback function

