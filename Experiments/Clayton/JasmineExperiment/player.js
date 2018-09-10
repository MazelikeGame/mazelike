class Player
{
    constructor(Name, x, y)
    {
        this.Name = Name;
        this.x = x;
        this.y = y;
    }

    Move()
    {
        this.x++;
        this.y++;
    }
}

module.exports = Player;