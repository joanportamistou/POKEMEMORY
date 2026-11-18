/* global cy, describe, beforeEach, it, expect */

// Base de dades falsa en memòria per no dependre de Firebase ni de PokeAPI
const createDb = () => ({ users: {}, ranking: {}, counter: 0 });

const stubApis = (db) => {
  const nextId = () => `id${(db.counter += 1)}`;

  cy.intercept('GET', '**/users.json', (req) => req.reply(db.users)).as('getUsers');
  cy.intercept('POST', '**/users.json', (req) => {
    const id = nextId();
    db.users[id] = req.body;
    req.reply({ name: id });
  }).as('postUser');
  cy.intercept('PATCH', '**/users/*.json', (req) => {
    const id = req.url.split('/users/')[1].replace('.json', '');
    db.users[id] = { ...db.users[id], ...req.body };
    req.reply(db.users[id]);
  }).as('patchUser');
  cy.intercept('GET', '**/ranking.json', (req) => req.reply(db.ranking)).as('getRanking');
  cy.intercept('POST', '**/ranking.json', (req) => {
    const id = nextId();
    db.ranking[id] = req.body;
    req.reply({ name: id });
  }).as('postRanking');
  cy.intercept('GET', '**/api/v2/pokemon/*', (req) => {
    const id = Number(req.url.split('/').pop());
    req.reply({ id, sprites: { front_default: `https://img.test/${id}.png` } });
  });
};

const register = (username = 'ash', email = 'ash@pokemon.com') => {
  cy.get('#username').type(username);
  cy.get('#email').type(email);
  cy.get('#user-form').submit();
};

const play = (cards) => {
  cy.get('#cards-number').clear().type(String(cards));
  cy.get('#play-btn').click();
};

const solveBoard = () => {
  cy.get('#game-board .card').then(($cards) => {
    const ids = [...new Set([...$cards].map((card) => card.dataset.id))];
    ids.forEach((id) => {
      cy.get(`#game-board .card[data-id="${id}"]`).each(($card) => cy.wrap($card).click());
    });
  });
};

describe('PokeMemory', () => {
  let db;

  beforeEach(() => {
    db = createDb();
    stubApis(db);
    cy.visit('/');
  });

  describe('Registre', () => {
    it('mostra només el formulari de registre si no hi ha usuari', () => {
      cy.get('#user-form').should('be.visible');
      cy.get('#game').should('not.be.visible');
    });

    it('crea un usuari nou i guarda la id al sessionStorage', () => {
      register();
      cy.wait('@postUser');
      cy.window().its('sessionStorage').invoke('getItem', 'user').should('eq', 'id1');
      cy.get('#game').should('be.visible');
      cy.get('#user-form').should('not.be.visible');
    });

    it('sobreescriu el username si l\'email ja existeix', () => {
      db.users.existing = { username: 'old', email: 'ash@pokemon.com' };
      register('newname');
      cy.wait('@patchUser');
      cy.window().its('sessionStorage').invoke('getItem', 'user').should('eq', 'existing');
      cy.then(() => expect(db.users.existing.username).to.eq('newname'));
    });
  });

  describe('Joc', () => {
    beforeEach(() => register());

    it('mostra un error al modal si el número no és parell', () => {
      play(3);
      cy.get('#modal').should('be.visible');
    });

    it('mostra un error al modal si el número no és positiu', () => {
      play(-4);
      cy.get('#modal').should('be.visible');
    });

    it('mostra un error al modal si no és un enter', () => {
      cy.get('#play-btn').click();
      cy.get('#modal').should('be.visible');
    });

    it('comença la partida amb les cartes demanades', () => {
      play(6);
      cy.get('#game-board .card').should('have.length', 6);
      cy.get('#play-btn').should('contain', 'Volver a jugar');
      cy.get('#timer').should('contain', '0m 1s');
    });

    it('gira una carta i li posa background-image', () => {
      play(4);
      cy.get('#game-board .card').first().click()
        .should('have.class', 'flipped')
        .and('have.attr', 'style').and('contain', 'background-image');
    });

    it('torna a girar dues cartes diferents', () => {
      play(4);
      cy.get('#game-board .card').then(($cards) => {
        const first = $cards[0];
        const other = [...$cards].find((card) => card.dataset.id !== first.dataset.id);
        cy.wrap(first).click();
        cy.wrap(other).click();
        cy.wrap(first).should('not.have.class', 'flipped');
        cy.wrap(other).should('not.have.class', 'flipped');
      });
    });

    it('marca les parelles trobades amb la classe matched', () => {
      play(4);
      cy.get('#game-board .card').first().invoke('attr', 'data-id').then((id) => {
        cy.get(`#game-board .card[data-id="${id}"]`).each(($card) => cy.wrap($card).click());
        cy.get(`#game-board .card[data-id="${id}"]`).should('have.class', 'matched');
      });
    });

    it('en guanyar para el temporitzador i guarda la partida', () => {
      play(4);
      solveBoard();
      cy.wait('@postRanking').its('request.body').should((body) => {
        expect(body).to.have.keys('userId', 'time', 'cards');
        expect(body.userId).to.eq('id1');
        expect(body.cards).to.eq(4);
      });
      cy.get('#timer').invoke('text').then((text) => {
        cy.wait(1500);
        cy.get('#timer').should('have.text', text);
      });
    });
  });

  describe('Ranking', () => {
    it('ordena per cartes i temps i ressalta la partida nova', () => {
      db.users.u1 = { username: 'misty', email: 'misty@pokemon.com' };
      db.ranking.r1 = { userId: 'u1', time: 10, cards: 4 };
      db.ranking.r2 = { userId: 'u1', time: 5, cards: 8 };
      register();
      play(2);
      solveBoard();
      cy.get('#ranking tbody tr').should('have.length', 3);
      cy.get('#ranking tbody tr').eq(0).should('contain', '8');
      cy.get('#ranking tbody tr').eq(1).should('contain', '4');
      cy.get('#ranking tbody tr').eq(2).should('have.class', 'highlight')
        .and('contain', 'ash@pokemon.com');
    });
  });

  describe('Logout', () => {
    it('elimina l\'usuari del sessionStorage i torna al registre', () => {
      register();
      cy.get('#logout-btn').click();
      cy.window().its('sessionStorage').invoke('getItem', 'user').should('be.null');
      cy.get('#user-form').should('be.visible');
    });
  });
});
