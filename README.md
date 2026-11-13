# SpaceX 2040 — Employee Simulation

A React + Vite design-fiction prototype about a future workplace that monitors employees. The interface uses a dark glassmorphism visual language and is designed to be deployed to an HTTPS host so camera and microphone permissions can work.

## Included experience

- Welcome screen with a fictionalised 2040 executive portrait labelled X Æ A-Xii. The portrait is an original stylised illustration, not a real photograph or a prediction of a real person's adult appearance.
- Employee face capture with live camera preview; the captured image is shown on the employee profile.
- Voice sample recording through the browser microphone.
- Employee agreement and identity confirmation.
- Start-of-day PULSE scan, three distinct design tasks, and an end-of-day report.
- Performance warning and enhanced monitoring agreement.
- Three additional Month 02 tasks, each with a different design challenge and interface concepts.
- Month 02 and Month 03 performance reports, phone permission screen, and termination notice.

## Run locally

```bash
npm install
npm run dev
```

## Build for hosting

```bash
npm install
npm run build
```

Upload the generated `dist` folder to Netlify, Vercel, or another static host. For Netlify's Git-based deployment, use:

- Build command: `npm run build`
- Publish directory: `dist`

## Camera and microphone permissions

Camera and microphone access require a secure context: use an HTTPS deployment (or `localhost` during local development). The browser will ask the visitor for permission. If the camera preview is blank, check browser site permissions and ensure another application is not using the camera.

## Prototype limitations and privacy

- The face image is captured in the browser and held in React state for this session. It is not uploaded to a server or persisted after a page refresh.
- Face recognition and biometric matching are not implemented.
- Voice recording is captured locally and is not uploaded or analysed. The sample is not saved after leaving the page.
- Productivity scores and monitoring data are fictional narrative elements, not real assessments.
- The executive portrait is an original stylised fictional portrayal associated with the speculative character name X Æ A-Xii; it is not a depiction of the real individual.
