# PokeMemory

Joc del Memory amb imatges de pokemons fet amb JavaScript Vanilla (mòduls ES).

## Posada en marxa

1. Instal·la les dependències:

   ```bash
   npm install
   ```

2. Configura la URL de la teva Realtime Database de Firebase a `js/config.js` (`FIREBASE_URL`).
3. Arrenca el servidor local:

   ```bash
   npm start
   ```

   i obre http://localhost:8080

## Scripts

| Ordre | Descripció |
| --- | --- |
| `npm run lint` | ESLint de tots els fitxers `.js` de la carpeta `js` |
| `npm run lint:html` | HTMLHint de `index.html` |
| `npm run test:e2e` | Tests end-to-end amb Cypress |
| `npm run test:e2e:open` | Tests end-to-end amb la interfície visual de Cypress |

## Estructura

```
index.html
css/styles.css
js/
  main.js              Punt d'entrada: mostra registre o joc
  config.js            Constants (URL de Firebase, PokeAPI...)
  api/firebase.js      Usuaris i ranking (fetch a la Realtime DB)
  api/pokeapi.js       Imatges dels pokemons
  views/register.js    Feature 1: formulari de registre
  views/game.js        Feature 2: joc
  views/ranking.js     Feature 3: ranking
  views/logout.js      Feature 4: logout
  utils/               Helpers (sessionStorage, temporitzador, validació, modal...)
cypress/e2e/           Tests e2e
```
