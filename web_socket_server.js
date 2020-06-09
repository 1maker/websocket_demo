const uuid = require('uuid');
const session = require('express-session');
const express = require('express');
const app = express();
const server = require('http').createServer(app);

/*const sessionParser = session({
	saveUninitialized: false,
	secret: '$eCuRiTy',
	resave: false
});*/

app.use(express.static(__dirname));

const WebSocket = require('ws');
const wss = new WebSocket.Server({ 
									clientTracking: true, 
									noServer: true 
								});

const clients = new Set();

server.on('upgrade', function(request, socket, head){
	
	console.log('Parsing session from request...');

	wss.handleUpgrade(request, socket, head, function(ws){
	
		clients.add(ws);
	
		ws.on('message', (message) => {
			
			//console.log(request);
			//console.log(socket);
			
			for (let client of clients){
				
				client.send(message + '***');
			}
		
			/*wss.clients.forEach(function each(client){
				
				if (client.readyState === WebSocket.OPEN){
					client.send(data);
				}
			});*/
		});

		ws.on('close', function(){
			
			clients.delete(ws);
			
			console.log('client is closed');
		});
	});
});

server.listen(9000, () => {
	
	console.log('listening on *:9000');
});

/*app.get('/get_websocket', async (req, res) => {
	
	res.set({
		'Access-Control-Allow-Methods':'GET,POST,PATCH',
		'Access-Control-Allow-Headers':'the_key_to_the_apartment_where_the_money_is,Content-Type',
	});
	
	res.send(JSON.stringify({"test":"9876543210"}));
});*/

//app.use(sessionParser);

/*app.get('/start', (req, res) => {
	
	//console.log('Идейно, это должно отработать');
	//res.sendFile(__dirname + '\\index.html');
	//res.send('<h1>Всё работает, всё нормально!</h1>');
});*/

/*sessionParser(request, {}, () => {
		
	if (!request.session.userId){
		
		socket.destroy();
		return;
	}

	console.log('Session is parsed!');

	wss.handleUpgrade(request, socket, head, function(ws) {
		
		wss.emit('connection', ws, request);
	});
});*/




