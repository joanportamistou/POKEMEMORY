const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');

export const showModal = (message) => {
  modalMessage.textContent = message;
  modal.showModal();
};
