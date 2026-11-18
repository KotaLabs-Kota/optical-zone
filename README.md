# Optical Zone Kota — frontend storefront

A responsive website for **Optical Zone**, the optical showroom in Vigyan Nagar, Kota (Plot No. 4-J-7, opposite Mayank School, Main Road, Kota 324005). It covers eyeglasses, branded sunglasses and in-store eye tests.

It is built with **plain HTML, CSS and vanilla JavaScript**. There is **no backend, no database and no build step**. Enquiries go to the shop over **WhatsApp**, and the wishlist is kept in `localStorage`.

## Run it

```bash
cd optical-zone
python3 -m http.server 8080
# open http://localhost:8080
```

No API keys or environment variables are needed. Fonts are self-hosted in `assets/fonts`.

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | Hero with live open/closed status, zone tiles, sample frames, a two-step frame finder (face shape → what for), eye-test steps, visit card |
| `shop.html` | Catalogue with category and shape filters, sorting, live counts, empty state, filters synced to the URL |
| `product.html?id=…` | Frame detail with colour options, lens type (eyeglasses only), a live WhatsApp enquiry that includes the chosen options, accordions and related frames |
| `eye-tests.html` | How an eye test works, what to bring, and a booking form that hands off to WhatsApp |
| `about.html` | Who we are, how we work, next-step tiles |
| `contact.html` | Contact form (WhatsApp handoff), address, hours, directions, FAQ |

Global UI: sticky header, search overlay (press `/`), saved-frames drawer, mobile menu, mobile bottom action bar (Call · WhatsApp · Directions), toast notifications.

## Design direction

The site is deliberately different from the reference storefronts (the mishra-optics and Vision Eye Plus sites):

- **Midnight ink surfaces** with a single **signal-orange** accent, instead of cream or lilac.
- **Bricolage Grotesque** for display type and **DM Sans** for body text, instead of a serif.
- **Bento "zone" tiles** and a grid-line hero instead of product-first editorial layouts.
- **Live opening status** (computed in Kota time) on the hero and in the visit card.
- A **frame finder** built on face shape and use, instead of a face-shape pill row.
- A **mobile bottom bar** for Call, WhatsApp and Directions on every page.

## Structure

```
.
├── index.html · shop.html · product.html · eye-tests.html · about.html · contact.html
├── css/styles.css        # design system and responsive layout
├── js/data.js            # business details, sample catalogue, face-shape guide, FAQs, eye-test steps
├── js/app.js             # rendering, filters, saved frames, search, finder, forms, WhatsApp handoff
├── assets/icons.svg      # inline SVG icon sprite
├── assets/fonts/         # self-hosted woff2 (Bricolage Grotesque, DM Sans) with licence files
└── images/               # hero, frame, eye-test and showroom imagery (AI-generated)
```

Most content changes live in `js/data.js`. Header and footer markup is repeated in each HTML page, so keep them in sync when you change navigation.

## Facts to confirm before launch

Public listings for this shop disagree in places, so the site uses the values below and marks them as unverified. Check each one with the shop before going live.

| Item | Value used on the site | Notes |
| --- | --- | --- |
| Address | Plot No. 4-J-7, opposite Mayank School, Main Road, Vigyan Nagar, Kota 324005 | Plot 4-J-7 appears on Yappe and Indiainfo. Indiamart shows "4-JA-7", and Justdial gives only "Main Road, Vigyan Nagar". |
| Phone | +91 96940 31470 | indiainfo lists this number. An Indiamart listing gives +91 80482 63355 for the same shop name. Confirm which one is live. |
| Opening hours | 10:00 am – 9:00 pm, daily | **Not verified.** No primary source was found. The site says "to be confirmed". |
| Ratings | Not shown | Listings disagree (Justdial shows 4.7 from 113 ratings, Yappe shows 12 reviews). Add a rating only once verified on Google. |
| Catalogue and prices | Six sample frames, `price: null` ("Price on enquiry") | Placeholder range. Replace `PRODUCTS` with real stock before launch. |
| Services | Eyeglasses, branded sunglasses, eye testing | Taken from the shop's listing category. |
| Credit line | "Designed & engineered by KotaLabs" | Remove it if the shop does not want it. |

**Name clash:** a different shop, **"3rdeye The Optical Zone"** (Landmark City, A-77, Kunadi, Electricity Board Area, Kota 324008), also appears in listings under a similar name. This site is for the **Vigyan Nagar** store, which is listed as "Optical Zone" (Best Optical Showroom in Kota, Plot 4-J-7). If the owner means the Kunadi store instead, update `BUSINESS` in `js/data.js` and the address on every page.

## Research sources

- Cybo, Optometrists in Kota: https://www.cybo.com/IN/kota-rajasthan/optometrists/
- Yappe, Best Top Rated Opticians in Kota: https://yappe.in/rajasthan/kota/optician
- Justdial, Optician listings near Rajeev Gandhi Nagar, Kota: https://www.justdial.com/Kota-Rajasthan/Optician-Eye-Test-in-Rajeev-Gandhi-Nagar/nct-11121407
- Indiainfo, Optical wholesalers in Rajasthan: https://www.indiainfo.net/amp_s/optical-wholesaler-in-rajasthan/page/4739017
- Indiamart, Sun Glasses in Kota: https://dir.indiamart.com/kota-rajasthan/sun-glasses.html

## Notes

- **No cart or checkout.** Every product has an **Enquire on WhatsApp** action. The message includes the frame, colour, lens and a link back to the product.
- **The contact and eye-test forms validate in the browser**, then open WhatsApp with the message filled in. Nothing is stored on a server.
- **Saved frames** persist in `localStorage` under `oz_saved`.
- Responsive at phone, tablet and desktop widths. Keyboard focus states, ARIA labels and `prefers-reduced-motion` are supported.
- Product photography and the hero, eye-test and showroom images are AI-generated illustrations for this site. Replace them with photos of the real shop and stock before launch.
