# Deployment Authorization Plan

This plan reflects the current state of this machine and this repository.

It is not a generic deployment guide. It is the actual execution order from here.

---

## Current Facts

### What is available locally

- Mobile Expo app exists in `mobile/osdhyan`
- Web portal exists in `apps/portal`
- `railway` CLI is installed and already logged in
- `gcloud` CLI is installed but current auth is restricted and cannot list projects
- `vercel` CLI is installed but not logged in
- `firebase` CLI is installed but not logged in
- SSH host config exists for `remote-ssh-osdhyan` -> `34.131.187.176`

### What is missing

- The actual deployable Laravel backend source is not present in `backend/`
- `backend/` currently contains only:
  - `.env`
  - `storage/logs/laravel.log`
  - `public/`
- Because of that, I cannot do a clean fresh backend deployment from this repo alone

### What this means

One of these must be true before full deployment can finish:

1. The missing Laravel backend source must be added to this repo
2. An existing remote backend/server must already contain the real Laravel app
3. You explicitly want me to rebuild the backend from partial files in the repo, which is a separate large project and not a deployment-only task

---

## Phase 0 - Authorization Checkpoints

Before I use external services or remote infrastructure, I need your approval for these actions:

1. Use the currently logged-in Railway account on this machine to inspect projects, create services, and deploy
2. Use the existing SSH target `remote-ssh-osdhyan` to inspect the remote VM at `34.131.187.176`
3. Install `eas-cli` locally for Expo build and mobile release work
4. Log into Expo/EAS later when mobile preview/production builds are ready
5. If needed later, log into Vercel to deploy the web portal

---

## Phase 1 - Determine The Real Backend Path

### Goal

Find out whether the backend already exists on a remote machine or whether the missing source must be supplied first.

### Step 1.1

Inspect the remote host over SSH.

What I will check:

- whether the VM is reachable
- whether Laravel code exists there
- whether Apache/Nginx is configured
- whether `osdhyan.online` or another domain points to that VM
- whether database and storage already exist

### Step 1.2

If the remote VM contains the real backend, I will:

1. audit its current state
2. reconnect the web and mobile configs to that backend
3. bring the services back online

### Step 1.3

If the remote VM does not contain the backend, deployment is blocked until the missing backend source is available.

---

## Phase 2 - Backend Deployment

### Goal

Get a stable API URL for web and mobile.

### Path A - Existing VM path

If the SSH host contains the full backend:

1. verify Laravel app health
2. verify `.env` and database connection
3. restore or fix process manager / web server config
4. verify `/api` and `/storage`
5. produce the final API base URL

### Path B - Fresh cloud path

If the backend source becomes available later:

1. deploy backend to Railway or a VM
2. provision database
3. configure environment variables
4. run migrations and seed if appropriate
5. verify API health

### Hard blocker

Fresh backend deployment cannot start from this repo until the missing Laravel application source exists.

---

## Phase 3 - Web Portal Deployment

### Goal

Deploy `apps/portal` against the working backend URL.

### Preferred order

1. set `NEXT_PUBLIC_API_URL`
2. set `NEXT_PUBLIC_STORAGE_URL`
3. set `NEXT_PUBLIC_SITE_URL`
4. build and smoke test locally
5. deploy to Vercel or another host

### Current status

`apps/portal/.env.local` still points to localhost, so web deployment depends on backend completion first.

---

## Phase 4 - Mobile Runtime Wiring

### Goal

Point the mobile app to the real backend and clear runtime mismatches.

### Steps

1. set `EXPO_PUBLIC_API_URL`
2. set deep link and package identifiers
3. run device-level validation against the real API
4. fix broken payload mappings and runtime errors
5. verify auth, tests, learn, live, and profile flows

---

## Phase 5 - Mobile Build System

### Goal

Prepare preview and production mobile builds.

### Steps

1. install `eas-cli`
2. link Expo project
3. configure owner and project ID
4. prepare app icons and splash assets
5. generate preview builds
6. run smoke QA on built binaries

---

## Phase 6 - Release And Deployment

### Goal

Ship web and mobile using the live backend.

### Steps

1. publish web portal
2. freeze final mobile env values
3. build Android preview
4. build Android production
5. build iOS preview/production when Apple account access is available
6. complete store metadata and submission package

---

## Immediate Execution Order

This is the order I recommend from this exact state:

1. get approval to inspect Railway and SSH target
2. inspect remote VM first
3. if backend exists there, recover it and use that API for web/mobile
4. if backend does not exist there, stop and request the missing Laravel backend source
5. after backend is stable, deploy web portal
6. then wire mobile to the live API
7. then install and configure EAS
8. then generate preview builds

---

## Approval Message

Send this exact approval if you want me to proceed:

```text
Approved:
1. Use Railway account on this machine
2. Use SSH target remote-ssh-osdhyan / 34.131.187.176
3. Install eas-cli locally
4. Continue deployment discovery and execution
```

If you already know the missing backend source is in another repo or folder, send that path or repo link in the same message.
