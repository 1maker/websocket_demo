const session = require('express-session');
const express = require('express');
const app = express();
const http = require('http')
const server = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ clientTracking: true, noServer: true });
const colors = [
	{'black':'#000000'}, 
	{'strong_blue':'#0099cc'},
	{'dark_green':'#339900'}, 
	{'dark_pink':'#990033'}, 
	{'pure_yellow':'#ccff00'}
];

let matching = {};	// объект сопоставления цветов и подключенных клиентов

function random_key_in_colors_array(min, max) {
  
	// случайное число от min до (max+1)
	
	return Math.floor(min + Math.random() * (max + 1 - min));
}

app.use(express.static(__dirname));

server.on('upgrade', function(request, socket, head) {
	
	wss.handleUpgrade(request, socket, head, (ws) => {
		
		let random_key = random_key_in_colors_array(0, colors.length - 1);
		
		while (Object.values(matching).find(item => item === Object.values(colors[random_key])[0])) {
		
			random_key = random_key_in_colors_array(0, colors.length - 1);
		}
		
		matching[request.headers['sec-websocket-key']] = Object.values(colors[random_key])[0];
		
		ws['colors_colors'] = Object.values(colors[random_key])[0];
		
		console.log(matching);
		
		console.log('Количество подключенных клиентов', wss.clients.size);
		
		//console.log(ws);
		
		ws.on('message', (coordinates) => {
		
			const {x, y} = JSON.parse(coordinates);
			
			for (let client of wss.clients){
				
				//console.log(matching.find(item => item === client['colors_colors']));
				//console.log(JSON.stringify({x, y, color:client['colors_colors']}));
					
				client.send(JSON.stringify({x, y, color:client['colors_colors']}));
			}
		});
		
		ws.on('close', () => {
			
			wss.clients.delete(ws);
			delete matching[request.headers['sec-websocket-key']];
			
			console.log('client is closed');
		});
	});
});

server.listen(9000, () => {
	
	console.log('listening on *:9000');
});
