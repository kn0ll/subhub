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

var Client = function(config) {
  events.EventEmitter.call(this);
  this.config = config;
  this.requestListener = _.bind(this.requestListener, this);
  this.log('client initialized');
};
util.inherits(Client, events.EventEmitter);

Client.prototype.log = function(msg) {
  var config = this.config,
    debug = config.debug;
  if (debug) {
    console.log('subhub:'.cyan, msg);
  };
};

Client.prototype.handleMessage = function(req, res, next) {
  var body = '';
  req.on('data', function(chunk) { body += chunk; });

  req.on('end', _.bind(function() {
    this.emit('data', parseJson(xml2json(body)));
  }, this));
};

Client.prototype.handleAuthentication = function(req, res, next) {
  this.log('authenticating subscription');
  var parts = url.parse(req.url, true),
    query = parts.query;

  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end(query['hub.challenge']);
};

Client.prototype.subscribe = function() {
  this.log('requesting pubsub subscription');
  var config = this.config,
    hub = config['url'],
    data = { form: config['subscription'] };

  data.form['mode'] = 'subscribe';
  data.form['verify'] = 'sync';
  request.post(hub, data);
};

Client.prototype.unsubscribe = function() {
  this.log('requesting pubsub unsubscribe');
  var config = this.config,
    hub = config['url'],
    data = { form: config['subscription'] };

  data.form['mode'] = 'unsubscribe';
  data.form['verify'] = 'sync';
  request.post(hub, data);
};

Client.prototype.requestListener = function(req, res, next) {
  var config = this.config,
    cb = config['subscription']['callback'],
    path = url.parse(cb).path,
    route = new RegExp(path),
    method = req.method;
    
  if (req.url.match(route)) {
    this.log(method + ' ' + req.url);
    if (method == 'GET') {
      this.handleAuthentication.apply(this, arguments);
    } else if (method == 'POST') {
      this.handleMessage.apply(this, arguments);
    } else {
      next && next();
    }
  } else {
    next && next();
  }
};

module.exports = Client;