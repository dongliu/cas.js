cas.js
======

The major motication for me to create this module is all the node.js CAS client available in github or npm that I have tried have problem with the https setting after the change made in [version 0.9.2](https://github.com/joyent/node/commit/6e2055)

"tls, https: validate server certificate by default (Ben Noordhuis)"

That will result a `DEPTH_ZERO_SELF_SIGNED_CERT` error from the CAS client if your CAS is deployed with a self-signed certificate. It is because the `rejectUnauthorized` option of `https.request(options, callback)` is `true` [by default](http://nodejs.org/api/all.html#all_https_request_options_callback) that used to be `false`.

TODO
----
- CAS 2.0 support