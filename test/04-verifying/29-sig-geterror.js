import test from 'ava';

var OpenDKIM = require('../../');
var Messages = require('../fixtures/messages');

var messages = new Messages();

test('test sig_geterror with good message', t => {
  try {
    var opendkim = new OpenDKIM();

    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    opendkim.chunk({
      message: messages.good,
      length: messages.good.length
    });
    opendkim.chunk_end();
    var error = opendkim.sig_geterror();
    t.is(error, 0);
  } catch (err) {
    console.log(err);
    t.fail();
  }
});

test('test sig_geterror with bad_sigalg message', t => {
  var opendkim = new OpenDKIM();
  try {
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    opendkim.chunk({
      message: messages.bad_sigalg,
      length: messages.bad_sigalg.length
    });
    opendkim.chunk_end();
    t.fail();
  } catch (err) {
    var error = opendkim.sig_geterror();
    t.is(error, 10);
  }
});

test('test sig_geterror with bad_signature_version message', t => {
  var opendkim = new OpenDKIM();
  try {
    opendkim.query_method('DKIM_QUERY_FILE');
    opendkim.query_info('../fixtures/testkeys');

    opendkim.verify({id: undefined});
    opendkim.chunk({
      message: messages.bad_signature_version,
      length: messages.bad_signature_version.length
    });
    opendkim.chunk_end();
    t.fail();
  } catch (err) {
    var error = opendkim.sig_geterror();
    t.is(error, 1);
  }
});

