const log = console.log
// initialize http server, socket.io and port number
const http = require('http').createServer()
const io = require('socket.io')(http)
const port = 3000
http.listen(port, () => log(`server listening on port: ${port}`))

io.on('connection', (socket) => {
    log('connected')

    // Make it so that when one sends a message, it sends to a specific room.
    socket.on('message', (evt) => {
        log(evt)
        //log(socket.room)
        //io.emit('message', evt)
        socket.broadcast.to(socket.room).emit('message', evt)
        // emit to only a specific room.
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