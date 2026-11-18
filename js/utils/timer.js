import { formatTime } from './time.js';

/**
 * Crea un temporitzador que pinta el temps a l'element indicat.
 * @param {HTMLElement} element
 */
export const createTimer = (element) => {
  let seconds = 0;
  let intervalId = null;

  const render = () => {
    element.textContent = formatTime(seconds);
  };

  const stop = () => {
    clearInterval(intervalId);
    intervalId = null;
  };

  const start = () => {
    stop();
    seconds = 0;
    render();
    intervalId = setInterval(() => {
      seconds += 1;
      render();
    }, 1000);
  };

  const getSeconds = () => seconds;

  return { start, stop, getSeconds };
};
