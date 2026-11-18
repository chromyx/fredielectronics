# Roadmap

Keep this short. Move finished items to the Session log in `CLAUDE.md`.

## Next

1. **Fix ESLint**: switch `site/eslint.config.mjs` to the flat config that `eslint-config-next` 16 exports (drop `FlatCompat`), then fix or accept the warnings.
2. **Make `.claude/launch.json` portable**: relative paths, so the preview works on both PCs and in Cloud.
3. **Review `npm audit`** (1 critical, 19 high): update what's safe without breaking Payload 3.93 / Next 16.3.
4. **Check the live site** after the latest pushes (LinkedIn link, FAV slide, second email) and confirm the Namecheap cron picked up the newest build.

## Soon

- Basic automated checks: a smoke test that loads the main routes, run in the deploy workflow before publishing.
- Email adapter for Payload (contact-form notifications, password reset).
- Decide where the live database and media are backed up (server copy vs original PC).

## Later

- Products / shop section in the same admin (client request).
- Use the unknown photos in `Te-gjitha-fotot/6 - E panjohur` once the client identifies them.
