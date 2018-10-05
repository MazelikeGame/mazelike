/* global io */
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
sock.on("lobby-drop", ({id, player}) => {
  if(id !== hydrate.id) {
    return;
  }

  let item = document.querySelector(`[data-player-id="${player}"]`);

  if(item) {
    item.remove();
  }
});

let group = document.querySelector(".list-group");

// Handle adding a new player
sock.on("lobby-add", ({id, playerId, image_name}) => {
  if(id !== hydrate.id) {
    return;
  }

  // Create the div for the player item
  let playerItem = document.createElement("div");
  playerItem.setAttribute("class", "list-group-item d-flex justify-content-between align-items-center");
  playerItem.setAttribute("data-player-id", playerId);
  
  let userInfo = document.createElement("div");
  userInfo.setAttribute("class", "userinfo");

  let playerImage = document.createElement("img");
  if(image_name !== null) {
    playerImage.setAttribute("src", `../../public/images/${image_name}`);
  } else {
    playerImage.setAttribute("src", `../../img/profilepic.jpg`);
  }
  playerImage.setAttribute("class", "avatar rounded float-left");

  let usernameElement = document.createElement("span");
  usernameElement.setAttribute("class", "username");
  usernameElement.innerText = playerId;

  group.appendChild(playerItem);
  playerItem.appendChild(userInfo);
  userInfo.appendChild(playerImage);
  userInfo.appendChild(usernameElement);

  // Create the drop link if we are the host
  if(hydrate.ishost === "true") {
    let link = document.createElement("a");
    link.href = `/game/lobby/${hydrate.id}/drop/${playerId}`;
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
  fetchAndNotify(this.href);
}

// Reload the page if this lobby is deleted
sock.on("lobby-delete", (id) => {
  if(id === hydrate.id) {
    location.reload();
  }
});

// Go to the game page
sock.on("lobby-start", (id) => {
  if(id === hydrate.id) {
    location.href = `/game/${id}`;
  }
});

// Start the game
let startBtn = document.querySelector("#start");

if(startBtn) {
  startBtn.addEventListener("click", () => {
    fetchAndNotify(`/game/lobby/${hydrate.id}/start`);
  });
}

let container = document.querySelector(".container");
let notifyTimeout;

// Show a notification
function notify(msg, type = "primary") {
  let alert = document.querySelector(".alert");
  if(alert) {
    alert.remove();
  }

  clearTimeout(notifyTimeout);
  notifyTimeout = setTimeout(() => {
    let _alert = document.querySelector(".alert");
    if(_alert) {
      _alert.remove();
    }
  }, 3000);

  let alertDiv = document.createElement("div");
  alertDiv.setAttribute("class", `alert alert-${type}`);
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerText = msg;

  container.insertBefore(alertDiv, container.firstChild);
}

// Fetch a url and show the response as a notification
function fetchAndNotify(url) {
  return fetch(url, {
    credentials: "same-origin"
  })
    .then((res) => {
      return res.text()
        .then((text) => {
          notify(text, res.ok ? "primary" : "danger");
        });
    });
}