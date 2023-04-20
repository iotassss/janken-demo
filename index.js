const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
app.use(express.static('public'));

const game = {
  players: [
    // {
    // id: socket.id,
    // move: null,
    // phase: 'standby',
    // }

  ],
  gamePhase: 'starting',
};

io.on('connection', (socket) => {
  console.log('socket.id: ', socket.id);
  socket.send(JSON.stringify(game));

  socket.on('standby', (requestJsonStr) => {
    const player = JSON.parse(requestJsonStr);
    game.players.push(player);
    console.log('game: ', game);

    if (game.players.length < 2) {
      return;
    }

    const responseGameStr = JSON.stringify(game);
    io.emit('game start', responseGameStr);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    //ゲームを初期化
    game.players = [];
    io.emit('game init');
  });

  socket.on('select',(requestJsonStr) => {
    const player = JSON.parse(requestJsonStr);
    game.players.forEach((p) => {
      if (p.id === player.id) {
        p.move = player.move;
      }
    });
    console.log('game: ', game);
    //2人が洗濯したら勝敗を判定
    if (game.players[0].move && game.players[1].move) {
      // 2人のプレイヤーの勝敗を判定
      const player1 = game.players[0];
      const player2 = game.players[1];
      if (player1.move === player2.move) {
        io.emit('draw');
        return;
      } else if (player1.move === 'goo' && player2.move === 'choki') {
        io.emit('game set', player1.id);
        return;
      } else if (player1.move === 'choki' && player2.move === 'paa') {
        io.emit('game set', player1.id);
        return;
      } else if (player1.move === 'paa' && player2.move === 'goo') {
        io.emit('game set', player1.id);
        return;
      } else {
        io.emit('game set', player2.id);
        return;
      }
    }
  });
});

http.listen(443, () => {
  console.log('listening on *:443');
});
