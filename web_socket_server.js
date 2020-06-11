const uuid = require('uuid');
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

const matching = {};	// объект сопоставления цветов и подключенных клиентов
const hashes = {};

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
		ws['socket_socket'] = request.headers['sec-websocket-key'];
		
		console.log('Количество подключенных клиентов', wss.clients.size);
		console.log(matching);
		
		hashes[request.headers['sec-websocket-key']] = [];
		
		let exclude = Object.keys(hashes).filter(elem => elem !== ws['socket_socket']);
		
		for (let client of wss.clients) {
			
			if (exclude.length !== 0) {
			
				for (let i = 0; i < exclude.length; i++){
					
					client.send(JSON.stringify(hashes[exclude[i]]));
				}
			}
		}
		
		ws.on('message', (coordinates) => {
		
			const {x, y} = JSON.parse(coordinates);
			
			let entries_matching = Object.entries(matching);
			let socket_id;
			
			for (let i = 0; i < entries_matching.length; i++){
				
				if (entries_matching[i][1] === ws['colors_colors']){
					
					socket_id = entries_matching[i][0];
					
					break;
				}
			}
			
			hashes[socket_id].push({x, y, color:ws['colors_colors'], uuid: uuid.v4()});
			
			for (let client of wss.clients){
			
				let array_hashes = Object.keys(hashes);
			
				for (let client of wss.clients){
					
					if (array_hashes.length !== 0){
					
						for (let i = 0; i < array_hashes.length; i++){
							
							client.send(JSON.stringify(hashes[array_hashes[i]]));
						}
					}
				}
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
