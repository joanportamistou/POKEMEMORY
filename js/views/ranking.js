import { getRanking, getUsers } from '../api/firebase.js';
import { formatTime } from '../utils/time.js';

const MAX_VISIBLE = 5;
const TOP_VISIBLE = 4;

const tbody = () => document.querySelector('#ranking tbody');

/** Ordena per cartes (major a menor) i després per temps (menor a major). */
export const sortRanking = (records) =>
  [...records].sort((a, b) => b.cards - a.cards || a.time - b.time);

/**
 * Decideix quines files es mostren. Retorna una llista de registres
 * on `null` representa uns punts suspensius.
 */
export const visibleRows = (records, highlightId) => {
  if (records.length <= MAX_VISIBLE) return records;

  const rows = records.slice(0, TOP_VISIBLE);
  const index = records.findIndex((record) => record.id === highlightId);

  rows.push(null);
  if (index >= TOP_VISIBLE) {
    rows.push(records[index]);
    if (index < records.length - 1) rows.push(null);
  }
  return rows;
};

const createCell = (text) => {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
};

const createEllipsisRow = () => {
  const tr = document.createElement('tr');
  tr.classList.add('ellipsis');
  const td = createCell('...');
  td.colSpan = 5;
  tr.append(td);
  return tr;
};

const createRow = (record, highlightId) => {
  const tr = document.createElement('tr');
  if (record.id === highlightId) tr.classList.add('highlight');
  tr.append(
    createCell(record.position),
    createCell(record.username),
    createCell(record.email),
    createCell(formatTime(record.time)),
    createCell(record.cards),
  );
  return tr;
};

/**
 * Carrega el ranking de Firebase i el pinta.
 * @param {string} [highlightId] id del registre acabat d'afegir
 */
export const renderRanking = async (highlightId) => {
  const [ranking, users] = await Promise.all([getRanking(), getUsers()]);

  const records = sortRanking(
    Object.entries(ranking).map(([id, game]) => ({
      id,
      ...game,
      username: users[game.userId]?.username ?? '-',
      email: users[game.userId]?.email ?? '-',
    })),
  ).map((record, index) => ({ ...record, position: index + 1 }));

  const body = tbody();
  body.replaceChildren(
    ...visibleRows(records, highlightId).map((record) =>
      record ? createRow(record, highlightId) : createEllipsisRow(),
    ),
  );
};
