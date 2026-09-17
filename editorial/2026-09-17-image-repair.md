# Image repair — 17 September 2026

Seven articles were committed directly as HTML and never registered in content.mjs. Four had no images. The other three linked remote images and omitted the shared gallery scripts. Existing checks iterated registered articles, so they did not validate these pages as articles.

Migrated all seven into imported editorial data and the shared build. Reviewed source HTML and contact sheets: Casa Fátima 25 images (including four plans); Élan 20; Hill House 12; Jihlava 16 (including two drawings); Omnibite 21 (including three diagrams); RIBA 6; Shy Society Palazzo 4. Total 104 source images, including seven covers and 97 gallery frames. Source URLs and photographer/project credits are recorded per image. No generated replacement was needed. These counts exclude advertisements, recommendations, tracking images and repeated thumbnails.

New build-time checks reject unregistered article HTML, missing prepared covers, missing source-image review and truncated galleries. Regression tests exercise all four failures. The release importer persists source-image reviews and reads all registered IDs, including imported data. All pages now use local responsive WebP assets and the existing fullscreen/compact gallery.

Validation: 77 HTML pages, 54 registered articles, 613 gallery placements. All internal links, images, metadata, structured data, RSS and sitemap passed. Mobile 390px Casa Fátima gallery shows one slide and fullscreen navigation from frame 1 to 2; no horizontal page overflow. Mobile homepage visually inspected.
