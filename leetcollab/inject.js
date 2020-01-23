// The ID of the extension we want to talk to.
console.log("Injected");

// GLOBAL PREV
var prevOpen = false;
var fromSetValue = false;

// Have it set itself to it's intitial state before this procedure.

const checkConsole = () => {
  // ONLY TRIGGER AN UPDATE ONCE A DIFFERENCE IS FOUND.
  //console.log(document.querySelector(".ace_text-layer"));
  var open = (document.getElementById("testcase-editor") != null)
  //console.log(open);

  if (open != prevOpen) {
    console.log("Console Changed");
    prevOpen = open;
    if (open == true) {
      window.postMessage({ type: "CONSOLE_TOGGLE", toggle: true }, "*");
      // Grab the most recent text saved, and update the console.

      var curr_tab = document.querySelector(".css-qndcpp-TabHeader").getAttribute("data-key");
      window.postMessage({type: "TAB_TOGGLE", tab: curr_tab, initial: true}, "*");
      window.postMessage({type: "CONSOLE_TEXT", text: null}, "*"); // get intial text to update.

      document.querySelector('[data-key="custom-testcase"]').addEventListener("click", function(event) {
        console.log(event);
        if (event.isTrusted) {
          window.postMessage({type: "TAB_TOGGLE", tab: "custom-testcase", initial: false}, "*");
        }
      });

      document.querySelector('[data-key="runcode-result"]').addEventListener("click", function(event) {
        console.log(event);
        if (event.isTrusted) {
          window.postMessage({type: "TAB_TOGGLE", tab: "runcode-result", initial: false}, "*");
        }
      });

      // send a window request to update the custom text case text on change.
      window.editor.getSession().on("change", function() {
        if (!fromSetValue) {
          // Setup a basic on change update text functionality.
          var text = window.editor.getValue();
          window.postMessage({type: "CONSOLE_TEXT", text: text}, "*");
          console.log(text);
          console.log("updated");
        } else {
          //fromSetValue = false;
        }
      });
    } else {
      window.postMessage({ type: "CONSOLE_TOGGLE", toggle: false }, "*");
    }
  }

};

function addStyleString(str) {
  var node = document.createElement('style');
  node.innerHTML = str;
  document.body.appendChild(node);
}

var enable_dropdown = () => {
  addStyleString(".ant-select-dropdown { visibility: hidden; !important }");
  document.getElementsByClassName("ant-select-arrow")[0].click();
  document.getElementsByClassName("ant-select-arrow")[0].click();
  //document.getElementsByClassName("ant-select-arrow")[0].click();
  //addStyleString(".ant-select-dropdown { visibility: visible; !important }");
  setTimeout(function() {
    addStyleString(".ant-select-dropdown { visibility: visible; !important }");
  }, 5000);
}

var intial_language_type = () => {
  var client_language = document.getElementsByClassName("ant-select-selection-selected-value")[0].title;
  window.postMessage({type: "LANGUAGE_CHANGE", language: client_language, initial: true}, "*");
}

var RUN_BUTTON = null;
var SUBMIT_BUTTON = null;
var LANGUAGE_BUTTON = null;

/*
HAVE EVERYTHING IN THE LISTENER CALL A FUNCTION INSTEAD OF HAVING IT WITHIN. <---------
*/

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window || !event.data.type)
      return;
  
    if (event.data.type == "recieve") {
        var editor = document.querySelector('.CodeMirror').CodeMirror;
        editor.setValue(event.data.text);
        // ABTRACT OUT SETTING A MESSAGE ON CLIENT SIDE
    } else if (event.data.type == "change_text") {
      // Replace only the specific selection
      var editor = document.querySelector('.CodeMirror').CodeMirror;
      var text = event.data.text;
      var start = event.data.start;
      var end = event.data.end;
      console.log(text, start, end);
      editor.replaceRange(text, start, end);
      
    } else if (event.data.type == "button_click") {
      switch (event.data.button) {
        case "RUN_CODE":
          RUN_BUTTON.click();
          //console.log(RUN_BUTTON);
        case "SUBMIT_CODE":
          SUBMIT_BUTTON.click();
      }
      // Check if the element can even be found, if so do the click.
    } else if (event.data.type == "console_toggle") {
      console.log("CONSOLE MENU REACHED");
      var toggle = event.data.toggle;
      console.log(toggle);
      if (toggle == true && document.getElementById("testcase-editor") == null) {
        document.querySelector(".custom-testcase__2ah7").click() // Open console
      } else if (toggle == false && document.getElementById("testcase-editor") != null) {
        document.querySelector(".custom-testcase__2ah7").click() // Close console
      }
    } else if (event.data.type == "console_text") {
      if (document.getElementById("testcase-editor") != null) {
        var text = event.data.text;
        fromSetValue = true;
        window.editor.setValue(text);
        window.editor.clearSelection();
        fromSetValue = false;
      }
    } else if (event.data.type == "tab_toggle") {
      if (document.getElementById("testcase-editor") != null) {
        console.log(event.data.tab);
        console.log(document.querySelector('[data-key=' + event.data.tab + ']'));
        document.querySelector('[data-key=' + event.data.tab + ']').click();
      }
    } else if (event.data.type == "language_change") {
      console.log(document.querySelector('[data-cy="lang-select-' + event.data.language +'"]'));
      document.querySelector('[data-cy="lang-select-' + event.data.language +'"]').click();
    }

  }, false);

setTimeout(function(){

  
    var editor = document.querySelector('.CodeMirror').CodeMirror;
    var value = editor.getValue();
    RUN_BUTTON = document.querySelector('[data-cy="run-code-btn"]');
    SUBMIT_BUTTON = document.querySelector('[data-cy="submit-code-btn"]');
    //LANGUAGE_BUTTON = document.getElementsByClassName("ant-select-dropdown-menu")[0];

      // Open and close dropdown for languages.
    // Need to check if the language is different, if so, change it before the intial text is recieved.
    
    // Intital request. Check if there is a message which should be fetched.
    /*
    editor.on('change', function(cMirror, details) {
        if (details.origin == "setValue")
          return;

        var value = cMirror.getValue()
        //console.log(value);
        window.postMessage({ type: "SEND_MESSAGE", text: value }, "*");
      });
    */

   //window.postMessage({ type: "INITIAL_MESSAGE", text: value }, "*");
  
   window.postMessage({ type: "CONSOLE_TOGGLE", toggle: null }, "*");

   enable_dropdown();
   intial_language_type(); // Decide to change language

   window.postMessage({ type: "INITIAL_MESSAGE", text: value }, "*");

   setInterval(checkConsole, 200);

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
    // ADD A POST TO CHANGE THE TAB TO RUN WHEN THIS IS CLICKED.
  });

  SUBMIT_BUTTON.addEventListener("click", function(event) {
    window.postMessage({type: "BUTTON_CLICK", button: "SUBMIT_CODE"}, "*");
  });

  document.getElementsByClassName("ant-select-dropdown-menu")[0].addEventListener("click", function(event) {
    console.log("LICK ME");
    if (event.isTrusted) {
      //var client_language = document.getElementsByClassName("ant-select-selection-selected-value")[0].title;
      //console.log(client_language);
      window.postMessage({type: "LANGUAGE_CHANGE", language: event.target.innerText, initial: false}, "*");
    }
  });
  // if (event.isTrusted) {

}, 5000); // Make this execute as soon as the editor loads/is reachable.