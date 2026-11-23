# Roadmap

Keep this short. Move finished items to the Session log in `CLAUDE.md`.

## Next

1. **Email move, finish (Bergi/Eva):** 9 mailboxes at Hostinger: info, info_old (941 MB), a.kasmi, e.kasmi, fredi, merrjep, partners, projects, support. All 9 exist in cPanel (info_old + merrjep created 2026-11-23). Copied and checked on server: a.kasmi (32 msgs/129 MB), e.kasmi (90 msgs/84 MB). Still: set passwords for info_old + merrjep in cPanel; fredi (50 MB at Hostinger, Thunderbird shows empty Inbox: check other folders / Subscribe); info (old password wrong, reset first); info_old (big, copy all folders); merrjep (85 KB). partners/projects/support empty (no copy). Then phones/Outlook to `premium705.web-hosting.com`, final copy after 1-2 days.
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
