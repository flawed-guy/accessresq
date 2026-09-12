# AccessResQ MVP

AI-ready accessibility-aware emergency response and campus navigation prototype.

## What is included

- Student emergency reporting
- Keyword-based AI triage simulator (replaceable with Gemini/OpenAI later)
- Emergency priority classification
- Responder dashboard
- Emergency status workflow:
  `reported → accepted → en_route → arrived → resolved`
- Accessibility-aware campus routing
- Dijkstra shortest-path routing with accessibility and blocked-path filters
- Simulated accessibility issue (blocked ramp)
- LocalStorage persistence so two browser sessions can be demonstrated on one machine
- Responsive UI

## Run locally

Requirements:
- Node.js 18+ (current LTS recommended)
- npm

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Hackathon demo

1. Open the app as a Student.
2. Click **Report Emergency**.
3. Enter: `A student slipped near the library and cannot stand.`
4. Select wheelchair-friendly route.
5. Submit.
6. Go to **Responder → Command center**.
7. Open the new incident.
8. Calculate the accessible route.
9. Move it through Accept → Start travel → Mark arrived → Resolve.
10. Use Campus Map to demonstrate accessibility mode and the blocked-ramp simulation.

## Important

This is a hackathon MVP, not a production emergency service. For a real deployment, add authenticated backend notifications, real campus GIS data, verified accessibility data, professional emergency-service integration, audit logging, rate limiting, privacy controls, and robust safety review.

## Next upgrade

Replace `classify()` in `src/main.jsx` with a server-side AI endpoint. Do not expose an AI API secret in the browser.
