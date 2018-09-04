export class Player
{
    constructor(username, x, y, sprite)
    {
        console.log("Player (" + username + ") spawned!");
        this.username = username;
        this.x = x;
        this.y = y;

        this.sprite = sprite;
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
    
    set setX(x)
    {
        this.x = x;
        this.sprite.x = x;
    }

    set setY(y)
    {
        this.y = y;
        this.sprite.y = this.y;
    }
}