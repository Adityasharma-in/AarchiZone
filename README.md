# AarchiZone Design Consultancy — Website

A five-page static website for **AarchiZone Design Consultancy**, an architecture, interiors and engineering practice in Gurugram, Haryana.

The site is intentionally framework-free: plain HTML, one CSS file, one JavaScript file, self-hosted fonts and compressed local images. There is no build step and no external runtime dependency.

## Pages

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | Positioning, selected work, services, process, materials, Google reviews, enquiry CTA |
| Studio | `about.html` | Practice story, principal profile, values, timeline |
| Services | `services.html` | Architecture, interiors and engineering detail; engagement models; process; FAQ |
| Work | `projects.html` | Filterable project grid with accessible project dialogs |
| Contact | `contact.html` | Phone, email, address, hours, map, enquiry form, FAQ |

## Run locally

Any static file server works. For example:

```bash
npx serve .
# or
python -m http.server 5500
```

Then open `http://localhost:5500`.

Opening `index.html` directly from disk also works, but a local server is recommended so that fonts and images load consistently.

## Design direction

- **Palette:** bone paper, near-black ink, vermillion accent, muted olive and sand.
- **Type:** Bricolage Grotesque for display, Manrope for body, IBM Plex Mono for labels and metadata.
- **Language:** editorial/architectural — drafting grids, plan-drawing SVG, project indexes, technical captions and a materials palette.
- **Motion:** scroll reveals, a wipe reveal for images, a drawing plan, subtle hero parallax, project dialogs and a cursor label. Motion is disabled when `prefers-reduced-motion: reduce` is set.
- **Layout:** responsive from small phones to wide desktops; no horizontal overflow at the tested widths.

## Verified business information

The following details were taken from the business's Google Maps listing at the time of the build:

| Field | Value |
| --- | --- |
| Business name | AarchiZone Design Consultancy |
| Category | Architecture firm |
| Address | 12, Shaheed Major Vikas Yadav Marg, Friends Colony, HVPNL Colony, Civil Lines, Gurugram, Haryana 122001 |
| Phone | +91 98182 38524 |
| Email | aarchizone80@gmail.com |
| Hours | Monday–Saturday, 09:00–18:00; Sunday closed |
| Google rating | 5.0 from 26 reviews |
| Founded | 2018 |
| Principal | Dheeraj Bansal, B.Arch, Chandigarh College of Architecture (2005) |
| Plus code | F23P+R7 Gurugram, Haryana |
| Coordinates | 28.4545296, 77.0357048 |
| Place ID | `ChIJl_zpMSUZDTkREICyxFsfy58` |
| Google Maps | https://maps.app.goo.gl/5RbaZ3eTJ1Ez8fLD9 |
| Reviews | https://search.google.com/local/reviews?placeid=ChIJl_zpMSUZDTkREICyxFsfy58 |

Review quotes on the home page are short excerpts from the Google profile; reviewer names are omitted. Re-check the rating, review count and opening hours before launch, since Google listings can change.

## Project structure

```text
aarchizone/
├── index.html
├── about.html
├── services.html
├── projects.html
├── contact.html
├── README.md
├── css/
│   └── style.css          # design tokens, layout, components, responsive rules
├── js/
│   └── main.js            # header, menu, reveals, dialogs, filters, form, clock
└── assets/
    ├── favicon.svg
    ├── fonts/
    │   ├── bricolage-grotesque.woff2
    │   ├── manrope.woff2
    │   ├── ibm-plex-mono-400.woff2
    │   └── ibm-plex-mono-500.woff2
    └── img/
        ├── project-tanishq.webp        + project-tanishq-640.webp
        ├── project-phs.webp            + project-phs-640.webp
        ├── project-residence.webp      + project-residence-640.webp
        ├── project-apartments.webp     + project-apartments-640.webp
        └── og-cover.webp
```

## Assets and credits

- **Project photography:** four photographs from the business's Google Maps profile, resized and compressed to WebP. The images retain the original `AARCHIZONE` watermark. The 640w variants are used for smaller screens via `srcset`/`sizes`.
- **Fonts:** Bricolage Grotesque, Manrope and IBM Plex Mono, self-hosted as WOFF2. All three are available under the SIL Open Font License via Google Fonts.
- **OG cover:** derived from the residence photograph for social sharing.
- **Map:** the contact page uses a custom inline SVG map, not a third-party embed. The address, coordinates and "Open in Google Maps" link point to the real listing.
- **Icons:** inline SVG, no icon library.

## Implementation notes

- Semantic HTML5 landmarks, a skip link, one `h1` per page, visible focus styles and labelled controls.
- Mobile menu uses `inert`, Escape to close, focus return and a scroll lock.
- Project cards use native `<dialog>` with focus management; the dialog image is only loaded when opened.
- Project filters update `aria-pressed` and the `hidden` state of cards.
- FAQ sections use native `<details>`/`<summary>` and close siblings when one opens.
- The contact form validates natively, then opens a prefilled `mailto:aarchizone80@gmail.com` message. **No data is sent to a server.** This is deliberate until a form endpoint is connected.
- The first above-the-fold project image is eager and `fetchpriority="high"`; the rest are lazy-loaded with `srcset`/`sizes`.
- Fonts are preloaded and use `font-display: swap`.
- The local time in the footer uses `Asia/Kolkata`.
- Scroll reveals are progressive: content is visible if JavaScript is unavailable, and the reveal observer disconnects after each element appears.

## Quality checks

- **HTML validation:** `html-validate` passes on all five pages.
- **Automated browser QA:** 5 pages × 3 viewports (1440×900, 768×1024, 390×844) — no horizontal overflow, broken images, pending lazy images, console errors, page errors or failed requests.
- **Interaction QA:** mobile menu, project filters, project dialog, FAQ accordions and contact-form validation were exercised.
- **Lighthouse (mobile, local static server):**
  - Accessibility: **100** on all five pages
  - Best Practices: **100** on all five pages
  - SEO: **100** on all five pages
  - Performance: **77–92** across pages in local runs (the projects page reaches 85 after the LCP image fix)

The local test server does not enable compression or long-lived caching. Production scores should improve with gzip/Brotli, HTTP/2 and cache headers.

## Production checklist

1. **Domain and canonical URLs.** Add `<link rel="canonical">` and absolute `og:url` / `og:image` values once the production domain is known. The current build intentionally omits them because no domain is connected.
2. **Form endpoint.** Replace or supplement the `mailto:` flow with a real form service or API if the client wants enquiries captured server-side. Keep the phone/email fallback.
3. **Asset approval.** Confirm the project photographs and review excerpts are approved for public use, and replace them with higher-resolution originals if the client supplies them.
4. **Hosting.** Serve over HTTPS with Brotli/gzip compression, HTTP/2 and long cache lifetimes for `/assets/*`. Minify CSS/JS if the host does not do it automatically.
5. **Freshness.** Update the Google rating, review count and opening hours if they change.
6. **SEO extras.** Add `robots.txt`, `sitemap.xml` and a branded `404.html` for production.
7. **Analytics/privacy.** Add analytics only if required, and include a privacy note for any cookies or tracking.
8. **Social profiles.** Add real profile URLs to the JSON-LD `sameAs` array if the business has them.

## License

The site code is provided for AarchiZone Design Consultancy. The project photographs belong to the business. The fonts remain under the SIL Open Font License.
