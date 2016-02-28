var Firebase = require('./node_modules/firebase');
var _ = require('./node_modules/underscore');
var net = require('net');

var ref = new Firebase('https://resplendent-heat-2750.firebaseio.com/');

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

var sockets = [];

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
    if (key === 'remove') { return; }
    var message_data = new_messages[key];
    var message = message_data['username'] + ': ' + message_data['message'];
    console.log(message);
    _.each(sockets, function(socket) {
      socket.write(message + "\n");
    });
  });
});

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// Application
var net = require('net');
net.createServer(function(socket){
  sockets.push(socket);
  socket.on('data', function(data){
    var chat = data.toString().trim().split(' | ');
    ref.push({username: chat[0], message: chat[1]});
  });
  socket.on('end', function(){
    var i = sockets.indexOf(socket);
    sockets.remove(i);
  });
}).listen(8000);
