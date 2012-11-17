var colors = require('colors'),
  request = require('request'),
  express = require('express'),
  _ = require('underscore'),
  events = require('events'),
  util = require('util'),
  url = require('url'),
  parser = require('xml2json');

function log(str) {
  return console.log(str.cyan);
};

var Client = function(config) {
  log('creating subhub client');
  events.EventEmitter.call(this);
  _.extend(this, config);

  var self = this,
    app = this.app = express(),
    path = url.parse(config['hub.callback']).path;
  log('creating http handler for ' + path);

  // the hub will POST new entries as they're received
  app.post(path, function(req, res) {
    var xml = '';
    req.on('data', function(chunk) { xml += chunk; });

    // when the request is complete, parse the atom feed
    req.on('end', function() {
      self.emit('data', JSON.parse(parser.toJson(xml)));
    });
  });

  // the hub will initially GET our callback to authenticate
  app.get(path, function(req, res) {
    log('authenticating subscription');
    res.send(200, req.query['hub.challenge']);
  });

  return this;

};
util.inherits(Client, events.EventEmitter);

Client.prototype.listen = function(port) {
  log('starting http server on port ' + port);
  this.app.listen(port);

  log('requesting pubsub subscription');
  request.post(this.hub, { form: _.extend({
    'hub.mode': 'subscribe',
    'hub.verify': 'sync',
    'hub.callback': this['hub.callback'],
    'hub.topic': this['hub.topic']
  }, this.data)}, function(err, req, body) {
    log(['subscription request responded', req.statusCode, body].join(' '));
  });
};

module.exports = Client;