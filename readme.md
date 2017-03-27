# node-opendkim [![Build Status](https://travis-ci.org/godsflaw/node-opendkim.svg?branch=master)](https://travis-ci.org/godsflaw/node-opendkim) [![Coverage Status](https://coveralls.io/repos/github/godsflaw/node-opendkim/badge.svg?branch=master)](https://coveralls.io/github/godsflaw/node-opendkim?branch=master)

> node.js native language binding to libopendkim


## Install/Test (locally)

```
git clone git@github.com:godsflaw/node-opendkim.git
cd node-opendkim
npm install
npm test -- --verbose

```

## Install/Test (npm)

```
npm install --save node-opendkim
```

## Install Globally (npm)

```
npm install --global node-opendkim
```

---

## Usage

```js
const OpenDKIM = require('node-opendkim');

var opendkim = new OpenDKIM();
```

---

## API Administration Methods

---

### SYNOPSIS `new`

```js
try {
  var opendkim = new OpenDKIM();
} catch (err) {
  console.log(err);
}
```

Create a new instantiation of the DKIM service, for signing or verifying
Internet messages.

#### DESCRIPTION

new OpenDKIM() is called when setting up the application.

#### ARGUMENTS

Type: `undefined`

#### NOTES

Under the hood, a handle is stored for use with this object instance.  The
handle stored by this function is passed to `dkim.sign()` and `dkim.verify()`.

#### RETURN VALUES

- On success, an empty object is returned
- On failure, it throws an exception.

---

### SYNOPSIS `flush_cache`

```js
try {
  var opendkim = new OpenDKIM();
  // TODO(godsflaw): fill this out so that it uses a cache
  opendkim.flush_cache();
} catch (err) {
  console.log(err);
}
```

Create a new instantiation of the DKIM service, for signing or verifying
Internet messages.

#### DESCRIPTION

`opendkim.flush_cache()` can be called at any time.

For more information:
http://www.opendkim.org/libopendkim/dkim_flush_cache.html

#### ARGUMENTS

Type: `undefined`

#### NOTES

TODO(godsflaw): fix this note, once we have `DKIM_LIBFLAGS_CACHE` nailed down.
- Caching is selected by setting the DKIM_LIBFLAGS_CACHE flag using the
`dkim_options()` method.
- Caching requires a special compile-time option since
it also adds a library dependency to applications.

#### RETURN VALUES

- `-1` if caching is not active for this library instance.
- Number of records flushed if caching is active.

---

## API Signing Methods

---

### SYNOPSIS `sign`

```js
try {
  var opendkim = new OpenDKIM();
  opendkim.sign({
    id: undefined, // optional (default: undefined)
    secretkey: 'testkey',
    selector: 'a1b2c3',
    domain: 'example.com',
    hdrcanon: 'relaxed',
    bodycanon: 'relaxed',
    signalg: 'sha256',
    signalg: 'sha256',
    length: -1     // optional (default: -1)
  });
} catch (err) {
  console.log(err);
}
```

Create a new context for signing a message.

#### DESCRIPTION

`opendkim.sign()` is called when preparing to process a new message that will
be signed later by a private key.

For more information:
http://www.opendkim.org/libopendkim/dkim_sign.html

#### ARGUMENTS

Type: `Object`

- `id`: **(default: undefined)** An opaque, printable string for identifying this
    message, suitable for use in logging or debug output.
- `secretkey`: The private key to be used when signing this message. This must
    be a string containing either a PEM-formatted private key, or a
    DER-formatted private key after being encoded with base64.
- `selector`: The name of the selector to be reported in the signature on this
    message.
- `domain`: The domain doing the signing; this will be the domain whose DNS will
    be queried by the verifier for key data.
- `hdrcanon`: **(values: 'simple | relaxed') (default: 'simple')** The
    canonicalization algorithm to use when preparing the headers of this message
    for signing.
- `bodycanon`: **(values: 'simple | relaxed') (default: 'simple')** The
    canonicalization algorithm to use when preparing the body of this message
    for signing.
- `signalg`: **(values: 'sha1 | sha256') (default: 'sha1')** The signing algorithm
    to use when generating the signature to be attached to this message.
- `length`: **(default: -1)** The number of bytes of the body to sign. A value
    of -1 will cause the entire message to be signed.


#### NOTES

- DKIM_STAT_INVALID is thrown if, for example, a signing handle using 'sha256'
    is requested when the library was not compiled against a version of OpenSSL
    that had support for that hash algorithm.
- The context for signing is now stored -- under the hood -- with the opendkim
    instance.

#### RETURN VALUES

- On failure, an exception is thrown that indicates the cause of the problem.

---

## API Verifying Methods

---

### SYNOPSIS `verify`

```js
try {
  var opendkim = new OpenDKIM();
  opendkim.verify({
    id: undefined // optional (default: undefined)
  });
} catch (err) {
  console.log(err);
}
```

Create a new handle for verifying a (possibly) signed message.

#### DESCRIPTION

`opendkim.verify()` is called when preparing to process a new message that may
be signed already in order to be able to verify its contents against the
signature.


For more information:
http://www.opendkim.org/libopendkim/dkim_verify.html

#### ARGUMENTS

Type: `Object`

- `id`: **(default: undefined)** An opaque, printable string for identifying this
    message, suitable for use in logging or debug output.

#### NOTES

- The handle returned by this function may not be used in a later call to
    `opendkim.getsighdr()`.

#### RETURN VALUES

- On failure, an exception is thrown that indicates the cause of the problem.

---

## API Processing Methods

---

### SYNOPSIS `header`

