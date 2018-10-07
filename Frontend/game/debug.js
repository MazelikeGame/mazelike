export let ml = window.ml || (window.ml = {});

let noop = () => {};
let enabledLogs = location.hash.substr(1).split(",");
let debugAll = enabledLogs.indexOf("all") !== -1;

/**
 * Define a command that can be run from dev tools as either name or ml.name()
 * @param {*} name The name for the command
 * @param {*} fn The function to run as the command
 */
export function command(name, fn) {
  if(name.indexOf(" ") !== -1) {
    throw new Error("Spaces are not allowed");
  }
  
  ml[name] = fn;

  Object.defineProperty(window, name, {
    get: fn.bind(ml)
  });
}

/**
 * Get a reference to console or a console mock depending on whether debugging is enabled for a module
 * @param {string} name Module name
 */
export function dbgLog(name) {
  if(enabledLogs.indexOf(name) !== -1 || debugAll) {
    return console;
  }

  return {
    log: noop,
    warn: noop,
    error: noop,
    debug: noop
  };
}