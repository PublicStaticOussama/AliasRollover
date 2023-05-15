export const bytesToKiloBytes = (bytes) => bytes / 1024;
export const bytesToMegaBytes = (bytes) => bytes / 1024 / 1024;
export const bytesToGigaBytes = (bytes) => bytes / 1024 / 1024 / 1024;
export const stringToBytes = (str) => {
  const si = str.match(/[a-zA-Z]+/g)[0].toLowerCase(); // matches any string thats not a float
  const valueStr = str.match(/[+-]?\d+(\.\d+)?/g)[0]; // match any float
  const value = +valueStr;
  if (!valueStr) throw Error("Invalid byte value");
  if (!si && value) return value;
  switch (si) {
    case "gb":
      return value * 1024 * 1024 * 1024;
    case "mb":
      return value * 1024 * 1024;
    case "kb":
      return value * 1024;
    case "b":
      return value;
    default:
      throw Error("Invalid byte value");
  }
};
