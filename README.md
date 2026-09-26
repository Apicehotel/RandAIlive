# RandAILive

RandAILive è il videogioco 2.5D dell’ecosistema Rand ambientato nell’Hotel Giò. Le AI sono NPC, le segnalazioni sono clienti/quest e il manutentore è il giocatore.

Il repository `Apicehotel/RandAIlive` è l’unica fonte del gioco. `Apicehotel/Apicehotel-Manutenzione` continua a contenere RandApp/RandAI operativo (`RandApp - Manutenzioni`) e non va usato per modificare il mondo di gioco.

## Stato e hosting

- ambiente di staging previsto: DigitalOcean App Platform;
- preview Vercel: consentita soltanto per revisione visiva;
- Vercel è in freeze come destinazione di produzione;
- percorso storico: <https://apicehotel.vercel.app/randailive>;
- nessun push o deploy diretto su `main`: branch dedicato, Pull Request e revisione umana;
- il merge resta una decisione umana.

## Hotel 2.5D attivo

Il renderer usa proiezione isometrica 2:1 a tile HD 128×64. Il piano terra non è una griglia di box: è una pianta irregolare di 688 celle con sei assi di circolazione collegati e ambienti di forme differenti.

La Hall è il cuore della struttura e collega:

- Reception e nucleo Ascensori;
- Bar & Lounge;
- Congressi e Meeting;
- Ristorante e Cucina;
- Service e Lavanderia;
- Manutenzione e Magazzino;
- SPA e Palestra;
- Ingresso.

Le porte sono aperture del modello: il renderer rimuove il segmento di muro corrispondente e disegna soglia e stipiti. Il pathfinding può attraversare il confine di una stanza esclusivamente attraverso uno di questi varchi.

### Mappe separate

Il gioco contiene nove mappe:

1. Piano Terra;
2. Jazz 1;
3. Jazz 2;
4. Jazz 3;
5. Jazz 4;
6. Wine 5;
7. Wine 6;
8. Wine 7;
9. Wine 8.

Ogni piano camere ha corridoio, porte numerate, lounge, ascensori e office di piano. I piani Jazz hanno un office; i Wine ne hanno due. Il selettore si apre dal controllo Ascensori e anche cliccando le porte ascensore nella scena.

## Movimento e collisioni

- A* su griglia ortogonale percorribile;
- arredi principali registrati come ostacoli;
- nessun attraversamento dei muri;
- nessun teletrasporto tra aree dello stesso piano;
- passaggio di mappa solo nel nucleo ascensori;
- posizione e profondità aggiornate in coordinate di griglia;
- depth sorting basato su `x + y`, condiviso da agenti, arredi e pareti;
- pan, zoom con rotellina/pinch e ricentratura con `0`.

## Materiali e arredi

Le texture attive sono artwork procedurale originale Rand e includono marmo, marmo scuro, parquet, moquette eventi, moquette Jazz/Wine, pietra SPA, gomma palestra, piastrelle cucina, cemento, service e corridoi con runner.

Il catalogo isometrico comprende reception, bancone bar, divani, tavolini, tavoli ristorante/congressi, sedie, piante, lampade, monitor, carrelli, valigie, scaffali, casse, unità cucina, lavatrici, banchi tecnici, lettini SPA, tapis roulant, letti, armadi, scrivanie e porte ascensore.

Fonti esterne valutate, licenze e decisioni sono nel file [`docs/ASSET_SOURCES.md`](docs/ASSET_SOURCES.md). Non sono presenti artwork, loghi o sprite proprietari di StarNet.

## LIVE e SIM

La UI distingue la provenienza dell’attività:

- `LIVE`: heartbeat o task verificabile da `randcore_agent_runtime`, oppure cliente derivato da una segnalazione reale;
- `SIM`: movimento comportamentale locale e vita simulata del gioco.

Un agente `RUNNING` con `task_id` collegato a una segnalazione segue l’area reale dell’intervento. Le camere 1xx–4xx vengono instradate ai piani Jazz; le 5xx–8xx ai piani Wine. `WAITING_APPROVAL` ed `ERROR` restano stati live tracciabili. La simulazione non viene presentata come attività operativa.

Senza Supabase il gioco resta utilizzabile in modalità demo. Con Supabase configurato legge il runtime degli agenti e le segnalazioni secondo le policy RLS. Il frontend deve ricevere soltanto credenziali pubblicabili e non contiene privilegi amministrativi.

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Le azioni di gioco modificano il progresso locale. Le operazioni sulle segnalazioni richiedono una sessione manutentore valida e restano subordinate alle policy di RandApp.

## Architettura

- `src/App.jsx`: shell React, runtime, quest, autenticazione e pannelli;
- `src/PhaserWorld.jsx`: ponte React/Phaser e selettore mappe;
- `src/phaser-world.js`: scena, camera, agenti, clienti e viaggi tra piani;
- `src/iso/iso-world.js`: nove mappe, celle, porte, collisioni e pathfinding;
- `src/iso/iso-math.js`: proiezione e profondità;
- `src/iso/iso-textures.js`: materiali procedurali ripetibili;
- `src/iso/iso-props.js`: catalogo e layout arredi;
- `src/iso/iso-renderer.js`: pavimenti, pareti, varchi, luce e composizione;
- `src/living-runtime.js`: confine LIVE/SIM e instradamento dei ticket;
- `src/behavior-engine.js`: vita simulata degli agenti;
- `src/game-engine.js`: progressione locale;
- `src/supabase.js`: client pubblico Supabase.

## Sviluppo e verifica

Richiede Node.js 20 o successivo.

```bash
npm ci
npm run dev
npm run verify
```

`npm run verify` esegue l’intera suite Node e la build Vite production. I test coprono proiezione, nove mappe, raggiungibilità di ogni area, assenza di salti nel percorso, attraversamento porte, contratti LIVE/SIM, quest, autenticazione, bootstrap e deploy.

Test locale equivalente a Ocean:

```bash
npm run ocean:up
# http://127.0.0.1:8080
npm run ocean:down
```

Verifica della preview DigitalOcean:

```bash
RANDAILIVE_LIVE_URL=https://TUO-APP.ondigitalocean.app npm run verify:live
```

La spec `.do/app.yaml` descrive una App Platform **statica** chiamata
`randailive-preview`, collegata esclusivamente a `feat/iso-hotel-game-v2` e
configurata con `deploy_on_push: false`. Il deploy resta manuale, non modifica
`main`, non usa il servizio Docker a pagamento e parte in modalità SIM se le
variabili pubbliche Supabase non vengono aggiunte esplicitamente alla preview.

[![Crea preview su DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/Apicehotel/RandAIlive/tree/feat/iso-hotel-game-v2)

Il pulsante usa `.do/deploy.template.yaml` e crea soltanto il sito statico della
feature branch; prima della conferma DigitalOcean mostra sempre configurazione
e prezzo applicabile all'account.

## Licenze e identità

Phaser è usato secondo licenza MIT. La grafica attiva è generata dal codice Rand. Kenney e Quaternius sono stati valutati come sorgenti CC0 per un’eventuale futura pipeline atlas, ma nessun loro file binario è incorporato in questa revisione. StarNet è solo un riferimento di densità e atmosfera: identità, artwork, logo e sprite non vengono copiati.
