// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// Get window url params
var getParam = (name) => {
  var url_string = window.location.href;
  var url = new URL(url_string);
  return url.searchParams.get(name);
}

var connect = (sessionId) => {
  var socket = io('http://localhost:3000');

  // Join a room by session
  socket.emit('join', sessionId);

  // Injects script to listen for browser activity.
  var s = document.createElement('script');
  s.src = chrome.runtime.getURL('inject.js');
  s.onload = function() {
      this.remove();
  };
  (document.head || document.documentElement).appendChild(s);

  // ABOUT TO RECIEVE TEXT
  
  socket.on('message', (data) => {
      console.log(data);
      //window.postMessage({ type: "recieve", text: data }, "*");
      //editor.value = data
  })
  
  socket.on('debug', (data) => {
      console.log(data);
  })

  window.addEventListener("message", function(event) {
    // ABOUT TO SEND TEXT
    if (event.source != window)
      return;
  
    if (event.data.type && (event.data.type == "FROM_PAGE")) {
      var value = event.data.text;
      socket.send(value);
      console.log(value);
      //console.log(event.data.text);
      //port.postMessage(event.data.text);
    }
  }, false);

}

// Main
var session = getParam("session");
console.log(session);

if (session != null) {
  connect(session);
}


/*
TODO:

Add a button above the editor, when clicked. It will add an id to the url i.e. ?session=53AB93L93.

One then sends another user the link.

When first visiting a leetcode problem, check if there is a session id, if so, join it and state the active users in that room id.

BUTTON: *SHARE*
-> *LIVE [count of ppl in room]*

If you're not logged in. You can only do read only mode.
*/