import { SESSION_KEY } from '../config.js';

export const getUserId = () => sessionStorage.getItem(SESSION_KEY);

export const setUserId = (id) => sessionStorage.setItem(SESSION_KEY, id);

export const removeUserId = () => sessionStorage.removeItem(SESSION_KEY);
