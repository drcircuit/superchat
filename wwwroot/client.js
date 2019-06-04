const c = document.getElementById("console");
c.innerHTML += "Connecting...<br>";

const heroes = [];
const colors = {};
const pallette = ["cyan","yellow", "wheat", "blue","red","white","hotpink","limegreen","GreenYellow","DeepPink","Crimson","Gold","LightYellow","SkyBlue","AquaMarine","PeachPuff","AliceBlue","Plum","Violet","Khaki","RoyalBlue"];
var exampleSocket = new WebSocket("ws://herochat.azurewebsites.net");
exampleSocket.onopen = function (event) {
    exampleSocket.send("Here's some text that the server is urgently awaiting!");
};

exampleSocket.onmessage = function (event) {
    console.log(event.data);
    let data = JSON.parse(event.data);
    if(Object.keys(colors).indexOf(data.hero)>-1){
        console.log("found hero");
    } else {
        console.log("new Hero");
        c.innerHTML += "<span class='announce'>"+data.hero+" joined the chat...</span><br>";
        colors[data.hero] = pallette[Math.floor(Math.random()*pallette.length)];
    }
    c.innerHTML += "<span style='color: "+colors[data.hero]+"' class='hero'>"+data.hero+"> </span><span class='msg'>"+data.msg +"</span><br>";
    c.scrollTop = c.scrollHeight;
}

exampleSocket.onclose = ()=>{
    setTimeout(()=>{
        exampleSocket = new WebSocket("ws://localhost:666");
    },3000);
};
exampleSocket.onerror = ()=>{
    setTimeout(()=>{
        exampleSocket = new WebSocket("ws://localhost:666");
    },3000);
}
