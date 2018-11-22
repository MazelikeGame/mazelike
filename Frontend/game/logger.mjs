/* global ml */
window.ml || (window.ml = {}); // eslint-disable-line

let noop = () => {};

ml.logger = {
  fatal: noop,
  error: noop,
  warn: noop,
  info: noop,
  debug: noop,
  trace: noop,
  child: () => ml.logger // eslint-disable-line
};