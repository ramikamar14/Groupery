#!/usr/bin/env sh
# Atomically merge env-updates.txt into .env, preserving all existing keys.
# Secrets arrive as DATA (a file), never interpolated into a shell command,
# so values containing quotes/$/backticks cannot inject or corrupt anything.
set -eu

UPDATES="env-updates.txt"
touch .env

# Nothing to apply → leave .env untouched.
[ -s "$UPDATES" ] || { rm -f "$UPDATES"; exit 0; }

# Keep existing lines whose key is NOT being updated, then append the updates.
awk -F= 'NR==FNR { k[$1]=1; next } !($1 in k)' "$UPDATES" .env > .env.merged
cat "$UPDATES" >> .env.merged

# Safety: never write a .env that would brick the app (must keep DATABASE_URL).
if ! grep -q '^DATABASE_URL=' .env.merged; then
  echo "Refusing to write .env without DATABASE_URL" >&2
  rm -f .env.merged
  exit 1
fi

mv .env.merged .env
rm -f "$UPDATES"
echo "Applied env updates."
