import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test body method with no argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.body();
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): Argument should be an object');
  }
});

test('test body method with numeric argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.body(1);
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): Argument should be an object');
  }
});

test('test body method with string argument', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.body('test');
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): Argument should be an object');
  }
});

test('test body method with missing body arg', t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.body({
      // nothing
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): body is undefined');
  }
});

test('test body method with missing length arg', t => {
  try {
    var opendkim = new OpenDKIM();
    var body = 'This is a test';
    opendkim.body({
      body: body
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): length must be defined and non-zero');
  }
});

test('test body needs context', t => {
  try {
    var opendkim = new OpenDKIM();
    var body = 'This is a test';
    opendkim.body({
      body: body,
      length: body.length
    });
    t.fail();
  } catch (err) {
    t.is(err.message, 'body(): sign() or verify() must be called first');
  }
});

test('test body method works after header and eoh', async t => {
  try {
    var opendkim = new OpenDKIM();
    opendkim.verify({id: undefined});
    var header = messages.good.substring(0, messages.good.indexOf('\r\n\r\n'));
    var body = messages.good.substring(messages.good.indexOf('\r\n\r\n') + 4);
    var headers = header.replace(/\r\n\t/g, ' ').split(/\r\n/);
    for (var i = 0; i < headers.length; i++) {
      var line = headers[i];
      await opendkim.header({
        header: line,
        length: line.length
      });
    }
    await opendkim.eoh();
    opendkim.body({
      body: body,
      length: body.length
    });
    t.pass();
  } catch (err) {
    console.log(err);
    t.fail();
  }
});
