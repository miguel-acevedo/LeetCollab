// The ID of the extension we want to talk to.
console.log("Injected");

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;
  
    if (event.data.type && (event.data.type == "recieve")) {
        var editor = document.querySelector('.CodeMirror').CodeMirror;
        editor.setValue(event.data.text);
        //console.log("Im here");
    }
  }, false);

setTimeout(function(){
    var editor = document.querySelector('.CodeMirror').CodeMirror;
    //var value = editor.getValue();
    
    //window.postMessage({ type: "FROM_PAGE", text: value }, "*");
    // ONLY SEND UPDATE WHEN TEXT IS CHANGED.

    editor.on('change', function(cMirror, details){
        if (details.origin == "setValue")
          return;

        var value = cMirror.getValue()
        //console.log(value);
        window.postMessage({ type: "FROM_PAGE", text: value }, "*");
      });

}, 3000);