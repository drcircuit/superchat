const express = require("express");
const app = express();
const crypto = require("crypto");
app.use("/", express.static("./wwwroot"));

function accentResponse(key) {
    return crypto
        .createHash("sha1")
        .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", "binary")
        .digest("base64");
}
const server = app.listen(process.env.SERVERPORT || 666, () => {
    console.info("Server listening on port", server.address().port);
});
const words = ["I'm really hungry", "I'm horny", "Hello", "Dipshit", "Wanna go out?", "Let's do it", "Wanna party?", "Wanna hook up?", "No", "Hellz Yeah!", "You stupid?", "Bye", "CYA", "The world is ending!", "Fuck it..", "Up up and away", "To infinity and beyond!"];
const heroes = ["superman", "batman", "spider-man", "poison ivy", "bumblebee", "supergirl", "wonder woman", "captain marvel", "hulk", "iron man", "wolverine", "the thing", "Mr Fantastic", "Dr Strange"];
function randomHero() {
    let idx = Math.floor(Math.random() * heroes.length);
    return heroes[idx].toUpperCase();
}
function randomWord() {
    let idx = Math.floor(Math.random() * words.length);
    return words[idx];
}
function constructReply(data) {
    // Convert the data to JSON and copy it into a buffer
    const json = JSON.stringify(data)
    const jsonByteLength = Buffer.byteLength(json);
    // Note: we're not supporting > 65535 byte payloads at this stage 
    const lengthByteCount = jsonByteLength < 126 ? 0 : 2;
    const payloadLength = lengthByteCount === 0 ? jsonByteLength : 126;
    const buffer = Buffer.alloc(2 + lengthByteCount + jsonByteLength); // Write out the first byte, using opcode `1` to indicate that the message // payload contains text data 
    buffer.writeUInt8(0b10000001, 0); buffer.writeUInt8(payloadLength, 1); // Write the length of the JSON payload to the second byte 
    let payloadOffset = 2; if (lengthByteCount > 0) { buffer.writeUInt16BE(jsonByteLength, 2); payloadOffset += lengthByteCount; } // Write the JSON data to the data buffer 
    buffer.write(json, payloadOffset);
    return buffer;
}
server.on("upgrade", (req, socket) => {
    if (req.headers["upgrade"] !== "websocket") {
        socket.end("HTTP/1.1 400 Bad Request");
    }
    const clientKey = req.headers["sec-websocket-key"];
    const acceptString = accentResponse(clientKey);
    const responseHeaders = [
        "HTTP/1.1 101 Web Socket Protocol Handshake",
        "Upgrade: WebSocket",
        "Connection: Upgrade",
        "Sec-WebSocket-Accept: " + acceptString];
    socket.write(responseHeaders.join("\r\n") + "\r\n\r\n");
    const int = setInterval(() => {
        setTimeout(() => {
            let payload = { hero: randomHero(), msg: randomWord() };
            socket.write(constructReply(payload));
        }, Math.floor(Math.random() * 2000));
    }, 500);
    socket.on("close", () => {
        clearInterval(int);
        socket.end();
        console.log("Closing...");
    });
    socket.on("error", (err) => {
        clearInterval(int);
        socket.end();
        console.error("Closing...", err);

    });
    socket.on("end", () => {
        clearInterval(int);
        console.log("Ending...");
    });



});