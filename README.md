# XO Arena — Online Multiplayer Tic-Tac-Toe

Guest-based multiplayer Tic-Tac-Toe using Node.js, Express, and Socket.IO. Includes public random matchmaking and private invite-code rooms.

## Run locally
Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```
Open http://localhost:3000 in two browser windows. To test on another device on the same LAN, use `http://YOUR-PC-LAN-IP:3000` and allow Node.js through Windows Firewall for private networks.

Run tests with `npm test`.

## Deploy to Render
1. Push this folder to a GitHub repository.
2. In Render, choose **New → Blueprint** and connect the repository.
3. Render reads `render.yaml` and creates the Node web service.
4. Wait for deployment, then open the generated public HTTPS URL.

Manual Render settings: Runtime Node, build command `npm install`, start command `npm start`, health check `/health`.

## Deploy to Railway
1. Push the project to GitHub.
2. Create a Railway project and deploy from that repository.
3. Add a public domain in the service Networking settings. The app reads the host-provided `PORT`.

## How it works
Express serves the frontend and Socket.IO from the same origin. The server owns game state and validates every move. Public matchmaking pairs the next two waiting players; private rooms use six-character codes. No database or accounts are required.

## Limitations / production notes
- Rooms and scores are stored in memory; restarting the server clears them.
- This starter is designed for one server instance. Multiple replicas require shared matchmaking state and a Socket.IO adapter/store such as Redis.
- A disconnected player is removed from their room; reconnect-to-seat is not implemented in this starter.
- Add rate limiting, abuse protection, monitoring, and persistent storage before scaling to a high-traffic public service.
- Hosting free-tier availability, sleep behavior, and quotas change; verify provider pricing before deploying.

## Structure
`public/` frontend; `src/` server and game logic; `test/` basic game-logic tests.
