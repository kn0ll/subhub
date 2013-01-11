# subhub

subhub is a simple node.js interface for subscribing to a pubsubhubbub hub. subhub includes a library for integrating into your existing node.js servers, as well as a simple command line tool for debugging hub output.

## using the api

subhub provides a simple library for integrating a subhub connection into your existing node.js, connect, or express http servers.

### installation

```
$ npm install subhub
```

### usage

to use the api, you simply need to configure a subhub instance, tell your server to use it's request handler, and create a subscription. a simple example of this follows.

```
http = require('http')
subhub = require('subhub')
server = do http.createServer

# configure a subhub instance
firehose = new subhub
  'url': ''
  'subscription':
    'hub.mode': 'subscribe'
    'hub.verify': 'sync'
    'hub.callback': ''
    'hub.topic': ''

# set up the http handlers
server.on 'request', firehose.requestListener
server.listen 8000

# 'data' fires for each document sent by the hub
firehose.on 'data', (doc) ->
  console.log doc

# send a subscription request
# (once subscribed, the hub will begin sending data)
do firehose.subscribe
```

## using the client

a command line client is provided which simply creates up a subscription and writes all incoming hub entries to stdout. this is the quickest way to see all the data being sent by the hub. the client uses [nconf](https://github.com/flatiron/nconf), allowing you to configure the subscription through command line arguments, environment variables, or flat files (with that order.

### installation

```
$ npm install -g subhub
```

### usage

```
$ subhub --help
Usage: subhub 

Arguments:
  -h, --help                    Help. You're looking at it
  -c, --config                  Config file                                      [./config.json]
  --http.port                   Port to run the http server on                   [80]
  --hub.url                     The url of the hub you are subscribing to
  --hub.subscription.mode       Request mode                                     [subscribe]
  --hub.subscription.verify     Hub verification mode                            [sync]
  --hub.subscription.callback   Your callback URL the hub will send data to
  --hub.subscription.topic      The feed url of the topic you are subscribing to

$ subhub --hub.url=http://yourhub --hub.subscription.topic=http://yourhub/topic --hub.subscription.callback=http://yourhost/callback
[stream of messages]
```