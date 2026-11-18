/**
 * Comprova que el valor sigui un nombre enter, positiu i parell.
 * @param {string} value
 * @returns {boolean}
 */
export const isPositiveEvenInteger = (value) => {
  const trimmed = String(value).trim();
  if (!/^\d+$/.test(trimmed)) return false;
  const number = Number(trimmed);
  return number > 0 && number % 2 === 0;
};
