/*global describe, it, before, beforeEach, after, afterEach */

var auth = require('./config/auth.json');
var Client = require('../lib/cas.js');
var assert = require('assert');
var should = require('should');
var url = require('url');
var cas = new Client({
  base_url: auth.cas,
  service: auth.service,
  version: 1.0
});

var inspect = require('util').inspect;

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function hidden(query, callback) {
  var stdin = process.openStdin();
  process.stdin.on('data', function (char) {
    char = char + '';
    switch (char) {
    case '\n':
    case '\r':
    case '\u0004':
      stdin.pause();
      break;
    default:
      process.stdout.write('\u001b[2K\u001b[200D' + query + Array(rl.line.length + 1).join('*'));
      break;
    }
  });

  rl.question(query, function (value) {
    rl.history = rl.history.slice(1);
    callback(value);
  });
}

describe('cas-client', function () {
  var lt;
  var ticket;
  describe('#load()', function () {
    this.timeout(600000);
    it('should get a login ticket', function (done) {
      cas.load(auth.service, false, function (e, res, body) {
        if (e) {
          console.log(e);
          done();
        }
        console.log(body);
        lt = body.lt;
        done();
      });
    });
  });

  describe('#login()', function () {
    this.timeout(600000);
    it('should get a ticket for validation', function (done) {
      rl.question('username: ', function (name) {
        hidden('password: ', function (pass) {
          rl.close();
          cas.login({username: name, password: pass, loginticket: lt}, function (e, res, body) {
            if (e) {
              console.log(e);
              done();
            }
            console.log(res.headers);
            console.log(body);
            console.log(res.headers.location);
            ticket = url.parse(res.headers.location, true).query.ticket;
            console.log(ticket);
            done();
          });
        });
      });
    });
  });

  describe('#validate()', function () {
    this.timeout(600000);
    it('should get the validation result', function (done) {
      cas.validate(ticket, function (e, res, result) {
        if (e) {
          console.log(e);
          done();
        }
        console.log(res.headers);
        console.log(result);
        done();
      });
    });
  });
});
