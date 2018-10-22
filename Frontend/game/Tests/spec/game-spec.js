//NOTES: Will create monster spec once we the Monster class is done.

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