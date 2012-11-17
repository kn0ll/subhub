# subhub

a simple interface and client for subscribing to a pubsubhubbub hub.

## using the client

```
$ npm install -g node-subhub
$ subhub -c /path/to/config.json
```

## creating a configuration

your configuration file should be a JSON definition with the following required keys

- `hub` - the url to the hub you are subscribing to
- `hub.callback` - the fully qualified domain name for your subscription callback. the hostname should match the name of the host running subhub, but the actual path to the callback can be arbitrary as it's created dynamically
- `hub.topic` - the feed you want to subscribe to

## API

```
$ npm install node-subhub
```

```
var _ = require('underscore'),
  subhub = require('node-subhub')

var client = new subhub({
  'hub': 'http://yourhub/',
  'hub.callback': 'http://hostname/callback',
  'hub.topic': 'http://feedurl/'
});

client.on('data', function(doc) {
  var entries = _(_.flatten([doc.feed.entry]));
  entries.each(function(entry) {
    console.log(entry.title);
  });
});

client.listen(80);
```