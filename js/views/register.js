import { saveUser } from '../api/firebase.js';
import { setUserId } from '../utils/storage.js';
import { showModal } from '../utils/modal.js';

/**
 * Inicialitza el formulari de registre.
 * @param {() => void} onRegistered es crida quan l'usuari s'ha registrat
 */
export const initRegister = (onRegistered) => {
  const form = document.getElementById('user-form');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();

    if (!username || !email) {
      showModal('Cal omplir el username i l\'email.');
      return;
    }

    try {
      const userId = await saveUser(username, email);
      setUserId(userId);
      form.reset();
      onRegistered();
    } catch (error) {
      showModal(`No s'ha pogut registrar l'usuari: ${error.message}`);
    }
  });
};
