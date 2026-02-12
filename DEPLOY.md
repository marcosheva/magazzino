# Deploy su Git e Render

## 1. Inizializza Git e primo commit

Nella cartella del progetto (dove vedi `package.json`):

```powershell
cd C:\Users\user\Desktop\magazzino

git init
git add .
git status
git commit -m "Gestionale magazzino: Vue, MongoDB, login, barcode, movimenti, responsive"
```

## 2. Crea il repository su GitHub

1. Vai su [github.com](https://github.com) e accedi.
2. **New repository** → nome es. `magazzino`, visibilità **Private** (o Public).
3. **Non** spuntare "Add a README" (il repo può essere vuoto).
4. Copia l’URL del repo (es. `https://github.com/TUO-USER/magazzino.git`).

## 3. Collega e push

Sostituisci `URL_DEL_TUO_REPO` con l’URL copiato:

```powershell
git remote add origin URL_DEL_TUO_REPO
git branch -M main
git push -u origin main
```

Se GitHub ti chiede di fare login, usa un **Personal Access Token** al posto della password (Settings → Developer settings → Personal access tokens).

## 4. Deploy su Render

1. Vai su [render.com](https://render.com) e accedi (puoi usare “Sign in with GitHub”).
2. **Dashboard** → **New** → **Web Service**.
3. **Connect a repository** → autorizza Render su GitHub e scegli il repo `magazzino`.
4. Imposta:
   - **Name:** `magazzino` (o come preferisci)
   - **Region:** Frankfurt (o quello che vuoi)
   - **Branch:** `main`
   - **Root Directory:** lascia vuoto
   - **Runtime:** Node
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
   - **Instance Type:** Free (o a pagamento)
5. **Environment** → aggiungi le variabili:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = la tua URI MongoDB (es. da Atlas)
   - `ADMIN_USER` = nome utente per il login
   - `ADMIN_PASSWORD` = password sicura
   - `JWT_SECRET` = stringa lunga e casuale (su Render puoi usare **Generate**)
6. **Create Web Service**.

Al primo deploy Render eseguirà `npm run build` e poi `npm run start`. Alla fine avrai un URL tipo `https://magazzino-xxxx.onrender.com`.

## 5. Dopo il deploy

- Accedi con **ADMIN_USER** e **ADMIN_PASSWORD** che hai impostato.
- Il database è quello indicato in **MONGODB_URI** (es. MongoDB Atlas).
- Per aggiornare l’app: fai modifiche, commit e push su `main`; Render rifarà il deploy in automatico.
