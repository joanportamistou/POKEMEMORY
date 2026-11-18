import { POKEAPI_URL } from '../config.js';

/**
 * Obté la imatge d'un pokemon a partir de la seva id.
 * @param {number} id
 * @returns {Promise<{ id: number, image: string }>}
 */
export const getPokemon = async (id) => {
  const response = await fetch(`${POKEAPI_URL}/${id}`);
  if (!response.ok) {
    throw new Error(`No s'ha pogut obtenir el pokemon ${id}`);
  }
  const data = await response.json();
  return { id: data.id, image: data.sprites.front_default };
};

/** Obté diversos pokemons en paral·lel. */
export const getPokemons = (ids) => Promise.all(ids.map(getPokemon));
