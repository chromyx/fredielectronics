# Fredi Electronics website – project notes

Rebuild of fredielectronics.com as a bilingual portfolio site for investors and clients: Albanian at `/` (default), English at `/en`. The client is Fredi Electronics sh.p.k., Tirana (LED screens, audio, conference, security & access, energy & UPS, electrical/electronic accessories). Ecler is their exclusive audio partner.

## What is and isn't in this repository

Everything is here: code, all photos, `drive/`, `backup/`, and the full content in `site/content-db/fredi.db` (identical to the live database as of 2026-11-17 evening, minus logins). Missing on purpose: `.env` (make a new one), `ADMIN-LOGIN.txt` (create a new admin on first visit), the live `site/data/fredi.db` (only adds the login; there were 0 contact messages), and one 386 MB video the site does not use.

## Folders

- `site/`: the real site. Next.js 16 + Payload CMS 3 (admin at `/admin`), SQLite. See `site/README.md` for running it and using the admin.
- `fotot-finale/`: every project's finished-product photos, sorted by category and title. Rebuilt by `site/src/seed/export-sorted.ts`.
- `Te-gjitha-fotot/`: all photos, de-duplicated, compared with the old WordPress site (`Krahasimi - faqja e re vs WordPress.docx`). `6 - E panjohur` = unknown photos.
- `backup/`: scrape of the old WordPress site (pages, data JSON, images). One 386 MB video, `backup/images/2025/04/Auditori-Politeknik.mp4`, is too big for GitHub and exists only on the original PC.
- `drive/`: assets from the client's Google Drive (logos, FAV/TEG, project folders).
- `design-preview/`, `tools/`: early static mockups and helper scripts.

## Setting up from a fresh clone

Some photo paths are long. On Windows, clone with `git clone -c core.longpaths=true https://github.com/chromyx/fredielectronics.git`.

1. `cd site && npm ci`
2. Copy `.env.example` to `.env` and set a random `PAYLOAD_SECRET`.
3. `mkdir data` and copy `content-db/fredi.db` to `data/fredi.db`. This is all the content (75 projects, services, brands, texts, settings) with logins and messages removed.
4. `npm run dev`, open http://localhost:3000/admin. With no users, Payload asks you to create the first admin.
5. Or run always-on: `docker compose up -d --build` (container `fredi-site`, port 3000, mounts `data/` and `media/`).

On the original PC the live database is `site/data/fredi.db` and the admin login is in `site/ADMIN-LOGIN.txt`. Neither is in git, because the repository is public. Never commit them, `.env`, or passwords.

## How the code is organised

- Collections: Projects (category led/av/conf/sec/power, gallery, heroPhoto, featured = homepage slideshow, order), Services (6 pages with subsections, photos, partners), Brands, Media, Clients, Messages, Users. Globals: HomePage, SiteSettings (contact, hours, socials).
- Routes: `/sherbimet/<led|audio|conference|security|power|accessories>`, `/projektet/<led|audio|conference|security|power>`. English versions are at `/en/services/…` and `/en/projects/…`. Old WordPress URLs redirect via `src/redirects.ts`. Unknown URLs show the branded `not-found.tsx`.
- Data loaders are in `src/lib/getHomeData.ts`. Browser components must import `CATS` from `src/lib/cats.ts`, never values from getHomeData, because that pulls Payload into the client bundle.
- One-off content changes are scripts in `src/seed/`, run with `npx payload run src/seed/<file>.ts`. In production (Docker) the schema is not pushed automatically. After adding fields, run a payload script once locally first.
- Motion: GSAP + Lenis on the homepage. Inner pages use CSS animation gated by `html.motion.ready`. Reduced motion is respected.

## Client decisions (keep to these)

- Design: clean, calm, investor-grade, SOE-style (soe.org.uk), navy `#141c2a`. No gimmicks: no pixel effects, cursor lenses, hover previews or scroll-jacking.
- Photos: finished products only. No people, tools, ladders, boxes, half-built screens or social-media graphics.
- Homepage shows partner brands, not institutions; institutions appear only inside projects. No project counts anywhere (menus, tabs, filters, buttons).
- FAV × TEG section (fav.al, LED ad network in TEG mall) uses the FAV palette: blue `#042c8c`, deep `#00165b`, magenta `#e50095`.
- Fredi does not sell laptops. Ecler is its own section on the Audio page.
- Hours: Mon–Fri 08:00–17:00, Sat 08:00–14:00, Sun closed. Contact: +355 69 675 2032 (also WhatsApp), fredielectronics@gmail.com, Rr. Kavajës P.207, Tiranë.
- Socials: Instagram @fredielectronics, facebook.com/fredielectronics, linkedin.com/in/fredielectronics (chosen by the client 2026-11-18; a company page also exists at linkedin.com/company/fredi-electronics-shpk). Contact emails: fredielectronics@gmail.com and info@fredielectronics.com.
- Service page hero = "LED wall": the photo is split into cabinets and changes project in a diagonal wave.
- Homepage slideshow: Bashkia Korçë, Durrës, Shkolla e Magjistraturës, Zoe Hora, Plaza and others; set via `src/seed/hero-slides.ts`. Leave the Magjistratura room as it is.
- The Tirana Fair 2025 stand and Match Maker 2026 stand are the same stand, merged into one project.
- Hosting is not decided yet. Products/shop will come later in the same admin.
