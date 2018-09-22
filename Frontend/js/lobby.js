// Get the data passed in from the template
let hydrate = document.currentScript.dataset;

// Create an auto copy non-modifyable text input
let input = document.querySelector("#join-link-copy");

if(input) {
  let link = input.value;

  input.onfocus = () => {
    input.select();
    document.execCommand("copy");
  };

  input.oninput = () => {
    input.value = link;
    input.select();
  };
}

let sock = io(location.origin);

// Handle a player being dropped
sock.on("lobby-drop", (id) => {
  let item = document.querySelector(`[data-player-id="${id}"]`);

  if(item) {
    item.remove();
  }
});

let group = document.querySelector(".list-group");

// Handle adding a new player
sock.on("lobby-add", (player) => {
  // Create the div for the player item
  let playerItem = document.createElement("div");
  playerItem.setAttribute("class", "list-group-item d-flex justify-content-between align-items-center");
  playerItem.setAttribute("data-player-id", player.id);
  playerItem.innerText = player.name;
  group.appendChild(playerItem);

  // Create the drop link if we are the host
  if(hydrate.ishost === "true") {
    let link = document.createElement("a");
    link.href = `/game/lobby/${hydrate.id}/drop/${player.id}?user=${hydrate.user}`;
    link.innerText = "Drop";
    playerItem.appendChild(link);

    link.addEventListener("click", linkHandler);
  }
});

// Intercept all drop links on the page
Array.from(document.querySelectorAll("a.drop-link"))
  .forEach((link) => {
    link.addEventListener("click", linkHandler);
  });

function linkHandler(e) {
  e.preventDefault();
  fetch(this.href);
  // TODO: Do something with the response
}

// Reload the page if this lobby is deleted
sock.on("lobby-delete", () => {
  location.reload();
});