#!/usr/bin/env bash
# Deep fix for signal propagation.
# pnpm does not forward SIGTERM to its child (vite/node), which leaves zombie
# processes holding the port after a workflow restart.
# This wrapper:
#   1. Starts pnpm in its own process group (set -m / job control)
#   2. Traps SIGTERM/SIGINT and kills the *entire* child process group
#   3. Never uses fuser-k, which caused a restart loop when Replit re-ran the
#      startup command while Vite was already bound to the port

set -m  # job control: background jobs get their own PGID

_cleanup() {
  local code=$?
  if [ -n "${CHILD:-}" ]; then
    # Kill the whole process group (pnpm + sh + vite node)
    kill -- -"$CHILD" 2>/dev/null || kill "$CHILD" 2>/dev/null || true
    wait "$CHILD" 2>/dev/null || true
  fi
  exit "$code"
}
trap _cleanup TERM INT EXIT

pnpm --filter @workspace/nomadready run dev &
CHILD=$!
wait "$CHILD"
