# Roadmap

Keep this short. Move finished items to the Session log in `CLAUDE.md`.

## Next

1. **Email move, finish:** copy done and checked on the server 2026-11-23: info 2,731 msgs/951 MB (includes info_old's mail), a.kasmi 32/129 MB, e.kasmi 90/84 MB, fredi 47/34 MB, merrjep 4. info_old mailbox in cPanel is empty (its mail went into info): keep or delete. partners/projects/support empty. DKIM and SPF valid in cPanel. Still: in 1-2 days copy anything new from the Hostinger accounts, move phones/Outlook to `premium705.web-hosting.com`, then tell Miri to delete Hostinger.
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
