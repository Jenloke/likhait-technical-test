#!/usr/bin/env bash
# Starts the stack, picking a free host port for the DB if the default (3306)
# is already taken on this machine. Usage: scripts/docker-up.sh [docker compose up args...]
set -euo pipefail

DEFAULT_DB_PORT=3306
MAX_PORT=3399

is_port_free() {
  ! (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null
}

port="$DEFAULT_DB_PORT"
while ! is_port_free "$port"; do
  port=$((port + 1))
  if [ "$port" -gt "$MAX_PORT" ]; then
    echo "No free port found between $DEFAULT_DB_PORT and $MAX_PORT" >&2
    exit 1
  fi
done

if [ "$port" != "$DEFAULT_DB_PORT" ]; then
  echo "Port $DEFAULT_DB_PORT is in use, binding db on host port $port instead"
fi

export DB_PORT="$port"
cd "$(dirname "$0")/.."
exec docker compose up "$@"
