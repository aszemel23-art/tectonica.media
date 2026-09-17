# TECTONICA publication

Read editorial/AGENTS.md and editorial/EDITORIAL-POLICY.md before any publication.

Never create or edit articles/*/index.html, the homepage, daily route, category pages, archive, search index, RSS or sitemap as the publication source. All are generated from content.mjs and imported editorial data. A direct HTML commit on 17 September bypassed media validation and lost galleries.

Every new article must be registered in content data, have a prepared local cover with credit, the full reviewed source gallery, and imageReview with sourceImageCount and explicit excluded URLs/reasons. Generated illustrations must be labelled. Use the existing fullscreen gallery. Run npm run build and npm test, then verify the deployed pages and images before reporting success. Preserve the latest remote changes, Telegram/MAX links, advertising and analytics.
