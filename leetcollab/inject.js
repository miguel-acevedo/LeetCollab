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
    window.postMessage({ type: "INITIAL_MESSAGE", text: value }, "*");

    editor.on('change', function(cMirror, details) {
        if (details.origin == "setValue")
          return;

        var value = cMirror.getValue()
        //console.log(value);
        window.postMessage({ type: "SEND_MESSAGE", text: value }, "*");
      });

}, 2000);