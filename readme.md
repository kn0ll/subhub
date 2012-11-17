# subhub

a simple interface and client for subscribing to a pubsubhubbub hub.

## using the client

```
$ npm install -g node-subhub
$ subhub -c /path/to/config.json
creating subhub client
creating http handlers for undefined
requesting pubsub subscription
subscription request responded 204 
[stream of messages]
```

## creating a configuration

```
{
  "hub": "",
  "subscription": {
    "hub.mode": "subscribe",
    "hub.verify": "sync",
    "hub.callback": "",
    "hub.topic": ""
  }
}
```
arbitrary data can be included in `subscription` to send to the server with the initial subscription request, but all of the keys in the sample configuration are required.

- `hub` - the url to the hub you are subscribing to
- `hub.callback` - the fully qualified domain name for your subscription callback. the hostname should match the name of the host running subhub, but the actual path to the callback can be arbitrary as it's created dynamically
- `hub.topic` - the feed you want to subscribe to

## API

```
$ npm install node-subhub
```

```
var fs = require('fs'),
  express = require('express'),
  subhub = require('../lib/subhub'),
  config = JSON.parse(fs.readFileSync('./config.json')),
  app = express(),
  firehose = new subhub(config);

app.use(firehose.middleware());
app.listen(80);

firehose.on('data', function(doc) {
  console.log(doc);
});

firehose.subscribe();
```