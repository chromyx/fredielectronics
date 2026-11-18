#!/bin/bash
# Installs the newest build of the site on the Namecheap hosting.
#
# GitHub builds the app (.github/workflows/deploy-namecheap.yml) and attaches it to the
# "namecheap-build" release. This script, run by cron every 5 minutes, checks that release
# and installs a new build when there is one. It does nothing when nothing changed.
#
# Cron (cPanel -> Cron Jobs):  */5 * * * * $HOME/fredi/update.sh >> $HOME/fredi/update.log 2>&1
# By hand:                     ~/fredi/update.sh          (add --force to reinstall the current build)
#
# Layout under ~/fredi:
#   app/        the running app (replaced on each update; app/media links to ../media)
#   data/       the database          (never touched here)
#   media/      uploaded photos       (never touched here)
#   releases/   the last builds, for rollback
set -euo pipefail

BASE="$HOME/fredi"
URL="https://github.com/chromyx/fredielectronics/releases/download/namecheap-build"
APP="$BASE/app"
REL="$BASE/releases"
KEEP=3

exec 9> "$BASE/.update.lock"
flock -n 9 || exit 0   # another update is still running

log() { echo "$(date '+%F %T') $*"; }

latest=$(curl -fsSL --max-time 30 "$URL/build.txt" | tr -d '[:space:]') || { log "could not reach GitHub, will retry"; exit 0; }
[[ "$latest" =~ ^[0-9a-f]{40}$ ]] || { log "unexpected build id '$latest', skipping"; exit 0; }
current=$(cat "$BASE/current.txt" 2>/dev/null || true)
if [[ "$latest" == "$current" && "${1:-}" != "--force" ]]; then exit 0; fi

log "new build ${latest:0:7} (installed: ${current:0:7})"
dir="$REL/$latest"
tmp="$REL/.download-$$"
rm -rf "$tmp"; mkdir -p "$tmp"
trap 'rm -rf "$tmp"' EXIT

curl -fsSL --max-time 600 -o "$tmp/app.tar.gz" "$URL/app.tar.gz"
curl -fsSL --max-time 30 -o "$tmp/app.tar.gz.sha256" "$URL/app.tar.gz.sha256"
(cd "$tmp" && sha256sum -c --quiet app.tar.gz.sha256) || { log "checksum mismatch, not installing"; exit 1; }

rm -rf "$dir"; mkdir -p "$dir"
tar -xzf "$tmp/app.tar.gz" -C "$dir"
[[ -f "$dir/server.js" ]] || { log "build has no server.js, not installing"; rm -rf "$dir"; exit 1; }

# Swap the new files in. media/ (photos) and tmp/ stay; the database lives outside app/.
mkdir -p "$APP"
rsync -a --delete --exclude '/media' --exclude '/tmp' "$dir/" "$APP/"
[[ -L "$APP/media" ]] || ln -sfn "$BASE/media" "$APP/media"

# Restart the app so it serves the new build.
mkdir -p "$APP/tmp" && touch "$APP/tmp/restart.txt"
cloudlinux-selector restart --json --interpreter nodejs --app-root fredi/app > /dev/null 2>&1 || true

echo "$latest" > "$BASE/current.txt"
log "installed ${latest:0:7}"

# Keep only the newest builds.
ls -1dt "$REL"/*/ 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -rf
