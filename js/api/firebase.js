import { FIREBASE_URL } from '../config.js';

const request = async (path, options = {}) => {
  const response = await fetch(`${FIREBASE_URL}/${path}.json`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Error de Firebase (${response.status})`);
  }
  return response.json();
};

/** Retorna tots els usuaris com a objecte { id: { username, email } } */
export const getUsers = async () => (await request('users')) ?? {};

/**
 * Si l'email ja existeix sobreescriu el username, si no crea un usuari nou.
 * @returns {Promise<string>} id de l'usuari
 */
export const saveUser = async (username, email) => {
  const users = await getUsers();
  const existingId = Object.keys(users).find(
    (id) => users[id].email.toLowerCase() === email.toLowerCase(),
  );

  if (existingId) {
    await request(`users/${existingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ username }),
    });
    return existingId;
  }

  const { name } = await request('users', {
    method: 'POST',
    body: JSON.stringify({ username, email }),
  });
  return name;
};

/**
 * Guarda una partida finalitzada.
 * @returns {Promise<string>} id del registre creat
 */
export const saveGame = async (userId, time, cards) => {
  const { name } = await request('ranking', {
    method: 'POST',
    body: JSON.stringify({ userId, time, cards }),
  });
  return name;
};

/** Retorna totes les partides com a objecte { id: { userId, time, cards } } */
export const getRanking = async () => (await request('ranking')) ?? {};
