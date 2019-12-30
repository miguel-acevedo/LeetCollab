// The ID of the extension we want to talk to.
console.log("Injected");

var RUN_BUTTON = null;
var SUBMIT_BUTTON = null;

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;
  
    if (event.data.type && (event.data.type == "recieve")) {
        var editor = document.querySelector('.CodeMirror').CodeMirror;
        editor.setValue(event.data.text);
        // ABTRACT OUT SETTING A MESSAGE ON CLIENT SIDE
    } else if (event.data.type && (event.data.type == "change_text")) {
      // Replace only the specific selection
      var editor = document.querySelector('.CodeMirror').CodeMirror;
      var text = event.data.text;
      var start = event.data.start;
      var end = event.data.end;
      console.log(text, start, end);
      editor.replaceRange(text, start, end);
      
    } else if (event.data.type && (event.data.type == "button_click")) {
      switch (event.data.button) {
        case "RUN_CODE":
          RUN_BUTTON.click();
          //console.log(RUN_BUTTON);
        case "SUBMIT_CODE":
          SUBMIT_BUTTON.click();
      }
      // Check if the element can even be found, if so do the click.
    }

  }, false);

setTimeout(function(){
    var editor = document.querySelector('.CodeMirror').CodeMirror;
    var value = editor.getValue();
    RUN_BUTTON = document.querySelector('[data-cy="run-code-btn"]');
    SUBMIT_BUTTON = document.querySelector('[data-cy="submit-code-btn"]');
    
    // Intital request. Check if there is a message which should be fetched.
    window.postMessage({ type: "INITIAL_MESSAGE", text: value }, "*");
    /*
    editor.on('change', function(cMirror, details) {
        if (details.origin == "setValue")
          return;

        var value = cMirror.getValue()
        //console.log(value);
        window.postMessage({ type: "SEND_MESSAGE", text: value }, "*");
      });
    */

   editor.on("change", function (cm, change) {
     console.log("changed");
    if (change.origin == "setValue" || change.origin == null)
      return;
    console.log(change.origin);
    console.log(change);
    
    var from = change.from;
    var text = change.text.join("\n");
    //var removed = change.removed.join("\n");
    //var to =  cm.posFromIndex(cm.indexFromPos(from) + text.length);
  
    //var before = cm.getRange({ line: 0, ch: 0 }, from);
    //var after = cm.getRange(to, { line: cm.lineCount() + 1, ch: 0 });

    //var value = (change.text != "") ? text : removed;
    // Also need to take all of the editors text and store it as the most recent.
    console.log([change.from, change.to]);
    window.postMessage({ type: "UPDATE_TEXT", all: cm.getValue(), text: text, start: change.from, end: change.to }, "*");
    /*
    Take the change positions and store them, send it over with the message sent. The other users recieve these object along with the changed text.
    This will allow appending of information instead of a complete overwrite. Just send the two position object directly along with the text.

    */
  });

  RUN_BUTTON.addEventListener("click", function(event) {
    console.log("got clicked");
    window.postMessage({type: "BUTTON_CLICK", button: "RUN_CODE"}, "*");
  });

  SUBMIT_BUTTON.addEventListener("click", function(event) {
    window.postMessage({type: "BUTTON_CLICK", button: "SUBMIT_CODE"}, "*");
  });

}, 5000); // Make this execute as soon as the editor loads/is reachable.