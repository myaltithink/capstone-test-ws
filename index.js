const express = require('express');
const http = require('http');
const {WebSocketServer} = require('ws');

const app = express();
const server = http.createServer(app);

console.log("\n================================================")
console.log("Starting WebSocket Server...")
const wss = new WebSocketServer({
    server: server
});
console.log("Websocket Server Successfully Started...");

let connCollection = {};

wss.on('connection', (ws, request) => {

    if (connCollection[request.url] !== undefined) {
        var newCollections = connCollection[request.url];
        newCollections.push(ws);
        console.log("Updated the " + request.url + ", added a new client");
        console.log(request.url + " now has " + newCollections.length + " clients");
        connCollection = {
            ...connCollection,
            [request.url]: newCollections
        }
    } else {
        console.log("Created a new Collection for " + request.url)
        connCollection = {
            ...connCollection,
            [request.url]: [ws]
        }
    }

    ws.on('message', (message, isBinary) => {
        for (const socket of connCollection[request.url]) {
            if (socket.OPEN) {
                socket.send(message, {binary: isBinary});
            }
        }
    }) 

    ws.on('close', (client) => {
        let collections = connCollection[request.url];
        for (let i = 0; i < collections.length; i++) {
            if(collections[i] === ws){
                console.log("a client has been closed on " + request.url)
                collections.splice(i, 1);
                connCollection = {
                    ...connCollection,
                    [request.url]: collections
                }
                break; 
            }
        }
        ws.close();
    });

})


server.listen(3000, () => {
    console.log(`WebSocket Server listening at port 3000`);
    console.log("================================================\n")
});