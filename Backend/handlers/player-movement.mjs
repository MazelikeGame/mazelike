/**
 * Handle player movement
 * @param sock 
 * @param floor 
 */
export default function movementHandler(sock, floor) { 
  sock.on('player-movement', async(x, y, username) => {
    let player = floor.players.find((_player) => {
      return _player.name === username;
    });

    player.x = x;
    player.y = y;
  });
}