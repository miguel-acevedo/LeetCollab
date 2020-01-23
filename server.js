const log = console.log
// initialize http server, socket.io and port number
const http = require('http').createServer()
//const io = require('socket.io')(http, {'pingInterval': 2000, 'pingTimeout': 5000});
const io = require('socket.io')(http);
const port = 3000
http.listen(port, () => log(`server listening on port: ${port}`))

var recent_message = {};
var rooms = {};

io.on('connection', (socket) => {
    log('connected')

    // Make it so that when one sends a message, it sends to a specific room.
    socket.on('message', (evt) => {
        log(evt)
        //log(socket.room)
        //io.emit('message', evt)
        recent_message[socket.room] = evt
        // Sends to everyone except the sender.
        socket.broadcast.to(socket.room).emit('message', evt)
        // emit to only a specific room.
    })

    socket.on('update_text', (all, text, start, end) => {
        log(text)
        recent_message[socket.room] = all;
        socket.broadcast.to(socket.room).emit('change_text', text, start, end)
    });

    socket.on('initial_message', (message) => {
        // Use this message to tell the client wether or not to post it's content on load.
        // Also recieve the current text that way if so, it's the first then it gets broadcasted and saved.
        var response = null;
        if (socket.room in recent_message) {
            response = recent_message[socket.room];
        } else {
            recent_message[socket.room] = message;
        }
        log(response)

        // Sends to everyone including the sender.
        io.to(socket.room).emit('message', response);
    });
    

    socket.on('button_click', (button) => {
        log("running");
        socket.broadcast.to(socket.room).emit('button_click', button);
    });

    socket.on('language_change', (language, initial) => {
        log("Changing language");
        // Add a check to only accept valid names.
        if (!(socket.room in rooms)) {
            log("Socket room null");
            return;
        }

        log("here");
        log("intital: " + String(initial))
        log(rooms[socket.room].language + " client: " + language)
        if (rooms[socket.room].language == null) {
            rooms[socket.room].language = language;
            log("This is first language")
        } else if (initial == true && language != rooms[socket.room].language) {
            socket.emit("language_change", rooms[socket.room].language);
            log("Update senders language")
        } else if (initial == false && language != rooms[socket.room].language) {
            rooms[socket.room].language = language;
            socket.broadcast.to(socket.room).emit("language_change", rooms[socket.room].language);
            log("Updating new langauge")
        } else {
            log(" not doing anythign")
        }
        
    });

    socket.on("console_toggle", (toggle) => {
        log("console reached");
        log(toggle);
        if (socket.room in rooms && toggle != null) {
            rooms[socket.room].console = toggle;
            socket.broadcast.to(socket.room).emit('console_toggle', toggle);
        } else if (socket.room in rooms) {
            log("default to:" + rooms[socket.room].console)
            io.to(socket.room).emit('console_toggle', rooms[socket.room].console);
        } else {
            // If the console has yet to be opened. Just store it. Later have this done in the begginning.
            rooms[socket.room] = {
                "console": false,
                "tab": null,
                "text": null,
                "language": null
            }
        }
    });

    socket.on("tab_toggle", (tab, initial) => {
        // 0 -> Intial Request
        // 1 -> Clicked a tab
        log("tab toggle request");
        if (socket.room in rooms) {
            if (rooms[socket.room].tab == null) {
                rooms[socket.room].tab = tab
            } else if (initial == true) {
                socket.emit('tab_toggle', rooms[socket.room].tab);
                // Send back the current tab to the incoming socket only
            } else if (initial == false) {
                rooms[socket.room].tab = tab
                socket.broadcast.to(socket.room).emit('tab_toggle', rooms[socket.room].tab);
                // Send an update to all sockets in the room
            }
        }
    });

    socket.on('console_text', (text) => {
        // If the text in rooms is null, and the input is null. dont do anything.
        // If text in roooms is not null, and input is null: return the room text
        // If text in rooms is null and text is not null, just update the rooms text.
        // if the rooms is not null and and text is not null, send a client update.

        if (socket.room in rooms) {
            if (rooms[socket.room].text == null && text == null) {
                // Pass
            } else if (rooms[socket.room].text != null && text == null) {
                // Send only to the sender with the text
                // Only update if there is a mismatch in the future.
                socket.emit('console_text', rooms[socket.room].text);
            } else if (rooms[socket.room].text == null && text != null) {
                rooms[socket.room].text = text // dont do anything.
            } else if(rooms[socket.room].text != null && text != null) {
                rooms[socket.room].text = text
                socket.broadcast.to(socket.room).emit('console_text', text);
            }
        }
    });

    socket.on('join', function (room) {
        log("someone has joined the room")
        socket.join(room);
        socket.room = room;
        //socket.emit('debug', 'you have connected to room1');
        socket.broadcast.to(socket.room).emit('debug', 'You have connected to room1');
      });

})
io.on('disconnect', (evt) => {
    log('some people left')
})