beforeEach(() => {
  console.log("RUNNING TEST");
});

describe("Objects in PIXI Resources", function() {
  it("The dog should be in the PIXI resources.", function() {
    expect(PIXI.loader.resources.dog).not.toBeUndefined();
  });
  
  it("The dog's resource name should be dog.", function() {
    expect(PIXI.loader.resources.dog.name).toBe("dog");
  });

  it("The dog's resource URL should match the games.", function() {
    expect(PIXI.loader.resources.dog.url).toBe("DawnLike/Characters/dog.json");
  });
});

describe("Floor in PIXI Resources", function() {
  it("The floor should be in the PIXI resources.", function() {
    expect(PIXI.loader.resources.floor).not.toBeUndefined();
  });
  
  it("The floors's resource name should be dog.", function() {
    expect(PIXI.loader.resources.floor.name).toBe("floor");
  });

  it("The floors's resource URL should match the games.", function() {
    expect(PIXI.loader.resources.floor.url).toBe("DawnLike/Objects/Floor.json");
  });
});

describe("DevMode", function() {
  it("DevMode should be on by default if running on localhost", function() {
    //Need to wait for game.js to load fully then run this.
    if(location.hostname === "localhost") {
      expect(window.devMode).toBe(true);
    } else {
      expect(window.devMode).toBe(false);
    }
  });
});