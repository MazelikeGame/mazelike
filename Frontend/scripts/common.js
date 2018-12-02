if(navigator.serviceWorker && location.protocol === "https:") {
  navigator.serviceWorker.register("/sw.js");
} else if(navigator.serviceWorker) {
  navigator.serviceWorker.getRegistration().then(function(reg) {
    if(reg) {
      reg.unregister();
    }
  });
}