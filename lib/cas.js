var https = require('https');
var url = require('url');
var fs = require('fs');

/*TODO handle CAS 2.0 later*/

var Client = module.exports = function Client(options) {
  options = options || {};

  if (!options.version) {
    options.version = 1.0;
  }
  this.version = options.version;

  if (!options.base_url) {
    throw new Error('Required CAS option "base_url" missing.');
  }

  if (!options.service) {
    throw new Error('Required CAS option "service" missing.');
  }

  var cas_url = url.parse(options.base_url);
  if (cas_url.protocol != 'https:') {
    throw new Error('Only https CAS servers are supported.');
  } else if (!cas_url.hostname) {
    throw new Error('Option "base_url" must be a valid url like https://example.com/cas');
  } else {
    this.hostname = cas_url.host;
    this.port = cas_url.port || 443;
    this.base_path = cas_url.pathname;
  }

  this.service = options.service;

  this.rejectUnauthorized = options.rejectUnauthorized || false;

  this.ca = options.ca;

  if (this.rejectUnauthorized && !options.ca) {
    console.warn('A "ca" option is required if your CAS server uses a self-signed certificate. See http://nodejs.org/api/tls.html#tls_tls_connect_options_callback for details.');
  }

};


Client.prototype.validate = function(ticket, callback) {
  var options = {
    host: this.hostname,
    port: this.port,
    rejectUnauthorized: this.rejectUnauthorized
  };
  if (this.ca) {
    options.ca = [ fs.readFileSync(this.ca) ];
  }
  if (this.version == 1.0) {
    options.path = url.format({
      pathname: this.base_path+'/validate',
      query: {ticket: ticket, service: this.service}
    });
  }

  if (this.version == 2.0) {
    options.path = url.format({
      pathname: this.base_path+'/serviceValidate',
      query: {ticket: ticket, service: this.service}
    });
  }

  var req = https.get(options, function(res) {
    res.setEncoding('utf8');
    var response = '';
    res.on('data', function(chunk) {
      response += chunk;
    });
    res.on('end', function() {
      var sections = response.split('\n');
      if (sections.length >= 1) {
        if (sections[0] == 'no') {
          callback(undefined, false);
          return;
        } else if (sections[0] == 'yes' &&  sections.length >= 2) {
          callback(undefined, true, sections[1]);
          return;
        }
      }
      callback({message: 'Format wrong'});
    });

    res.on('error', function(e){
      console.log('response error: ' + e);
      callback(e);
    });

  });

  req.on('error', function(e) {
    console.log('request error: ' + e);
    callback(e);
  });

  req.end();
};




