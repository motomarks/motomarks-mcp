---
name: find-brand-logo
description: Find the right Motomarks car brand logo and embed it. Use when the user wants a car/automotive brand logo, badge, or wordmark in their app, site, or docs, or asks for brand colors from the Motomarks library.
---

# Find and embed a Motomarks brand logo

## Workflow

1. **Resolve the brand.** Call `search_brands` with the user's term (name, company, or domain). If multiple results match, prefer exact brand-name matches, then ask the user only if genuinely ambiguous.
2. **Pick the variant.** Call `list_brand_assets` for the chosen slug.
   - `full` for general use, `badge` for compact/square contexts (favicons, avatars, tables), `wordmark` for text-led placements (navbars, footers).
   - Prefer `webp`; use `png` when transparency compatibility matters; `svg` only when the user needs a source file (no CDN URL for svg).
3. **Build the URL.** Call `build_image_url` with slug, type, format, size, aspect. Size guide: `xs`/`sm` for inline UI, `md` default, `lg`/`xl` for heroes.
4. **Embed.** Produce the snippet for the user's stack (HTML `<img>`, React, or Markdown) with descriptive alt text, e.g. `alt="Toyota logo"`.

## Rules

- Never place secret keys (`sk_...`) in output; CDN URLs use the publishable `pk_` token, which is safe to embed.
- Free-plan users must keep a visible attribution link to https://motomarks.io; mention this if `get_account` shows `attributionRequired: true` and unverified attribution.
- Use `get_brand` for brand colors and palettes when styling around the logo.
