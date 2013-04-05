cas.js
======

The major motivation for me to create this module is all the node.js CAS client available in github or npm that I have tried have problem with the https setting after the change made in [version 0.9.2](https://github.com/joyent/node/commit/6e2055)

"tls, https: validate server certificate by default (Ben Noordhuis)"

That will result a `DEPTH_ZERO_SELF_SIGNED_CERT` error from the CAS client if your CAS is deployed with a self-signed certificate. It is because the `rejectUnauthorized` option of `https.request(options, callback)` is `true` [by default](http://nodejs.org/api/all.html#all_https_request_options_callback) that used to be `false`.

TODO
----
- CAS 2.0 support

License
-------
The MIT License (MIT)
Copyright (c) 2013 MSU

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.