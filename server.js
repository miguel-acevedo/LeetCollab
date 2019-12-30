const log = console.log
// initialize http server, socket.io and port number
const http = require('http').createServer()
//const io = require('socket.io')(http, {'pingInterval': 2000, 'pingTimeout': 5000});
const io = require('socket.io')(http);
const port = 3000
http.listen(port, () => log(`server listening on port: ${port}`))

var recent_message = {};

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
    })

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