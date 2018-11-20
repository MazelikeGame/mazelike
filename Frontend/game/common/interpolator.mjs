/**
 * Move an entity between 2 points over time
 * @param entity The thing to move has (x, y and speed)
 * @param deltaTime The time since the last move
 * @param targetx The target x coordinate
 * @param targety The target y coordinate
 */
export default function interpolate(entity, deltaTime, targetx, targety) {
  // Get the distance in the x and y direction we have to move
  let xDist = Math.abs(targetx - entity.x);
  let yDist = Math.abs(targety - entity.y);
  
  // The distance we can move
  let move = entity.speed * (deltaTime / 1000);
  let xMove = Math.min(move, xDist);
  let yMove = Math.min(move, yDist);

  if(!isNaN(xMove)) {
    entity.x += Math.min(xMove, xDist) * (targetx < entity.x ? -1 : 1);
  }

  if(!isNaN(yMove)) {
    entity.y += Math.min(yMove, yDist) * (targety < entity.y ? -1 : 1);
  }
}