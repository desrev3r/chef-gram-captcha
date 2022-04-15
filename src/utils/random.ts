import crypto from "crypto";

export const randomHex = () =>
  `${crypto.randomBytes(48).toString("hex").slice(0, 12)}`;

export const randomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min);

export const shuffle = (array: any[]) => {
  var m = array.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
};
