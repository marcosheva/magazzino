# Gestionale Magazzino

Applicazione Vue 3 + MongoDB per la gestione del magazzino: login, prodotti, ricerca, dashboard, soglie minime.

## Funzionalità

- **Login**: accesso con utente e password (configurabili da variabili d'ambiente)
- **Dashboard**: totale prodotti, sotto soglia, valore magazzino, riepilogo per categoria
- **Prodotti**: lista con ricerca, filtro "solo sotto soglia", ordinamento
- **Aggiungi/Modifica/Elimina** prodotti con conferma

## Un solo comando (sviluppo)

Dalla cartella **magazzino** (root del progetto):

```bash
npm install
npm run dev
```

Partono insieme backend (porta 3000) e frontend (porta 5173). Apri **http://localhost:5173**, fai login e usa l’app.

Credenziali predefinite (se non imposti le variabili d’ambiente): **admin** / **admin**.

## Build e avvio in produzione

```bash
npm run build
npm run start
```

Il frontend viene compilato e copiato in `backend/public`. Un solo processo Node serve sia le API sia l’interfaccia.

## Variabili d'ambiente (backend)

In `backend/.env` (o nel dashboard Render):

| Variabile       | Descrizione                          |
|-----------------|--------------------------------------|
| `MONGODB_URI`   | Connessione MongoDB                  |
| `PORT`          | Porta server (default 3000)         |
| `ADMIN_USER`    | Nome utente per il login (default: admin) |
| `ADMIN_PASSWORD`| Password per il login (default: admin)   |
| `JWT_SECRET`    | Chiave per i token (cambia in produzione!) |

Vedi `backend/.env.example`.

## Deploy su Render

1. Crea un **Web Service** su [Render](https://render.com), collega il repository.
2. **Build command**: `npm run build`
3. **Start command**: `npm run start`
4. **Root directory**: lascia vuoto (root del repo).
5. Aggiungi le **Environment Variables**:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = la tua URI MongoDB
   - `ADMIN_USER` = utente scelto
   - `ADMIN_PASSWORD` = password sicura
   - `JWT_SECRET` = stringa casuale lunga (puoi usare “Generate” su Render)

In alternativa usa il file `render.yaml` per un deploy tramite Blueprint.

## API

- `POST /api/auth/login` – login (body: `{ "username", "password" }`), restituisce `{ "token" }`
- `GET /api/products` – lista (richiede header `Authorization: Bearer <token>`)
- `GET /api/products/stats/summary` – statistiche
- `GET /api/products/:id` – dettaglio
- `POST /api/products` – crea
- `PUT /api/products/:id` – aggiorna
- `DELETE /api/products/:id` – elimina
