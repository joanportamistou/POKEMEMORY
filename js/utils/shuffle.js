/**
 * Retorna una còpia de l'array barrejada (algorisme Fisher-Yates).
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export const shuffle = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Retorna `count` nombres aleatoris diferents entre 1 i `max`.
 * @param {number} count
 * @param {number} max
 * @returns {number[]}
 */
export const randomUniqueIds = (count, max) => {
  const ids = new Set();
  while (ids.size < count) {
    ids.add(Math.floor(Math.random() * max) + 1);
  }
  return [...ids];
};
