import { getUserId } from './utils/storage.js';
import { showModal } from './utils/modal.js';
import { initRegister } from './views/register.js';
import { initGame } from './views/game.js';
import { renderRanking } from './views/ranking.js';
import { initLogout } from './views/logout.js';

const registerSection = document.getElementById('register');
const gameSection = document.getElementById('game');

const showGame = () => {
  registerSection.hidden = true;
  gameSection.hidden = false;
  renderRanking().catch((error) =>
    showModal(`No s'ha pogut carregar el ranking: ${error.message}`),
  );
};

const showRegister = () => {
  gameSection.hidden = true;
  registerSection.hidden = false;
};

initRegister(showGame);
initGame();
initLogout();

if (getUserId()) {
  showGame();
} else {
  showRegister();
}
