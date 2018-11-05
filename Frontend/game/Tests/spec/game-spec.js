/* global expect, it, describe, PIXI */
describe("Objects in PIXI Resources", () => {
  it("The dog should be in the PIXI resources.", () => {
    expect(PIXI.loader.resources.dog).not.toBeUndefined();
  });

  it("The dog's resource name should be dog.", () => {
    expect(PIXI.loader.resources.dog.name).toBe("dog");
  });

  it("The dog's resource URL should match the games.", () => {
    expect(PIXI.loader.resources.dog.url).toBe("DawnLike/Characters/dog.json");
  });
});

describe("Floor in PIXI Resources", () => {
  it("The floor should be in the PIXI resources.", () => {
    expect(PIXI.loader.resources.floor).not.toBeUndefined();
  });

  it("The floors's resource name should be dog.", () => {
    expect(PIXI.loader.resources.floor.name).toBe("floor");
  });

  it("The floors's resource URL should match the games.", () => {
    expect(PIXI.loader.resources.floor.url).toBe("DawnLike/Objects/Floor.json");
  });
});

// describe('Player in PIXI Resources', () => {
//   it('The player should be in PIXI resources.', () => {
//     expect(PIXI.loader.resources.player).not.toBeUndefined();
//   });

//   it("The player's resource name should be player.", () => {
//     expect(PIXI.loader.resources.player.name).toBe('player');
//   });

//   it("The player's resource URL should match the games.", () => {
//     expect(PIXI.loader.resources.player.url).toBe("DawnLike/Characters/player.json");
//   });
// });
