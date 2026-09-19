# RandAILive

RandAILive è il mondo 2D dell’ecosistema Rand: una hall pixel-art dove le AI vivono, lavorano, incontrano i clienti e possono crescere attraverso un piccolo ciclo di gioco.

## Link ufficiale

[Apri RandAILive su ApiceHotel](https://apicehotel.vercel.app/randailive)

## Cosa contiene

- hall 2D pixel-art con zone dedicate: Lobby, Core Hub, Knowledge Library, Radar Deck, Ops Bay, QA Station, Design Studio e Coffee Corner;
- 10 AI dell’ecosistema Rand: RandAI, RandBrain, RandCore, RandMind, RandRadar, RandResearch, RandSecure, RandTest, RandOps e RandUI;
- movimento e attività deterministiche, con ciclo di vita ogni 12 secondi;
- stati runtime `RUNNING`, `IDLE`, `WAITING_APPROVAL`, `ERROR` e `OFFLINE`;
- evidenziazione dell’AI selezionata e modalità Regia;
- clienti-evento generati dalle segnalazioni di manutenzione ancora aperte;
- pannello di gioco con energia, umore, conoscenza, esperienza, livello e inventario;
- azioni `Esplora`, `Allena` e `Riposa`;
- missioni, diario degli eventi e crescita delle AI;
- salvataggio locale del progresso nel browser.

## Dati reali e modalità demo

Quando Supabase è configurato, la hall legge `randcore_agent_runtime` e ascolta gli aggiornamenti Realtime. Le segnalazioni aperte vengono lette dalla tabella `segnalazioni` e rappresentate come clienti nella hall.

Senza configurazione Supabase, RandAILive funziona in modalità demo comportamentale: le AI continuano a muoversi secondo il motore locale, ma non mostrano gli heartbeat reali.

Le azioni del gioco modificano soltanto il progresso locale del giocatore e non scrivono né modificano lo stato operativo delle AI in Supabase.

## Configurazione Supabase

Creare `.env.local` nella radice del progetto:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Usare soltanto una chiave publishable/anon con policy RLS adeguate. Non inserire mai una service-role key nel frontend.

## Stack

- React 19
- Vite
- Supabase Realtime
- CSS pixel-art procedurale
- `localStorage` per il salvataggio del ciclo di gioco

## Sviluppo locale

```bash
npm install
npm run dev
```

## Test e build

```bash
npm test
npm run build
```

I test verificano il contratto runtime, la presenza delle AI canoniche, i clienti manutenzione, il bootstrap React e la crescita del personaggio nel ciclo di gioco.

## Struttura principale

- `src/App.jsx`: composizione della hall, runtime live e interazioni;
- `src/behavior-engine.js`: zone, percorsi sociali e attività delle AI;
- `src/game-engine.js`: statistiche, azioni, missioni e salvataggio del gioco;
- `src/GameHud.jsx`: HUD del personaggio selezionato;
- `src/maintenance-clients.jsx`: segnalazioni aperte rappresentate nella hall;
- `src/supabase.js`: client Supabase pubblico;
- `src/ErrorBoundary.jsx`: fallback visibile in caso di errore React;
- `src/styles.css`: mondo e interfaccia pixel-art.

## Sicurezza del workflow

Le modifiche passano da branch dedicato e Pull Request. Nessun agente autonomo deve fare push o deploy diretto su `main`. Il merge e il deploy richiedono revisione umana.

## 8-bit Hubble

Il progetto prende ispirazione solo dal concetto di sprite, layer, palette e proceduralità. Non incorpora codice di `amcajal/8_bit_hubble`.
