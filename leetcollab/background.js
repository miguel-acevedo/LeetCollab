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

var changeUrl = (id, socket) => {
  // store url on load
  var currentPage = window.location.href;

  // listen for changes
  setInterval(function()
  {
      if (currentPage != window.location.href)
      {
          window.history.pushState("", "", '?session=' + id);
      }
  }, 500);
}

var connect = (sessionId) => {

  // Call a function to change all buttons linking to something else to contain the session ID.

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
      console.log("RECIEVED MSG");
      console.log(data);
      if (data != null) {
        console.log("Going to update");
        window.postMessage({ type: "recieve", text: data }, "*");
      }
      //editor.value = data
  });

  socket.on('change_text', (text, start, end) => {
    window.postMessage({type: "change_text", text: text, start: start, end: end}, "*");
  });

  socket.on('button_click', (button) => {
    console.log("recieved a button click request");
    window.postMessage({type: "button_click", button: button}, "*");
  });
  
  socket.on('debug', (data) => {
      console.log(data);
  });

  window.addEventListener("message", function(event) {
    // ABOUT TO SEND TEXT
    if (event.source != window)
      return;
    
    if (event.data.type && (event.data.type == "SEND_MESSAGE")) {
      var value = event.data.text;
      socket.send(value);
      console.log(value);
      //console.log(event.data.text);
      //port.postMessage(event.data.text);
    } else if (event.data.type && (event.data.type == "INITIAL_MESSAGE")) {
      var value = event.data.text;
      console.log("going to emit");
      console.log(value);
      socket.emit("initial_message", value);
    } else if (event.data.type && (event.data.type == "UPDATE_TEXT")) {
      var text = event.data.text;
      var start = event.data.start;
      var end = event.data.end;
      var all = event.data.all;
      console.log(text);
      socket.emit("update_text", all, text, start, end);
    } else if (event.data.type && (event.data.type == "BUTTON_CLICK")) {
      console.log("got here");
      socket.emit("button_click", event.data.button);
    }

  }, false);

  //console.log("loaded");
  changeUrl(sessionId, socket);

}

// Main
var session = getParam("session");
console.log(session);

if (session != null) {
  connect(session);
} else {
  console.log("No session ID");
}


/*
TODO:

Add a button above the editor, when clicked. It will add an id to the url i.e. ?session=53AB93L93.

One then sends another user the link.

When first visiting a leetcode problem, check if there is a session id, if so, join it and state the active users in that room id.

BUTTON: *SHARE*
-> *LIVE [count of ppl in room]*

If you're not logged in. You can only do read only mode.

Work on figuring out what client's code will be shown. 
-> Add owner to session. Only do a lazy load update if it's the owner's request.

Make it so the editor does not reset itself and go to the beggining. Make it so client does not keep closing automatically.
*/