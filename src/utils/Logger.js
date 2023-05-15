import { ConsoleColor } from "./ConsoleColor.js";

export const Logger = {
  red: (...msg) => {
    console.log(ConsoleColor.FgRed, ...msg, ConsoleColor.Reset);
  },
  cyan: (...msg) => {
    console.log(ConsoleColor.FgCyan, ...msg, ConsoleColor.Reset);
  },
  green: (...msg) => {
    console.log(ConsoleColor.FgGreen, ...msg, ConsoleColor.Reset);
  },
  yellow: (...msg) => {
    console.log(ConsoleColor.FgYellow, ...msg, ConsoleColor.Reset);
  },
  blue: (...msg) => {
    console.log(ConsoleColor.FgBlue, ...msg, ConsoleColor.Reset);
  },
  magenta: (...msg) => {
    console.log(ConsoleColor.FgMagenta, ...msg, ConsoleColor.Reset);
  },
  gray: (...msg) => {
    console.log(ConsoleColor.FgGray, ...msg, ConsoleColor.Reset);
  },
  black: (...msg) => {
    console.log(ConsoleColor.FgBlack, ...msg, ConsoleColor.Reset);
  },
  white: (...msg) => {
    console.log(ConsoleColor.FgWhite, ...msg, ConsoleColor.Reset);
  },
};
