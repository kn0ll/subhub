var colors = require('colors'),
  request = require('request'),
  express = require('express'),
  _ = require('underscore'),
  events = require('events'),
  util = require('util'),
  url = require('url'),
  parser = require('xml2json'),
  xml2json = parser.toJson,
  parseJson = JSON.parse;

function log(str) {
  console.log(str.cyan);
};

var Client = function(config) {
  log('creating subhub client');
  events.EventEmitter.call(this);
  this.config = config;
};
util.inherits(Client, events.EventEmitter);

Client.prototype.handleMessage = function(req, res, next) {
  var body = '';
  req.on('data', function(chunk) { body += chunk; });

  req.on('end', _.bind(function() {
    this.emit('data', parseJson(xml2json(body)));
  }, this));
};

Client.prototype.handleAuthentication = function(req, res, next) {
  log('authenticating subscription');

  res.send(200, req.query['hub.challenge']);
};

Client.prototype.subscribe = function() {
  log('requesting pubsub subscription');
  var config = this.config,
    url = config['hub'],
    data = { form: config['subscription'] },
    callback = _.bind(this.handleSubscription, this);

  request.post(url, data, callback);
};

Client.prototype.handleSubscription = function(err, req, body) {
  var status = req.statusCode,
    args = ['subscription request responded', status, body];

  log(args.join(' '));
};

Client.prototype.middleware = function() {
  var self = this,
    config = this.config,
    cb = config['hub.callback'],
    route = new RegExp(cb);
  log('creating http handlers for ' + cb);

  return function(req, res, next) {
    var method = req.method;
    if (req.url.match(route)) {
      if (method == 'GET') {
        self.handleAuthentication.apply(self, arguments);
      } else if (method == 'POST') {
        self.handleMessage.apply(self, arguments);
      } else {
        next();
      }
    } else {
      next();
    }
  }
};

module.exports = Client;