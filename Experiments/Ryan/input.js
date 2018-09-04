// Get (key)up and (key)down events for a specific set of keys
export class KeyHandler {
    constructor(...keyCodes) {
        this._keyCodes = new Set(keyCodes);
        this._type = "Up";

        // Make sure this is still this object and make sure we have a reference
        // to the functions we pass to addEventListener
        this._keyUp = this._keyEvent.bind(this, "Up");
        this._keyDown = this._keyEvent.bind(this, "Down");

        addEventListener("keyup", this._keyUp);
        addEventListener("keydown", this._keyDown);
    }

    // Remove all event listeners
    detach() {
        removeEventListener("keyup", this._keyUp);
        removeEventListener("keydown", this._keyDown);
    }

    _keyEvent(type, e) {
        if(this._keyCodes.has(e.which) && typeof this[`on${type}`] === "function" && this._type !== type) {
            this[`on${type}`](e.which);
            this._type = type;
        }
    }
}

export const KEY_CODES = {
    "UP_ARROW": 38,
    "DOWN_ARROW": 40,
    "LEFT_ARROW": 37,
    "RIGHT_ARROW": 39
};
