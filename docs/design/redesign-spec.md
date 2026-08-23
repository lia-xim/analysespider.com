# AnalyseSpider interface specification — 2026-08-23

## User promise

A visitor should understand the site in one sentence: use a small tool, learn why a technical signal matters, or compare crawler roles.

Primary navigation uses only:

- Tools
- Crawlers / Crawler
- Learn / Wissen
- About / Über

Lab notes and references remain evidence formats inside the knowledge system. They are not unexplained primary navigation labels.

## Visual direction

The approved concept uses a white canvas, dark neutral text, one warm red signal colour, thin grey rules, and restrained cards. It removes condensed display type, heavy all-caps labels, rail numbers, and ornamental grid framing.

Design concepts were generated for the homepage, knowledge hub, and crawler comparison before implementation. Working concept files are stored in the Codex visualisation workspace under analysespider-redesign.

## Type

- Font stack: Inter when locally available, then Segoe UI, Roboto, Helvetica, Arial, sans-serif.
- Body: 16px minimum, 1.65 line height.
- Main heading: fluid 42–68px, weight 600, no uppercase transform.
- Section heading: fluid 32–52px, weight 600.
- Text measure: usually 56–72 characters.
- Technical strings and long URLs must wrap or scroll inside their own region.

## Colour

- Canvas: #ffffff
- Soft surface: #f7f8fa
- Primary text: #17191d
- Secondary text: #4d535c
- Border: #dde1e6
- Signal/action: #ed341f
- Focus: #175cd3
- Footer: #17191d

Colour never carries a diagnostic meaning alone.

## Components

- Header: brand, four user jobs, and a visible EN/DE switch.
- Hero: one promise, two actions, and a concrete signal preview.
- Problem list: plain questions, not internal content labels.
- Resource rows: title, one-sentence result, input/privacy note, action.
- Knowledge groups: questions grouped by topic.
- Crawler comparison: horizontally scrollable semantic table with official source links.
- Related work: a bounded coloured band with an adjacent common-owner disclosure.
- Footer: purpose, essential routes, legal routes, new-ownership boundary.

## Responsive and accessibility rules

- At 1000px the hero and split sections become one column.
- At 700px navigation becomes four equal touch targets and content uses a 16px gutter.
- Tables scroll horizontally without widening the page.
- Focus remains visible, headings wrap, and the skip link still reaches main.
- Motion is disabled when prefers-reduced-motion is active.
- No core explanation or link depends on JavaScript.

## Copy boundary

Use short sentences and explain technical terms where they first affect a decision. Do not replace precise status names, protocol fields, crawler names, or legal boundaries with vague marketing language. Do not claim that a page will be indexed or that one crawler product is best without repeatable evidence.
