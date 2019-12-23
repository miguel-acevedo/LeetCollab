// The ID of the extension we want to talk to.
console.log("Injected");

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;
  
    if (event.data.type && (event.data.type == "recieve")) {
        var editor = document.querySelector('.CodeMirror').CodeMirror;
        editor.setValue(event.data.text);
        // ABTRACT OUT SETTING A MESSAGE ON CLIENT SIDE
    }
  }, false);

setTimeout(function(){
    var editor = document.querySelector('.CodeMirror').CodeMirror;
    var value = editor.getValue();
    
    // Intital request. Check if there is a message which should be fetched.
    //window.postMessage({ type: "INITIAL_MESSAGE", text: value }, "*");
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
    var from = change.from;
    var text = change.text.join("\n");
    var removed = change.removed.join("\n");
    var to =  cm.posFromIndex(cm.indexFromPos(from) + text.length);
  
    var before = cm.getRange({ line: 0, ch: 0 }, from);
    var after = cm.getRange(to, { line: cm.lineCount() + 1, ch: 0 });
  
    console.log("after change");
    console.log(before);
    console.log(removed);
    console.log(text);
    console.log(after);
    console.log([change.from, change.to]);
  });

}, 2000); // Make this execute as soon as the editor loads/is reachable.