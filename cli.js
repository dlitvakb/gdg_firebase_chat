var Firebase = require('./node_modules/firebase');
var readline = require('readline');
var _ = require('./node_modules/underscore');

var ref = new Firebase('https://resplendent-heat-2750.firebaseio.com/');
var rl = readline.createInterface(process.stdin, process.stdout);

var new_messages = null;
var old_messages = {};

var array_diff = function (a1, a2) {

    var a = [], diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
};

var substract = function(a, b) {
  if (b === null) { b = {}; }
  var new_keys = array_diff(Object.keys(a), Object.keys(b));
  var new_object = {};
  _.each(new_keys, function(key) {
    new_object[key] = a[key];
  });
  return new_object;
};

ref.on('value', function(snapshot) {
  if (old_messages === null) {
    old_messages = snapshot.val();
    new_messages = old_messages;
  } else {
    var current_messages = snapshot.val();
    new_messages = substract(current_messages, old_messages);
    old_messages = current_messages;
  }

  _.each(Object.keys(new_messages), function(key) {
    var message = new_messages[key];
    console.log(message['username'] + ': ' + message['message']);
  });
});

rl.setPrompt('firebase> ');
setTimeout(function() {
  rl.prompt();
}, 2000);

rl.on('line', function(line) {
  var chat = line.trim().split(' | ');
  ref.push({username: chat[0], message: chat[1]});
  rl.prompt();
}).on('close',function(){
  process.exit(0);
});
