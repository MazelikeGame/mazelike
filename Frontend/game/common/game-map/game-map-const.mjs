/* eslint-disable complexity */
export const MIN_SIZE = 16;

export const THEMES = (() => {
  let themes = [];

  for(let i = 0; i < 3; ++i) {
    for(let j = 0; j < 8; ++j) {
      if(i < 2 && j < 5 && i !== 0 && j !== 0) {
        themes.push(`${i}-${j}`);
      }
    }
  }

  return themes;
})();