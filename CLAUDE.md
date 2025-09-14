# Project Brief — AI-Buffet (Premium AI Blog)
Goals
- Premium, fast, mobile-first AI news/tools blog.
- Main draw: trustworthy info (news, tools, tactics, trends, “scary uses”).
- Monetization: ads + optional donation link.
- Subtle funnel to my tools (AI-Buffet) via tasteful CTAs (“Templates & Playbooks”, “Free Automations”).

Brand & UX
- Dark default theme, roomy spacing, rounded cards, soft shadows.
- Google Fonts: Inter (UI) + DM Serif Display (headlines). System fallbacks ok.
- Color tokens:
  - primary: #4F46E5
  - accent: #22D3EE
  - text: #E5E7EB on #0B1020 background
- Components: Header w/ logo, sticky nav; Hero; ArticleGrid (Top + Latest tabs); Category pages; Post page w/ TOC; Newsletter block; “Free Tools” CTA; Footer with socials + donation.

Architecture
- `index.html` (home), `posts/<slug>.html`, `categories/<name>.html`
- `assets/css/main.css` (no framework), `assets/js/main.js`
- Images lazy-loaded, responsive.

SEO & Social
- Canonical, OG/Twitter tags, structured data (Organization + WebSite + SearchAction).
- Clean URLs, readable metadata, internal linking.

Performance
- CLS-safe lazy images, minified CSS/JS, preconnect to fonts, defer JS.
- 90+ Lighthouse targets.

Accessibility
- Semantic HTML5; landmarks; focus states; aria labels on nav/tabs.

Funnel (subtle)
- CTAs named “Templates & Playbooks,” “Automation Starters,” “Free Tools”.
- Place CTAs after article intro + before footer; link to ai-buffet.com/tools.

Output Quality
- Production-quality HTML/CSS/JS; well-commented; no inline styles except critical CSS.
- Keep code organized and readable.
