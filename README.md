# Teabkar Digital — ធៀបការឌីជីថល

Digital invitations for weddings, engagements, birthdays, housewarmings and other events. One admin manages many events; each event has its own design, agenda, guests, RSVPs and wishes. Each guest gets a unique link (`/i/<code>`) that opens their event's invitation and greets them by name.

**Stack:** Next.js 15 (App Router) · Tailwind CSS v4 · Supabase (Postgres + Storage) · Framer Motion

## Features

**Guest page** `/i/<code>`
- Envelope-style cover with the guest's name, then an open animation and background music
- Invitation text, countdown, agenda (multiple days), photo gallery with lightbox, map, RSVP, wishes, KHQR gift, and gratitude
- Khmer / English switch (defaults to the guest's language; `?lang=en` overrides it)
- Per-guest share preview (title by event type, e.g. "អាពាហ៍ពិពាហ៍ …" or "ខួបកំណើត …"; description "សូមគោរពអញ្ជើញ {name}"; cover image)
- Unknown code → 404

**Admin** `/admin` (one password)
- **Events**: list with guest/RSVP totals; create (type, name, hosts, date), duplicate an event's design and agenda, or delete an event with its guests
- Each event (`/admin/events/<id>`) has the tabs below
- **Dashboard**: guests, opened, attending/declined/pending, total attendees, recent opens, latest wishes
- **Guests**: add, edit, delete, bulk paste or CSV import, search and filters, copy link, share to Telegram, download QR code, export CSV, regenerate link, reset RSVP
- **Customize**: event name/type, hosts and date, KH/EN text (weddings also get the four parents — groom's father and mother, bride's father and mother — shown on every theme), agenda, theme (colors, Khmer/English fonts, size, radius), media uploads (backgrounds, gallery, music, map), gift (KHQR USD/KHR plus account), section toggles, live phone preview
- **Wishes**: hide/show or delete

## Local development

Requires Node 20+, Docker, and the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
npm install
supabase start          # applies supabase/migrations + supabase/seed.sql
cp .env.example .env.local
# fill .env.local with the API URL + service_role key printed by `supabase status`
npm run dev
```

- Admin: http://localhost:3000/admin (password = `ADMIN_PASSWORD`)
- Demo guest: http://localhost:3000/i/demo2026
- `supabase db reset` wipes the local database and re-seeds it.

## Deploy (Supabase Cloud + Vercel)

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the files in `supabase/migrations/` in order (`0001` → `0006`), then `supabase/seed.sql` for the default content. Delete the `demo2026` guest afterwards. You can also run `supabase link && supabase db push`.
3. Push this repo to GitHub and import it into [Vercel](https://vercel.com).
4. Set these environment variables in Vercel:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL (Settings → API) |
   | `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (keep secret) |
   | `ADMIN_PASSWORD` | your admin password (use a long one) |
   | `SESSION_SECRET` | `openssl rand -base64 32` |
   | `NEXT_PUBLIC_SITE_URL` | e.g. `https://your-wedding.vercel.app` (used for guest links) |

5. Deploy, open `/admin`, customize the invitation, and add guests.

## Bloom theme (animated)

Pick **Bloom** in **Admin → Customize → Theme**. Its options (gold and green colours, intro on/off and length, Skip button, reveal mode, intensity) appear below the shared colour and font controls. Picking Bloom also sets Moul and Noto Sans Khmer.

How a guest moves through it: the cover, then a tap on "Tap to open" (music starts here), then the cover exit cascade, then the ~7s arch intro (skippable), then the scrolling sections. The sections are `main`, `schedule`, `location`, `gallery`, `khqr`, `messages` (RSVP and guestbook) and the footer. A bottom dock with scroll-spy jumps between them.

Code lives in `src/components/invite/bloom/`. `Invitation.tsx` hands off to `BloomInvitation` when `config.theme === "bloom"`.

**Timings and variants.** All of them are in `bloom/animations/variants.ts`:

| Constant | Value |
|---|---|
| `EASE`, `DUR` | `[0.22, 1, 0.36, 1]`, 0.8s |
| Reveal variants | `fadeUpLg` (y 60), `fadeUp` (y 30), `fadeUpMd` (y 50), `fadeUpSm` (y 20), `scaleIn` (0.9), `popIn` (0.8), `slideLeft`/`slideRight` (x ±20), `grow` (scale 0) |
| `STAGGER` | 0.12s between siblings |
| `PARALLAX` | ±20px on gallery photos |
| `COVER` | entrance stagger 0.15s, y 30; exit 0.8s, 0.2s stagger, y 60; button breathes 1 → 1.025 over 2s |
| `CONTROLS` | 0.5s slide-in: language from x −25, music from x +25, dock and scroll-to-top from y +50 |
| `INTRO` | arch grows 0.2–1.2s, flowers fly in from 0.8s, arch settles 1.5–2.3s, monogram 2.3–3.0s, date pieces from 3.0s (0.12s stagger), 0.4s fade-out |
| `SWAY` | 4s mirrored loop: rotate 2°, x 4px, y 3px |

`intensity: "subtle"` halves every offset. `revealMode: "once"` stops elements from animating out when they leave the screen. When the system asks for reduced motion, the intro is skipped, reveals only fade, and the sway, parallax and pulse loops are off.

**Swapping the artwork.** Everything is built in (inline SVG in `bloom/FlowerArt.tsx`) until it's replaced in **Admin → Customize → Media → Bloom artwork**:
- **Couple photo:** falls back to *Main background*, then to the first gallery photo.
- **Monogram:** a transparent PNG. Without one, the couple's initials are drawn in a gold ring.
- **Background frame:** an image or a looping MP4 (`muted playsInline loop autoPlay`, `object-cover`).
- **Intro flowers:** transparent PNGs, one for the top-left and one for the bottom-right.
- **Intro video:** an MP4 that replaces the arch animation and ends the intro when it finishes.

Video uploads need `supabase/migrations/0003_bloom_video.sql`, which lets the media bucket accept `video/mp4` and `video/webm`.

## Lotus theme (envelope)

Pick **Lotus envelope** in **Admin → Customize → Theme**. It follows the "olive envelope with a gold lotus seal" template: a sealed envelope on a blurred photo; tapping it breaks the seal, opens the scalloped flap, lifts the name card and zooms into a full-screen couple photo.

Sections, top to bottom: hero (title, names, guest, weekday/day/month/year row), invitation letter on cream (parents, arched photo, message, names), the couple in a scalloped gold frame, countdown with drifting names behind it, a scroll-lit agenda timeline, a love-story carousel, a "float a lotus" water scene (tap to make ripples), masonry gallery, location (embedded map, Google Maps, add-to-calendar `.ics`), KHQR gift with a Save QR button, RSVP and wishes, and candle-lit thanks with optional apology letter.

Settings:
- **Theme tab:** olive / night / cream and three golds, romanised names written in script under the Khmer names, water scene on/off.
- **Text tab:** parents of each host, a closing line and a letter of apology, per language.
- **Media tab:** hero, arched, couple and water photos, a monogram PNG, the love-story photos with KH/EN captions, and an embedded map (paste Google Maps → Share → Embed a map).

Empty photos fall back to the main background and the gallery, so it looks complete with just a few uploads. Code lives in `src/components/invite/lotus/`; colours and animations are the `.theme-lotus` rules in `globals.css`.

## White garden theme (curtains)

Pick **White garden** in **Admin → Customize → Theme**. It follows the "white curtain wedding" template: a full-screen white damask envelope with a pearl wax seal at the tip of its flap. Tapping **Open** lifts the seal, opens the flap and lets the envelope fall away; silk curtains then draw back over a bed of white roses and baby's breath, revealing the title, the names in script, the monogram and the date.

While scrolling, ivy, white corner drapes and a crystal chandelier hang across the top of the screen, and leaves drift down. Sections, top to bottom: invitation letter (monogram, parents of each host, message, names, date and place), countdown cards, agenda timeline (an icon is picked from each item's wording, e.g. ring, hair-cutting, meal, party), location (a QR code made from the Google Maps link, optional embedded map, Google Maps and add-to-calendar buttons), gallery (one wide photo, then a pair), RSVP and wishes (swipeable cards), KHQR gift card with Save QR, and thanks.

Settings:
- **Theme tab:** green, leaf and ivory colours, romanised names (written in script on the hero; their initials make the monogram), falling leaves and chandelier on/off.
- **Text tab:** a closing line, per language (the parents come from the shared Parents fields).
- **Media tab:** optional monogram PNG, curtain backdrop, flowers PNG and garland PNG to replace the drawn artwork, plus an embedded map.

Picking the theme also sets Moulpali and Battambang. Code lives in `src/components/invite/garden/`; colours and animations are the `.theme-garden` rules in `globals.css`.

## Upgrading to multiple events

`supabase/migrations/0004_multi_event.sql` turns the single event into event `1` and gives guests, agenda days and wishes an `event_id`, so existing guest links keep working. It also renames `groom`/`bride` to `host_a`/`host_b` and replaces `save_agenda(jsonb)` with `save_agenda(event_id, jsonb)`. Run it in the SQL Editor (or `supabase db push`) **before** deploying this version of the app.

## Customer accounts

Sign in with an **empty username** and `ADMIN_PASSWORD` to manage everything as the site owner. Under **Accounts** you create a login for each couple and give it their event; the generated password is shown once, ready to copy or send on Telegram. A customer signs in with their username and password and can only see and edit their own event(s): guests, design, story, video, uploads and wishes. Creating and deleting events and managing accounts stay owner-only. **New password** on an account replaces the password and signs that customer out everywhere; deleting an account keeps its events. This needs `supabase/migrations/0006_accounts.sql`.

## Security notes

- Every database read and write goes through server code using the service-role key. RLS is enabled with no public policies, so the anon key gives no access.
- Guest codes are 8 random characters (about 47 bits). A link works as an unguessable token, so treat it like a password-less invite.
- Each guest can post at most 5 wishes (enforced by a database trigger).
- Uploads need a signed-in user: the server checks the file and hands the browser a one-time signed URL, and the file goes straight to Storage (this avoids Vercel's 4.5 MB request limit). The `media` bucket itself accepts only images, audio and short videos (no SVG), up to 15 MB for images/audio and 50 MB for video.
- Sign-in allows 10 failed attempts per IP every 15 minutes. Customer passwords are stored only as scrypt hashes. Every customer action and page checks the event belongs to that account. Sessions last 7 days; a customer's sessions end when their password is reset or the account is deleted; to sign out every device (including the owner), change `SESSION_SECRET`.

## Project layout

```
src/app/i/[code]/          guest invitation page
src/app/admin/login/       admin login
src/app/admin/(panel)/     events list, new event, events/[eventId]/ (dashboard, guests, customize, wishes)
src/app/admin/preview/     admin-only preview of an event with a sample guest
src/app/actions/           server actions (guest.ts = public, admin.ts = guarded)
src/components/invite/     invitation sections
src/components/admin/      admin UI
src/lib/                   supabase client, auth/session, types (zod), data loaders
supabase/                  migrations + seed
```