```js
try {
  var opendkim = new OpenDKIM();
  opendkim.verify({
    id: undefined // optional (default: undefined)
  });

  // Adding one header at a time, when finished call opendkim.eoh()
  var header = 'From: <herp@derp.com>';
  opendkim.header({
      header: header,
      length: header.length
  });
} catch (err) {
  console.log(err);
}
```

Handle a message header field.

#### DESCRIPTION

`opendkim.header()` is called zero or more times between `opendkim.sign()` or
`opendkim.verify()` and `opendkim.eoh()`, once per message header field.

For more information:
http://www.opendkim.org/libopendkim/dkim_header.html

#### ARGUMENTS

Type: `Object`

- `header`: The header field being input, including its name, value and
    separating colon (":") character.
- `length`: length of the header value.

#### NOTES

- The value of `header` should not contain a trailing CRLF as this will be added
    by the canonicalization code. However, a CRLF may appear elsewhere in the
    value if, for example, the header field is meant to be wrapped.
- A header field whose name includes a semi-colon cannot be used as it will
    produce a syntactically invalid signature. Such header fields cause this
    function to return `DKIM_STAT_SYNTAX`.

#### RETURN VALUES

- On failure, an exception is thrown that indicates the cause of the problem.

---

### SYNOPSIS `eoh`

```js
try {
  var opendkim = new OpenDKIM();
  opendkim.verify({
    id: undefined // optional (default: undefined)
  });

  // Adding one header at a time, when finished call opendkim.eoh()
  var header = 'From: <herp@derp.com>';
  opendkim.header({
      header: header,
      length: header.length
  });
  opendkim.eoh();
} catch (err) {
  console.log(err);
}
```

Denote end-of-headers for a message.

#### DESCRIPTION

`opendkim.eoh()` is called when the delimiter between the message's
headers and its body is encountered.  That is, when one is done processing
the header section.

For more information:
http://www.opendkim.org/libopendkim/dkim_eoh.html

#### ARGUMENTS

Type: `undefined`

#### NOTES

- This function may throw `DKIM_STAT_NOSIG` when verifying if no signature was
    present in the message headers. This is simply advisory; you must continue
    executing down to the `opendkim.eom()` call to determine whether or not a
    signature should have been present.
- This function can throw `DKIM_STAT_SYNTAX` when verifying if a header that
    must be signed was not included in a received signature, or if the message
    appeared to contain no sender header field. In the latter case, the dkim
    handle is rendered unusable by future calls to `opendkim.body()` or
    `opendkim.eom()`.
- This function can throw `DKIM_STAT_CANTVRFY` when verifying if all
    discovered signatures were either marked to be ignored, contained syntax
    errors, or failed verification attempts. This is only tested if the
    `DKIM_LIBFLAG_EOHCHECK` library flag is set.
- This function can throw `DKIM_STAT_SYNTAX` in either mode if the input
    message does not conform to the header field count checks imposed by the
    `DKIM_LIBFLAG_STRICTHDRS` library flag.
- This function can throw `DKIM_STAT_NORESOURCE` for a verifying handle if an
    attempt to construct a DNS query based on the selector and domain in a
    signature exceeded the maximum allowable query size.

#### RETURN VALUES

- On failure, an exception is thrown that indicates the cause of the problem.

---

### SYNOPSIS `eom`

```js
try {
  var opendkim = new OpenDKIM();
  opendkim.verify({
    id: undefined // optional (default: undefined)
  });

  // Adding one header at a time, when finished call opendkim.eoh()
  var header = 'From: <herp@derp.com>';
  opendkim.header({
      header: header,
      length: header.length
  });
  opendkim.eoh();
  // Adding body chunks, when finished call opendkim.eom()
  var body = 'this is a test';
  opendkim.header({
      header: body,
      length: body.length
  });
  opendkim.eom();
} catch (err) {
  console.log(err);
}
```

Denote end-of-message for a message. When verifying, process signatures in
order; when signing, compute all signatures.

#### DESCRIPTION

`opendkim.eoh()` is called when the delimiter between the message's
headers and its body is encountered.  That is, when one is done processing
the header section.

For more information:
http://www.opendkim.org/libopendkim/dkim_eoh.html

#### ARGUMENTS

Type: `undefined`

#### NOTES

- This function may throw `DKIM_STAT_NOSIG` when verifying if no signature was
    present in the message headers. This is simply advisory; you must continue
    executing down to the `opendkim.eom()` call to determine whether or not a
    signature should have been present.
- This function can throw `DKIM_STAT_SYNTAX` when verifying if a header that
    must be signed was not included in a received signature, or if the message
    appeared to contain no sender header field. In the latter case, the dkim
    handle is rendered unusable by future calls to `opendkim.body()` or
    `opendkim.eom()`.
- This function can throw `DKIM_STAT_CANTVRFY` when verifying if all
    discovered signatures were either marked to be ignored, contained syntax
    errors, or failed verification attempts. This is only tested if the
    `DKIM_LIBFLAG_EOHCHECK` library flag is set.
- This function can throw `DKIM_STAT_SYNTAX` in either mode if the input
    message does not conform to the header field count checks imposed by the
    `DKIM_LIBFLAG_STRICTHDRS` library flag.
- This function can throw `DKIM_STAT_NORESOURCE` for a verifying handle if an
    attempt to construct a DNS query based on the selector and domain in a
    signature exceeded the maximum allowable query size.

#### RETURN VALUES

- On failure, an exception is thrown that indicates the cause of the problem.

---

## License

MIT © [Christopher Mooney](https://github.com/godsflaw/node-opendkim)
