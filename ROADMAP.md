# Roadmap

Keep this short. Move finished items to the Session log in `CLAUDE.md`.

## Next

1. **Email move, finish (Bergi/Eva):** progress 2026-11-23 in Thunderbird on Bergi's PC: all 7 NEW (cPanel) accounts added and logging in; a.kasmi OLD (Hostinger) added, copy in progress. Still: copy a.kasmi; add OLD + copy for e.kasmi and fredi; info OLD needs its Hostinger password reset (Miri/Eva) before copying. partners/projects/support are empty at Hostinger (no copy). Then update phones/Outlook to `premium705.web-hosting.com` and do a final copy after 1–2 days.
2. **Then Miri deletes Hostinger**; afterwards remove from GoDaddy: `hostingermail-a/b/c._domainkey`, `hostingermail1._domainkey`, `ftp`, and `include:_spf.mail.hostinger.com` from SPF.
3. **Daily server backup** of `~/fredi/data` (sqlite `.backup`) + `~/fredi/media`, cron, keep 14 days; check Namecheap AutoBackup in cPanel.
4. **Hardening (in progress):** 2-step login on Namecheap, GoDaddy, GitHub, cPanel; security headers in `next.config.ts`; audit `/api` access (Users, Messages must not be public); remove unused `NC_*` GitHub secrets and the old deploy key; delete `~/fredi/repo`; make fredi.fav.al redirect to the main domain.
5. **Google Search Console:** submit https://fredielectronics.com/sitemap.xml.

## Soon

- Fix ESLint (flat config from `eslint-config-next` 16, drop `FlatCompat`).
- Smoke test that loads the main routes, run in the deploy workflow before publishing.
- Email adapter for Payload (contact-form notifications, password reset) using a cPanel mailbox.
- Review `npm audit` (1 critical, 19 high).
- Make `.claude/launch.json` portable.

## Later

- Products / shop section in the same admin (client request).
- Use the unknown photos in `Te-gjitha-fotot/6 - E panjohur` once the client identifies them.
