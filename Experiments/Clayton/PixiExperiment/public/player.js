class Player
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
}

export default Player;