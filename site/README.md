# Fredi Electronics – website + admin

Next.js website with a Payload CMS admin panel. Everything runs on this computer for now.

## Start it

```
cd site
npm run dev
```

- Website (Albanian): http://localhost:3000
- Website (English): http://localhost:3000/en
- Admin panel: http://localhost:3000/admin – login details are in `ADMIN-LOGIN.txt` (created by the import).

## Add a new project

1. Admin → **Projects** → **Create new**.
2. Type the title, pick a category, drag the photos into **Photos**.
3. Optional: description, client, city, year. Tick **Show on homepage slideshow** to put it in the top slideshow.
4. **Save**. It appears on the website right away.
5. For the English title/description, switch the language at the top of the page to *English*, type, save.

## Other things you can change in the admin

- **Homepage text** – every section's wording (both languages), service tiles and their photos, FAV × TEG text.
- **Contact details & numbers** – phone, WhatsApp, email, address, opening hours, key numbers.
- **Clients & partners** – names and logos shown in "Institutions that trust us".
- **Messages** – everything sent through the contact form.

## Where things are stored

- `data/fredi.db` – the database (all text and settings). Not in git, because it holds the admin login.
- `content-db/fredi.db` – a copy of the content with logins and messages removed, for setting up a new computer. Copy it to `data/fredi.db`; the admin then asks you to create the first user.
- `media/` – uploaded photos and their resized copies.
Back up `data/` and `media/` together.

## Setting up on a new computer

1. `npm ci`
2. Copy `.env.example` to `.env` and put a long random value in `PAYLOAD_SECRET`.
3. Create a `data` folder and copy `content-db/fredi.db` into it.
4. `npm run dev` (or Docker below).

## Re-importing the old WordPress content

`npm run seed` imports the 33 old projects from `../backup`. It skips anything already imported.

## Run it always-on with Docker

The site runs as the `fredi-site` container (production build) and restarts by itself.

- Start or update after code changes: `docker compose up -d --build` (in this folder)
- Stop: `docker compose down`
- Logs: `docker logs -f fredi-site`

The database (`data/fredi.db`) and photos (`media/`) stay on this PC and are shared with the container, so edits in the admin are kept.
Don't run `npm run dev` at the same time, because both use port 3000.
