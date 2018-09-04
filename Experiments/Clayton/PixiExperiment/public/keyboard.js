export class Keyboard
{
    constructor(player)
    {
        var speed = 5;
 
        document.addEventListener('keydown', (event) =>
        {
            switch(event.keyCode)
            {
                case 38: //UP
                    player.setY = player.y - 1 * speed;
                    break;
                case 40: //DOWN
                    player.setY = player.y + 1 * speed;
                    break;
                case 39: //RIGHT
                    player.setX = player.x + 1 * speed;
                    break;
                case 37: //LEFT
                    player.setX = player.x - 1 * speed;
                    break;
            }

            event.preventDefault();
        });
    }
}