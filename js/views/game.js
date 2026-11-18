import { getPokemons } from '../api/pokeapi.js';
import { saveGame } from '../api/firebase.js';
import { FLIP_BACK_DELAY, MAX_POKEMON_ID } from '../config.js';
import { getUserId } from '../utils/storage.js';
import { isPositiveEvenInteger } from '../utils/validation.js';
import { randomUniqueIds, shuffle } from '../utils/shuffle.js';
import { createTimer } from '../utils/timer.js';
import { showModal } from '../utils/modal.js';
import { renderRanking } from './ranking.js';

const form = document.getElementById('game-form');
const input = document.getElementById('cards-number');
const playBtn = document.getElementById('play-btn');
const board = document.getElementById('game-board');
const timer = createTimer(document.getElementById('timer'));

let state = null;
let gameCounter = 0;

const resetState = (cardsNumber) => {
  gameCounter += 1;
  state = {
    gameId: gameCounter,
    cardsNumber,
    pairsLeft: cardsNumber / 2,
    selected: [],
    locked: false,
  };
};

const createCard = (pokemon) => {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.id = pokemon.id;
  card.dataset.image = pokemon.image;
  return card;
};

const showCard = (card) => {
  card.classList.add('flipped');
  card.style.backgroundImage = `url("${card.dataset.image}")`;
};

const hideCard = (card) => {
  card.classList.remove('flipped');
  card.style.backgroundImage = '';
};

const finishGame = async () => {
  timer.stop();
  const { cardsNumber } = state;
  const time = timer.getSeconds();
  try {
    const recordId = await saveGame(getUserId(), time, cardsNumber);
    await renderRanking(recordId);
  } catch (error) {
    showModal(`No s'ha pogut guardar la partida: ${error.message}`);
  }
};

const checkPair = () => {
  const [first, second] = state.selected;

  if (first.dataset.id === second.dataset.id) {
    first.classList.add('matched');
    second.classList.add('matched');
    state.selected = [];
    state.pairsLeft -= 1;
    if (state.pairsLeft === 0) finishGame();
    return;
  }

  state.locked = true;
  const { gameId } = state;
  setTimeout(() => {
    if (state.gameId !== gameId) return;
    hideCard(first);
    hideCard(second);
    state.selected = [];
    state.locked = false;
  }, FLIP_BACK_DELAY);
};

const onCardClick = (event) => {
  const card = event.target.closest('.card');
  if (!card || !state || state.locked) return;
  if (card.classList.contains('flipped')) return;

  showCard(card);
  state.selected.push(card);
  if (state.selected.length === 2) checkPair();
};

const startGame = async (cardsNumber) => {
  timer.stop();
  resetState(cardsNumber);
  const { gameId } = state;
  board.replaceChildren();

  try {
    const ids = randomUniqueIds(cardsNumber / 2, MAX_POKEMON_ID);
    const pokemons = await getPokemons(ids);
    if (state.gameId !== gameId) return;

    const cards = shuffle([...pokemons, ...pokemons]).map(createCard);
    board.replaceChildren(...cards);
    playBtn.textContent = 'Volver a jugar';
    timer.start();
  } catch (error) {
    showModal(`No s'han pogut carregar els pokemons: ${error.message}`);
  }
};

const onSubmit = (event) => {
  event.preventDefault();
  const value = input.value;

  if (!isPositiveEvenInteger(value)) {
    showModal('Has d\'introduir un nombre enter, positiu i parell.');
    return;
  }
  if (Number(value) / 2 > MAX_POKEMON_ID) {
    showModal(`El màxim de cartes és ${MAX_POKEMON_ID * 2}.`);
    return;
  }

  startGame(Number(value));
};

export const initGame = () => {
  form.addEventListener('submit', onSubmit);
  board.addEventListener('click', onCardClick);
};
