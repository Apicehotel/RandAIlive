# RandAILive

RandAILive è il mondo 2D dell’ecosistema Rand: una hall pixel-art dove le AI vivono, lavorano, incontrano i clienti e possono crescere attraverso un piccolo ciclo di gioco.

## Link e hosting

**Staging (fino al completamento):** DigitalOcean, non Vercel.

- build locale come in produzione: `npm run ocean:up` → http://127.0.0.1:8080
- spec App Platform: `.do/app.yaml` + `Dockerfile` + `deploy/nginx.conf`
- verifica staging: `RANDAILIVE_LIVE_URL=https://TUO-APP.ondigitalocean.app npm run verify:live`

**Vercel è in freeze** fino a quando il gioco non è completo (grafica asset, lore XP/coscienza, clienti). Non promuovere preview Vercel a URL ufficiale.

**Percorso Apicehotel** [`/randailive`](https://apicehotel.vercel.app/randailive): oggi serve ancora il vecchio embed Melon dentro `Apicehotel-Manutenzione` (`RandApp - Manutenzioni`), non questo repository. Quando RandAILive sarà pronto su Ocean, il path ufficiale andrà puntato lì (rewrite/proxy o redirect) con decisione umana.

Questo repository è l’unica fonte del codice RandAILive. Il repository `Apicehotel/Apicehotel-Manutenzione` contiene RandApp/RandAI operativo e non deve essere usato per modificare il gioco.

## Cosa contiene

- hall 2D pixel-art con zone dedicate: Lobby, Core Hub, Knowledge Library, Radar Deck, Ops Bay, QA Station, Design Studio e Coffee Corner;
- 10 AI dell’ecosistema Rand: RandAI, RandBrain, RandCore, RandMind, RandRadar, RandResearch, RandSecure, RandTest, RandOps e RandUI;
- movimento e attività deterministiche, con ciclo di vita ogni 12 secondi;
- runtime 2D Phaser separato dal layout React, con scena, camera, zoom e trascinamento;
- hotel descritto da un world model dedicato con stanze, corridoi, porte, props e routing;
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
- world model JavaScript data-driven con pipeline model → bake → props → renderer
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
npm run ocean:up
RANDAILIVE_LIVE_URL=https://TUO-APP.ondigitalocean.app npm run verify:live
```

I test verificano il contratto runtime, la presenza delle AI canoniche, i clienti manutenzione, il bootstrap React, il runtime Phaser e la crescita del personaggio nel ciclo di gioco. `npm run verify` esegue test e build consecutivamente prima della PR.

`npm run verify:live` senza URL controlla ancora `https://apicehotel.vercel.app/randailive` e fallisce correttamente finché risponde RandApp. Con `RANDAILIVE_LIVE_URL` punta allo staging DigitalOcean.

## Deploy DigitalOcean

1. Crea un’App su DigitalOcean App Platform importando questo repo (o `doctl apps create --spec .do/app.yaml`).
2. Imposta i secret di build `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (solo anon/publishable).
3. Lascia `deploy_on_push: false` finché il gioco non è completo: i deploy restano manuali.
4. Quando Ocean è verde, `verify:live` sullo URL `.ondigitalocean.app` deve trovare il titolo `RandAILive`.

Locale equivalente:

```bash
cp .env.example .env.local   # opzionale
npm run ocean:up
```

## Struttura principale

- `src/App.jsx`: composizione della hall, runtime live e interazioni;
- `src/PhaserWorld.jsx`: ponte React/Phaser con caricamento dinamico del motore;
- `src/phaser-world.js`: runtime Phaser, agenti, clienti e camera;
- `src/hotel-world-v3.js`: world model e routing dell’Hotel Giò inventato;
- `src/hotel-bake-v3.js`: bake procedurale di superfici, muri e luce;
- `src/hotel-props-v3.js`: renderer depth-sorted degli arredi Rand;
- `src/hotel-renderer-v3.js`: compositore a strati del mondo;
- `src/phaser-world.css`: contenitore responsive della scena;
- `src/behavior-engine.js`: zone, percorsi sociali e attività delle AI;
- `src/game-engine.js`: statistiche, azioni, missioni e salvataggio del gioco;
- `src/GameHud.jsx`: HUD del personaggio selezionato;
- `src/maintenance-clients.jsx`: segnalazioni aperte rappresentate nella hall;
- `src/supabase.js`: client Supabase pubblico;
- `src/ErrorBoundary.jsx`: fallback visibile in caso di errore React;
- `src/styles.css`: mondo e interfaccia pixel-art.

## Sicurezza del workflow

Le modifiche passano da branch dedicato e Pull Request. Nessun agente autonomo deve fare push o deploy diretto su `main`. Il merge e il deploy richiedono revisione umana. Fino al completamento del gioco, lo staging ufficiale è DigitalOcean (deploy manuale); Vercel non va usato come destinazione di prodotto.

## Stato del freeze

Il punto 0 della roadmap è completato nella PR di stabilizzazione: la repo ha un lockfile riproducibile, un comando di verifica unico e documenta il disallineamento tra il percorso Apicehotel e questo repository. Il path `/randailive` su Apicehotel resta RandApp finché non si decide il proxy verso Ocean.

Vercel resta congelato come canale di prodotto: le preview automatiche non sostituiscono lo staging DigitalOcean.

La Fase 1 è implementata in un branch separato: Phaser è il runtime della mappa, mentre React conserva HUD, Supabase, manutenzioni e regia. La grafica presente nella scena è un’impalcatura tecnica; tileset, sprite definitivi e collisioni di produzione appartengono alle fasi successive.

La Fase 2 sposta la struttura della hall in `hall-map.json`: la scena non contiene più le coordinate delle stanze, ma legge gli oggetti della mappa. Le collisioni sono già dichiarate nel layer dati; l’uso fisico dei muri verrà collegato al movimento nella Fase 4.

La Fase 3 completa il primo passaggio visuale: reception, biblioteca, tavoli, schermi, console, piante e scaffali sono decorazioni dichiarate nella mappa e renderizzate con uno stile coerente. Gli asset sono ancora procedurali e leggeri per mantenere la build riproducibile; sprite e tileset artistici definitivi restano un passaggio successivo, mentre le decorazioni sono già predisposte per interazioni e collisioni future.

La Fase 4 collega il movimento alla stessa mappa: gli agenti usano i centri delle stanze e attraversano i varchi dichiarati nel layer `doors`, con il layer `collision` come confine visivo e di percorso. Gli spawn vengono inizializzati sui punti Tiled, così la posizione mostrata e la destinazione runtime restano coerenti.

Il punto 8 è il passaggio grafico della hall: pavimenti a piastrelle, bordi luminosi, lampade, wayfinding, profondità del fondale, pedane e badge degli NPC rendono leggibili stanze e ruoli a colpo d'occhio. Il concept visivo è quello della hall futuristica Apicehotel: blu notte, ciano, oro e accenti per agente. Il renderer resta data-driven e procedurale per non bloccare il freeze: in una fase asset successiva ogni decorazione potrà essere sostituita da sprite/tileset mantenendo invariati `hall-map.json`, quest e runtime.

Il punto 9 alza la leggibilità verso i fogli concept: ogni AI ha un look procedurale distinto (cappello/prop del ruolo), le stanze usano branding Rand (RandMind, RandUI, RandOps…), i clienti-segnalazione compaiono nella scena Phaser con aura di agitazione per urgenza e fumetto emoji sul tipo di problema. Gli sprite sheet artistici definitivi restano il passaggio successivo.

## 8-bit Hubble

Il progetto prende ispirazione solo dal concetto di sprite, layer, palette e proceduralità. Non incorpora codice di `amcajal/8_bit_hubble`.


## Hotel Giò game world v1

Il gioco non è più limitato alla sola hall concettuale: il modello di mondo comprende l'Hotel Giò come struttura giocabile, con piano terra, aree congressuali, quattro piani Jazz, quattro piani Wine, servizi tecnici e aree esterne.

Aree canoniche: reception, lobby, bar/lounge, sala colazione, cucina, sala congressi, sale meeting, RandApp Hub, spa, palestra, piani Jazz 1-4, piani Wine 5-8, lavanderia, stireria, magazzino, area tecnica, spogliatoi staff e ingresso/parcheggio.

Il ciclo di gioco v1 aggiunge turno, evento giornaliero deterministico, reputazione hotel, servizio, sicurezza, pulizia, umore ospiti, crediti, aree visitate e catena di obiettivi. Le azioni AI sono Esplora, Allena, Aiuta, Ispeziona e Riposa; le quest manutenzione reali continuano a usare Supabase e, quando completate, alimentano anche la progressione locale del gioco.

Il modello del mondo è in `src/hotel-world.js`. `src/behavior-engine.js` usa le aree Hotel Giò come destinazioni degli agenti, mentre `src/game-engine.js` conserva il loop di progressione senza modificare lo stato operativo delle AI.


## Living runtime · innesto StarNet-inspired

RandAILive distingue ora esplicitamente ciò che è **LIVE** da ciò che è **SIM**.

- un agente `RUNNING` con `task_id` collegato a una segnalazione reale segue la zona dell'intervento invece di restare nella propria area di casa;
- le camere 1xx-4xx vengono mappate sui piani Jazz e le 5xx-8xx sui piani Wine;
- segnalazioni tecniche senza camera vengono instradate nell'Area Tecnica;
- `WAITING_APPROVAL` ed `ERROR` restano stati live tracciabili;
- il wandering deterministico degli agenti `IDLE` è marcato `SIM`, quindi l'interfaccia non presenta una simulazione come attività operativa;
- `src/living-runtime.js` è il confine destinato ai futuri eventi RandCore/MCP: la scena Phaser riceve intenzioni già normalizzate e non deve inventare attività.

Principio: **nessun movimento operativo senza una causa tracciabile**. Il prossimo livello può collegare event stream RandCore, ledger e agent tool calls mantenendo invariato il renderer Phaser.


## Visual overhaul · StarNet-inspired, Rand-owned

La pipeline grafica adotta i principi tecnici osservati in StarNet senza incorporarne artwork, sprite, logo o identità visiva.

- `hotel-visual-system.js` separa identità della stanza, materiale, luce e catalogo arredi dal renderer;
- ogni area dell'Hotel Giò riceve una funzione visiva coerente (reception, bar, cucina, congressi, camere Jazz/Wine, lavanderia, area tecnica, magazzino, ecc.);
- i pavimenti usano ricette procedurali diverse (parquet, terrazzo, marmo, tile, carpet, stone, rubber, concrete, tech);
- gli arredi sono istanziati da un layout deterministico data-driven e restano sostituibili con sprite originali Rand;
- il renderer aggiunge profondità alle stanze e illuminazione per ambiente, mantenendo Phaser come runtime;
- la separazione modello → render permette in futuro un editor/refit, asset atlas, collisioni per prop e bake/cache senza cambiare la logica operativa.

Principio di licenza: si riusano **pattern e codice MIT dove utile**, ma non gli asset artistici e il branding StarNet, che il progetto upstream dichiara esclusi dalla licenza del codice.


## Rebuild grafico v2 · Hotel Giò continuo

La prima visual-overhaul basata su grandi riquadri-stanza è stata scartata dopo revisione visiva su mobile.

La v2 sostituisce quel renderer con una planimetria continua:

- edificio unico invece di griglia di card;
- corridoio camere superiore, lobby/reception centrale, aree pubbliche e corridoio servizi;
- porte e percorsi condivisi usati dagli agenti per attraversare realmente le zone;
- arredi più piccoli e proporzionati all'ambiente;
- agenti ridotti di scala per leggere l'hotel come mondo, non come dashboard;
- identità Hotel Giò separata dall'HUD e dai pannelli React;
- nuova fonte dati `hotel-layout-v2.js`, indipendente dal renderer Phaser;
- vecchio `hotel-visual-system.js` eliminato dal codice attivo.

La regola resta: artwork StarNet non viene copiato. Della repository upstream si sfruttano pattern tecnici e architetturali compatibili con MIT, mentre mondo, grafica e personaggi restano Rand.


## Hotel World v3 · pipeline StarNet-inspired

La v2 continua è stata utile come prova di layout, ma il renderer risultava ancora troppo piatto. La v3 sostituisce il percorso grafico attivo con quattro responsabilità separate, seguendo il principio architetturale osservato in StarNet senza incorporarne artwork o branding:

`hotel-world-v3.js` → `hotel-bake-v3.js` → `hotel-props-v3.js` → `hotel-renderer-v3.js` → Phaser.

La mappa è volutamente inventata per il gioco: otto aree Jazz/Wine leggibili in alto, corridoio camere, nucleo Hall/Reception, Congressi e Meeting a sinistra, Bar/Ristorante/Cucina a destra, Rand Hub centrale e fascia Service con Lavanderia, Stireria, Magazzino, Manutenzione, Staff, SPA e Palestra. I percorsi passano attraverso corridoi comuni invece di saltare tra riquadri.

Il bake statico introduce materiali differenziati, pareti con altezza/cutaway, rampe di luce/ombra e light pool per ambiente. Gli arredi sono separati e ordinati per profondità; gli agenti sono entità runtime sopra il mondo statico e usano il routing del world model. La pipeline è predisposta per sostituire gradualmente gli arredi procedurali con sprite originali Rand senza cambiare logica, routing o stato live.

La v3 elimina dal percorso attivo `hall-map.json` e `hotel-layout-v2.js`, così resta una sola fonte di verità grafica. StarNet resta una fonte tecnica MIT per pattern architetturali; nome, logo, artwork e sprite StarNet non vengono copiati.
