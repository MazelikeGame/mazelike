/* global PIXI */
/** @module Monster */

export default class Monster {
  
  constructor(name_in, hp_in, damage_in) {
    this.name = name_in;
    this.hp = hp_in;
    this.damage = damage_in;
    this.targetAquired = false; // if monster knows where a player is
    //x: 0;
    //y: 0;
    //PCx: -1; // -1 if not sseen yet
    //PCy: -1;
    
    this.sprite = new PIXI.Text("monster1", this._textStyle);
    this.sprite.setText("monster2");
    let metrics = PIXI.TextMetrics.measureText("monster2", this._textStyle);
    this.sprite.position.set(innerWidth - 20 - metrics.width, 20);

    this.create();
  }
  canSeePC() {
    // if can see player
    // set PCx and PCy
    this.targetAquired = true;
  }
  wander() { // if PC not seen yet OR last seen PC location has been explored
    // move to random point adj to current location
    // once a second
  }
  move() {
    if(!this.targetAquired) {
      this.wander();
    } else {
      //move strategically, to be implemented later when PC is on map
    }
  }
  attack(target) {
    var msg = " attacked ";
    alert(this.name[0] + msg + target);
    // implement damage later when PC is on map
  }
  create() {
    var msg = " created.";
    alert(this.name[0] + msg);
    // place on map
  }
}