# CLAUDE.md

## Project Overview

Flight fare search tool — React + Express app that searches flights via the Amadeus API.

## Architecture

- **client/** — Vite + React + TypeScript + Tailwind CSS frontend (port 5173)
- **server/** — Express + TypeScript backend (port 3001)
- Root `package.json` uses `concurrently` to run both

## Commands

```bash
# Install all dependencies (root + server + client)
npm run install:all

# Run both server and client in dev mode
npm run dev

# Build client for production
npm run build

# Lint client code
cd client && npm run lint
```

## Environment

Requires `.env` at the project root with Amadeus API credentials (see `.env.example`).

## Key Conventions

- TypeScript throughout; strict mode in client
- Server uses `tsx watch` for dev, `tsc` for build
- Client uses Vite with React plugin and Tailwind v4
- API routes are under `/api/search` and `/api/airports`
