import { removeUserId } from '../utils/storage.js';

export const initLogout = () => {
  document.getElementById('logout-btn').addEventListener('click', () => {
    removeUserId();
    window.location.reload();
  });
};
