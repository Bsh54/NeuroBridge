# NeuroBridge

**An AI communication aid for non-verbal and minimally-verbal autistic people, and the people who care for them.**

NeuroBridge lets someone who cannot easily speak tap a few pictograms (hunger, pain, anxiety, joy, sensory overload) and instantly hear a clear, first-person sentence spoken out loud. Every message is saved so caregivers can review patterns over time and ask an AI assistant for practical, personalised support.

> This is a communication aid, not a medical device and not a diagnosis.

---

## Why

Around a quarter of autistic people are non-verbal or minimally verbal. Many live with distress they cannot put into words (chronic gastrointestinal pain and sensory overload are common and easily missed). NeuroBridge tries to shorten the distance between what a person feels and what the people around them understand.

---

## Features

- **Pictogram board** organised into four calm categories (Need, Pain, Feelings, Sensory) with large, high-contrast targets.
- **AI interpretation**: the selected pictograms are read as one combined experience and turned into a natural first-person sentence, with urgency matched to the signals.
- **Text-to-speech** using the browser Web Speech API, replayable on demand.
- **Per-person profiles** (name, age, optional photo) stored server-side, so the same history is visible from any device.
- **Caregiver dashboard**: full communication history, most frequent needs, and a streaming **AI caregiver assistant** that answers questions using that person's real patterns.
- **Accessibility first**: visible keyboard focus, `prefers-reduced-motion` support, ARIA live regions, large touch targets, soft non-violent palette.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind v4 + inline styles |
| Database | SQLite via `better-sqlite3` (server-side) |
| AI | OpenAI-compatible Chat Completions endpoint (configurable) |
| Voice | Web Speech API (browser native) |
| Pictograms | ARASAAC (see Credits) |

---

## Getting started

### Prerequisites
- Node.js 20+ (developed on Node 24)
- An OpenAI-compatible Chat Completions API key

### Install
```bash
git clone <your-repo-url> neurobridge
cd neurobridge
npm install
```

### Configure
```bash
cp .env.example .env.local
# then edit .env.local and set AFRI_API_KEY and AFRI_API_URL
```

### Run in development
```bash
npm run dev
# http://localhost:3000  (or the PORT set in .env.local)
```

### Build and run in production
```bash
npm run build
npm run start
```

The SQLite database is created automatically at `data/neurobridge.db` on first run. The `data/` folder is gitignored and must never be committed.

---

## Project structure

```
app/
  page.tsx                  Landing page
  layout.tsx                Root layout + metadata
  globals.css               Global styles (focus, reduced-motion)
  app/
    page.tsx                Profile selector (create person: name, age, photo)
    communicate/page.tsx    Pictogram board + Speak
  dashboard/
    page.tsx                Caregiver dashboard + AI assistant
  api/
    interpret/route.ts      Pictograms -> spoken sentence (AI)
    caregiver/route.ts      Streaming caregiver assistant (AI)
    profiles/route.ts       List / create profiles
    profiles/[id]/route.ts  Get / delete a profile
    selections/route.ts     Append a communication to a profile
lib/
  db.ts                     SQLite layer (profiles + selections)
  child-profile.ts          Shared types + AI context builder
  core-prompt.ts            System prompt for the interpreter
public/arasaac/             Pictogram images
```

---

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/profiles` | List all profiles with history |
| POST | `/api/profiles` | Create a profile (`name`, `age?`, `photo?`) |
| GET | `/api/profiles/:id` | Get one profile |
| DELETE | `/api/profiles/:id` | Delete a profile |
| POST | `/api/selections` | Append a communication |
| POST | `/api/interpret` | Turn pictograms into a sentence (AI) |
| POST | `/api/caregiver` | Streaming caregiver assistant (AI) |

---

## Data and privacy

NeuroBridge stores personal data about vulnerable people (names, ages, optional photos, and logs of how they feel). Treat it accordingly:

- The database lives in `data/` and is **never** committed to version control.
- Photos are compressed and resized client-side before storage.
- No data is sold or shared with third parties.
- The interpretations are an aid for communication and care, not a medical diagnosis.

If you deploy this, make sure you have a lawful basis and appropriate consent to process this data in your jurisdiction.

---

## Accessibility

NeuroBridge targets users with sensory and cognitive differences:
- Large touch targets and clear affordances.
- Soft, low-arousal colour palette (no harsh or strobing visuals).
- Visible keyboard focus and reduced-motion support.
- ARIA live regions so spoken sentences are announced to screen readers.

---

## Credits

- **Pictograms: ARASAAC.** The pictographic symbols are the property of the Government of Aragon (Gobierno de Aragon) and were created by Sergio Palao for ARASAAC (https://arasaac.org), distributed under a Creative Commons licence (BY-NC-SA). Attribution is required and use must be non-commercial.

---

## License

Add your chosen license here (for example MIT). Note that the ARASAAC pictograms keep their own CC BY-NC-SA terms regardless of the code license.
