# RandAILive

RandAILive è il mondo 2D dell’ecosistema Rand: una hall pixel-art dove le AI vivono, lavorano, incontrano i clienti e possono crescere attraverso un piccolo ciclo di gioco.

## Link ufficiale

[Apri RandAILive su ApiceHotel](https://apicehotel.vercel.app/randailive)

> Stato verificato il 20/09/2026: il percorso ufficiale risponde, ma attualmente serve ancora la shell di RandApp (`RandApp - Manutenzioni`). Il deploy ufficiale del gioco richiede il collegamento umano del progetto Vercel alla branch corretta di questo repository.

Questo repository è l’unica fonte del codice RandAILive. Il repository `Apicehotel/Apicehotel-Manutenzione` contiene RandApp/RandAI operativo e non deve essere usato per modificare il gioco.

## Cosa contiene

- hall 2D pixel-art con zone dedicate: Lobby, Core Hub, Knowledge Library, Radar Deck, Ops Bay, QA Station, Design Studio e Coffee Corner;
- 10 AI dell’ecosistema Rand: RandAI, RandBrain, RandCore, RandMind, RandRadar, RandResearch, RandSecure, RandTest, RandOps e RandUI;
- movimento e attività deterministiche, con ciclo di vita ogni 12 secondi;
- runtime 2D Phaser separato dal layout React, con scena, camera, zoom e trascinamento;
- hall descritta da una mappa Tiled-compatible con stanze, porte, collisioni e spawn;
- arredi e punti di interesse della hall descritti nello stesso layer dati, non sparsi nel codice della scena;
- agenti renderizzati nella scena di gioco e selezionabili direttamente sulla mappa;
- stati runtime `RUNNING`, `IDLE`, `WAITING_APPROVAL`, `ERROR` e `OFFLINE`;
- evidenziazione dell’AI selezionata e modalità Regia;
- clienti-evento generati dalle segnalazioni di manutenzione ancora aperte;
- manutentore umano come giocatore: prende le segnalazioni-quest, le svolge e vede il proprio ciclo locale;
- pannello di gioco con energia, umore, conoscenza, esperienza, livello e inventario;
- azioni `Esplora`, `Allena` e `Riposa`;
- missioni, diario degli eventi e crescita delle AI;
- salvataggio locale del progresso nel browser.

## Dati reali e modalità demo

Quando Supabase è configurato, la hall legge `randcore_agent_runtime` e ascolta gli aggiornamenti Realtime. Le segnalazioni aperte vengono lette dalla tabella `segnalazioni` e rappresentate come clienti nella hall.

Senza configurazione Supabase, RandAILive funziona in modalità demo comportamentale: le AI continuano a muoversi secondo il motore locale, ma non mostrano gli heartbeat reali.

Nel controllo live del 19/09/2026 la chiave anonima ha ricevuto `permission denied for table randcore_agent_runtime`. Questo non blocca la demo, ma impedisce la modalità live: prima del deploy ufficiale va verificata una policy RLS di sola lettura per il client pubblico e va controllata la pubblicazione Realtime della tabella. La service-role key non deve mai essere inserita nel frontend.

Le azioni del gioco modificano soltanto il progresso locale del giocatore e non scrivono né modificano lo stato operativo delle AI in Supabase.

## Giocatore e quest manutenzione

Il modello di gioco è canonico: le AI sono NPC, le segnalazioni sono clienti/quest e il manutentore è il giocatore. Il punto 5 introduce presa in carico, completamento locale, diario e persistenza del giocatore. Il punto 6 aggiunge il gate operativo: sessione Supabase del manutentore, scope fisso `hotelgio` e sincronizzazione di presa in carico/completamento sulla tabella `segnalazioni`. Le policy RLS di Apice MultiHotel restano l’autorità finale: senza permesso `take_charge` o `complete` l’operazione viene rifiutata e il ciclo locale non avanza. Senza sessione autenticata la hall non legge né modifica segnalazioni operative.

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
- Phaser 3
- Supabase Realtime
- CSS per shell/HUD e impalcatura grafica delle fasi iniziali
- formato mappa Tiled-compatible in JSON
- `localStorage` per il salvataggio del ciclo di gioco

## Sviluppo locale

```bash
npm install
npm run dev
```

## Test, build e verifica

```bash
npm test
npm run build
npm run verify
npm run verify:live
```

I test verificano il contratto runtime, la presenza delle AI canoniche, i clienti manutenzione, il bootstrap React, il runtime Phaser e la crescita del personaggio nel ciclo di gioco. `npm run verify` esegue test e build consecutivamente prima della PR.
`npm run verify:live` controlla l’URL pubblico ufficiale e fallisce se Vercel pubblica ancora RandApp invece di RandAILive. Al controllo del 20/09/2026 il check fallisce correttamente: HTTP 200, ma titolo `RandApp - Manutenzioni`. Il progetto Vercel deve quindi essere collegato manualmente a `Apicehotel/RandAIlive` prima di considerare il punto 7 chiuso.

## Struttura principale

- `src/App.jsx`: composizione della hall, runtime live e interazioni;
- `src/PhaserWorld.jsx`: ponte React/Phaser con caricamento dinamico del motore;
- `src/phaser-world.js`: scena 2D, camere, stanze, agenti e movimento;
- `src/phaser-world.css`: contenitore responsive della scena;
- `src/hall-map.json`: mappa dati della hall con layer `rooms`, `collision`, `doors`, `spawns` e `decorations`;
- `src/behavior-engine.js`: zone, percorsi sociali e attività delle AI;
- `src/game-engine.js`: statistiche, azioni, missioni e salvataggio del gioco;
- `src/GameHud.jsx`: HUD del personaggio selezionato;
- `src/maintenance-clients.jsx`: segnalazioni aperte rappresentate nella hall;
- `src/supabase.js`: client Supabase pubblico;
- `src/ErrorBoundary.jsx`: fallback visibile in caso di errore React;
- `src/styles.css`: mondo e interfaccia pixel-art.

## Sicurezza del workflow

Le modifiche passano da branch dedicato e Pull Request. Nessun agente autonomo deve fare push o deploy diretto su `main`. Il merge e il deploy richiedono revisione umana.

## Stato del freeze

Il punto 0 della roadmap è completato nella PR di stabilizzazione: la repo ha un lockfile riproducibile, un comando di verifica unico e documenta il disallineamento tra il percorso ufficiale e il deploy RandAILive. Il collegamento Vercel non viene modificato automaticamente: richiede approvazione umana perché il progetto attualmente collegato è RandApp.

La Fase 1 è implementata in un branch separato: Phaser è il runtime della mappa, mentre React conserva HUD, Supabase, manutenzioni e regia. La grafica presente nella scena è un’impalcatura tecnica; tileset, sprite definitivi e collisioni di produzione appartengono alle fasi successive.

La Fase 2 sposta la struttura della hall in `hall-map.json`: la scena non contiene più le coordinate delle stanze, ma legge gli oggetti della mappa. Le collisioni sono già dichiarate nel layer dati; l’uso fisico dei muri verrà collegato al movimento nella Fase 4.

La Fase 3 completa il primo passaggio visuale: reception, biblioteca, tavoli, schermi, console, piante e scaffali sono decorazioni dichiarate nella mappa e renderizzate con uno stile coerente. Gli asset sono ancora procedurali e leggeri per mantenere la build riproducibile; sprite e tileset artistici definitivi restano un passaggio successivo, mentre le decorazioni sono già predisposte per interazioni e collisioni future.

La Fase 4 collega il movimento alla stessa mappa: gli agenti usano i centri delle stanze e attraversano i varchi dichiarati nel layer `doors`, con il layer `collision` come confine visivo e di percorso. Gli spawn vengono inizializzati sui punti Tiled, così la posizione mostrata e la destinazione runtime restano coerenti.

Il punto 8 è il passaggio grafico della hall: pavimenti a piastrelle, bordi luminosi, lampade, wayfinding, profondità del fondale, pedane e badge degli NPC rendono leggibili stanze e ruoli a colpo d'occhio. Il concept visivo è quello della hall futuristica Apicehotel: blu notte, ciano, oro e accenti per agente. Il renderer resta data-driven e procedurale per non bloccare il freeze: in una fase asset successiva ogni decorazione potrà essere sostituita da sprite/tileset mantenendo invariati `hall-map.json`, quest e runtime.

## 8-bit Hubble

Il progetto prende ispirazione solo dal concetto di sprite, layer, palette e proceduralità. Non incorpora codice di `amcajal/8_bit_hubble`.
