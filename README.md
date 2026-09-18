# RandAILive

Ambiente visuale sperimentale dell'ecosistema Rand: una hall pixel-art dove gli agenti mostrano il proprio stato operativo in tempo reale.

## Obiettivo

RandAILive è separato da RandApp. È una visualizzazione ludica del runtime: non esegue azioni operative e non modifica lo stato degli agenti.

## Stack

- React
- Vite
- Supabase Realtime
- CSS pixel-art procedurale

## Stati visualizzati

- `RUNNING`: l'agente si muove e lavora
- `IDLE`: resta alla propria postazione
- `WAITING_APPROVAL`: attende approvazione
- `ERROR`: entra in stato di allarme
- `OFFLINE`: viene desaturato e resta fermo

## Dati

La pagina legge `randcore_agent_runtime` e ascolta gli aggiornamenti realtime.

Copia `.env.example` in `.env.local` e configura:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Usare soltanto una chiave publishable/anon con policy RLS adeguate. Non inserire mai una service-role key nel frontend.

## Sviluppo

```bash
npm install
npm run dev
```

## Test e build

```bash
npm test
npm run build
```

## Sicurezza del workflow

Le modifiche passano da branch dedicato e Pull Request. Nessun agente autonomo deve fare push o deploy diretto su `main`.

## 8-bit Hubble

Il progetto prende ispirazione solo dal concetto di sprite/layer/palette/proceduralità. Non incorpora codice di `amcajal/8_bit_hubble`.
