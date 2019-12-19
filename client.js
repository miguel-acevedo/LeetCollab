/* TEST DUMMY CLIENT */

var socket = io('http://localhost:3000');
socket.emit('join', 'A764Zu8i');
const l = console.log
function getEl(id) {
    return document.getElementById(id)
}
const editor = getEl("editor")
editor.addEventListener("keyup", (evt) => {
    const text = editor.value;
    socket.send(text);
})
socket.on('message', (data) => {
    editor.value = data
})

socket.on('debug', (data) => {
    console.log(data);
})