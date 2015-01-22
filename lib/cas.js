var https = require('https');
var url = require('url');
var fs = require('fs');
var cheerio = require('cheerio');

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
  if (cas_url.protocol !== 'https:') {
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

// get login ticket
Client.prototype.load = function (service, raw, callback) {
  var options = {
    host: this.hostname,
    port: this.port,
    rejectUnauthorized: this.rejectUnauthorized
  };

  if (this.ca) {
    options.ca = [fs.readFileSync(this.ca)];
  }
  if (this.version === 1.0) {
    options.path = url.format({
      pathname: this.base_path + '/login',
      query: {
        service: service
      }
    });
  }

  // if (this.version == 2.0) {
  //   options.path = url.format({
  //     pathname: this.base_path+'/serviceValidate',
  //     query: {ticket: ticket, service: this.service}
  //   });
  // }

  var req = https.request(options, function (res) {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      if (raw) {
        callback(null, res, body);
      } else {
        var $ = cheerio.load(body);
        callback(null, res, {lt: $('#lt').val()});
      }
    });
    res.on('error', function (e) {
      console.log('response error: ' + e);
      callback(e);
    });

  });

  req.on('error', function (e) {
    console.log('request error: ' + e);
    callback(e);
  });

  req.end();
};

// get validation ticket
Client.prototype.login = function (query, callback) {
  var options = {
    host: this.hostname,
    port: this.port,
    method: 'POST',
    rejectUnauthorized: this.rejectUnauthorized
  };
  if (this.ca) {
    options.ca = [fs.readFileSync(this.ca)];
  }
  if (this.version === 1.0) {
    options.path = url.format({
      pathname: this.base_path + '/login',
      query: {
        username: query.username,
        password: query.password,
        service: this.service,
        lt: query.loginticket
      }
    });
  }

  // if (this.version == 2.0) {
  //   options.path = url.format({
  //     pathname: this.base_path+'/serviceValidate',
  //     query: {ticket: ticket, service: this.service}
  //   });
  // }

  var req = https.request(options, function (res) {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      callback(null, res, body);
    });

    res.on('error', function (e) {
      console.log('response error: ' + e);
      callback(e);
    });

  });

  req.on('error', function (e) {
    console.log('request error: ' + e);
    callback(e);
  });

  req.end();
};

Client.prototype.validate = function (ticket, callback) {
  var options = {
    host: this.hostname,
    port: this.port,
    rejectUnauthorized: this.rejectUnauthorized
  };
  if (this.ca) {
    options.ca = [fs.readFileSync(this.ca)];
  }
  if (this.version === 1.0) {
    options.path = url.format({
      pathname: this.base_path + '/validate',
      query: {
        ticket: ticket,
        service: this.service
      }
    });
  }

  if (this.version === 2.0) {
    options.path = url.format({
      // pathname: this.base_path + '/proxyValidate',
      pathname: this.base_path + '/serviceValidate',
      query: {
        ticket: ticket,
        service: this.service
      }
    });
  }

  var req = https.get(options, function (res) {
    res.setEncoding('utf8');
    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      var sections = body.split('\n');
      if (sections.length >= 1) {
        if (sections[0] === 'no') {
          callback(null, res, {validated: false});
          return;
        }
        if (sections[0] === 'yes' && sections.length >= 2) {
          callback(null, res, {validated: true, username: sections[1]});
          return;
        }
      }
      callback({
        message: 'Format wrong'
      });
    });

    res.on('error', function (e) {
      console.log('response error: ' + e);
      callback(e);
    });

  });

  req.on('error', function (e) {
    console.log('request error: ' + e);
    callback(e);
  });

  req.end();
};
