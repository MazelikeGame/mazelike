const GRACE_PERIOD = 100;
const MAX_FRAME_LENGTH = 50; /* # of ms between frames at 20 fps */

/**
 * Handle player movement
 * @param sock 
 * @param floor 
 */
export default function movementHandler(sock, floorRef) { 
  sock.on("player-frame", async(frame) => {
    let player = floorRef.floor.players.find((_player) => {
      return _player.name === sock.user.username;
    });

    if(player && player.alive) {
      verifyTimes(frame, player);
      let frames = breakUpFrame(frame);
      player._frames = player._frames.concat(frames);
    }
  });
}

// Ensure frame times make sense
function verifyTimes(frame, player) {
  let duration = (Date.now() - player._lastFrame) + GRACE_PERIOD;
  let userDuration = Math.abs(frame.end - frame.start);
  player._lastFrame = Date.now();

  frame.end = frame.start + Math.min(userDuration, duration);
}

// Break up a long frame so collision detection can work
function breakUpFrame(frame) {
  let frames = [];

  while(frame.end - frame.start > MAX_FRAME_LENGTH) {
    let first = Object.assign({}, frame);
    first.end = first.start + MAX_FRAME_LENGTH;
    frame.start = first.end;
    first.attacking = false;
    frames.push(first);
  }

  frames.push(frame);
  return frames;
}