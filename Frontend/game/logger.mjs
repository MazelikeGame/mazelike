/* global ml */
window.ml || (window.ml = {}); // eslint-disable-line

let noop = () => {};

ml.logger = {
  error: noop,
  warn: noop,
  info: noop,
  debug: noop,
  verbose: noop,
  silly: noop,
  log: noop
};