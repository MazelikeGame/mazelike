/**
 * Handle player movement
 * @param sock 
 * @param floor 
 */
export default function movementHandler(sock, floor) { 
  sock.on("player-frame", async(frame) => {
    let player = floor.players.find((_player) => {
      return _player.name === sock.user.username;
    });

    player._frames.push(frame);
  });
}