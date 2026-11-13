# SPACEX 2040 — Employee Simulation

A browser-based design-fiction prototype built with React and Vite.

## Run locally

1. Install Node.js (LTS): https://nodejs.org/
2. Extract this ZIP.
3. Open the extracted folder in VS Code.
4. Open Terminal > New Terminal.
5. Run:

   ```bash
   npm install
   npm run dev
   ```

6. Open the local URL printed in the terminal (usually http://localhost:5173).

## Deploy publicly

### Netlify (easy option)
1. Create a GitHub repository and upload the contents of this folder.
2. Sign in at https://www.netlify.com/
3. Choose **Add new site > Import an existing project**.
4. Connect your GitHub repository.
5. Set:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy. Netlify will give you an HTTPS URL.

### Vercel
1. Import the GitHub repository at https://vercel.com/
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy.

## Camera and microphone

Camera and microphone access require a secure context: HTTPS when deployed, or localhost during development.
The browser will ask the participant for permission. The face scan is a visual interaction only; this prototype does not perform biometric recognition or send biometric data to a server.
Voice is recorded locally in the browser for the duration of the session and is not uploaded.

## Prototype notes

- The flow is intentionally linear. Use **Continue** to move forward.
- The employee task includes three near-identical design variants and a written rationale.
- The enhanced-monitoring consent screen includes a refusal path that displays the fictional company error state.
- Progress and simple responses are held in browser memory only. Refreshing restarts the experience.
- Replace the fictional CEO portrait and company copy with your chosen assets if required.
