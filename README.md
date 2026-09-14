# BEYOND WEIGHT

A polished, problem-led medical campaign concept for seca UK and the seca mBCA Alpha.

**Campaign:** See what weight and BMI can't show you.  
**Proposition:** More insight from every measurement.  
**Live project path:** https://robertsicher.github.io/seca-medical-campaigns/

This is an independent interview prototype, not an official seca website. It uses conservative clinical language and links to current official sources reviewed on 14 September 2026. It does not transmit personal information or patient data.

## 1. Campaign concept

Six customer routes connect clinical and operational questions to appropriate next steps:

- Understand: pathway efficiency.
- Protect: body composition during weight management.
- Engage: patient conversations and visible progress.
- Enhance: private health assessments.
- Personalise: six clinical applications.
- Scale: a measurable NHS / healthcare-group pilot.

The discreet Campaign Strategy footer link explains progressive profiling, Contact + Company association, segmentation, fit + intent, ABM, nurture and commercial measurement.

## 2. File structure

- index.html: campaign homepage at the repository root.
- weight-management/index.html
- pathway-efficiency/index.html: five interactive pathways and capacity planner.
- patient-engagement/index.html
- private-health/index.html: assessment comparison and opportunity calculator.
- clinical-applications/index.html: six speciality sections.
- nhs-pilot/index.html: pilot framework and buying group.
- resources/index.html: searchable, filterable 14-resource library.
- resources/*/index.html: 12 complete referenced HTML resources.
- campaign-strategy/index.html
- assets/css/styles.css: shared responsive design, accessible focus states and print styles.
- assets/js/config.js: official URLs and illustrative calculator defaults.
- assets/js/calculators.js: pure calculation functions.
- assets/js/site.js: navigation, forms, filters, pathways, calculations and guide downloads.
- assets/images/: locally hosted official seca assets and concept favicon.
- docs/SOURCES.md: source register, claims boundaries and imagery provenance.
- tests/site.test.cjs: optional static, browser, accessibility and calculator checks.
- .github/workflows/pages.yml: test and publish static files to GitHub Pages.
- .nojekyll: disables Jekyll processing.

## 3. Preview locally

There is **no build process**, package installation or backend required to run the site.

Clone the repository. From its parent directory, run:

    python3 -m http.server 8000

Then open:

    http://localhost:8000/seca-medical-campaigns/

The directory name should be seca-medical-campaigns to exactly exercise the deployed project path. Opening individual HTML files also supports reading; using a local HTTP server is recommended for complete testing.

## 4. GitHub Pages deployment

All HTML, CSS, JavaScript and images are committed on main.

In repository **Settings → Pages**, select **GitHub Actions** as the source. The included workflow runs quality checks, packages only the public static site and deploys it. If Pages has not been enabled, this setting requires the repository owner. No personal token should be added to client code or committed.

Alternatively, the site can be served directly from **main / (root)** using branch-based Pages, without any generation step. Select only one publishing approach to avoid competing deployments.

The homepage is index.html in the root. There is intentionally no beyond-weight directory. Internal links and assets are relative at every depth. Canonical and Open Graph metadata use the expected production URL.

The prototype is intentionally **noindex,follow** on every page. This protects against an unofficial campaign appearing in search while retaining realistic titles, descriptions and content structure for interview discussion. Remove noindex only for an authorised, clinically reviewed launch on the approved domain.

## 5. Imagery

Official seca images are stored locally under assets/images; the site never hotlinks images. Descriptive filenames:

- mbca-alpha.jpg: product hero.
- clinical-consultation.jpg: clinician and patient.
- measurement-in-practice.jpg: clinical measurement scene.
- patient-results.jpg: myAnalytics context.
- analytics-125.jpg: official software example.
- seca-logo.svg: official identity.

Replace files with approved assets at the same paths or update the referencing HTML. Preserve appropriate image dimensions and alt text. Product photography is not an outcome claim. Provenance is in docs/SOURCES.md. Brand and image rights must be cleared before any real campaign launch; this prototype does not grant a licence to seca assets.

The one-off import-media workflow downloads the exact verified source images and commits them. It is not needed for normal deployment. The source-audit workflow is a reproducible documentation check.

## 6. Calculator assumptions and methods

Edit example starting values in assets/js/config.js **and the corresponding HTML input value attributes** so the non-JavaScript initial display stays aligned. Calculation logic is in assets/js/calculators.js. Validation also respects the HTML min, max, step and required attributes.

### Capacity planner

Patients per year is the total across the whole service. Devices is total across all sites. It assumes equal distribution.

- Annual measurements = patients × measurements per patient.
- Per-site annual average = annual measurements / sites.
- Service working-day average = annual measurements / days.
- Per-device annual average = annual measurements / devices.
- Per-device working-day average = annual measurements / devices / days.

No clinical throughput or appointment savings are inferred from the published 24-second BIA measurement period.

### Private health opportunity

Monthly assessment volume is **per location**. Uptake is among those offered the enhancement.

- Enhanced assessments = monthly assessments × 12 × locations × offered% × uptake%.
- Additional assessment revenue = enhanced assessments × incremental package value.
- Follow-up revenue = enhanced assessments × expected completed chargeable follow-ups × extra follow-up value.
- Combined indicative opportunity = the two revenues above.
- Revenue-based payback in months = entered investment / combined annual revenue × 12.

No equipment price is supplied. Blank optional follow-up value is zero. Blank or zero investment means payback is not entered. Positive investment with zero revenue is not calculable. Negative, non-finite, out-of-range and invalid count values are rejected.

This is steady-state gross revenue, not profit, cash flow or an investment recommendation. It excludes operating costs, ramp-up, financing and tax. Follow-ups included in package value must not be double-counted.

## 7. Resource content and downloads

Each guide is a complete static resources/<slug>/index.html document. Edit the article-body sections, matching contents anchors, metadata and source references together. Update the resource library card if the title, category or topic tags change.

Visitors can read everything openly. The download button previews a short simulated conversion form, then provides a genuine self-contained printable HTML download generated in the browser. It includes all guide content, source links, inline print styling and the prototype disclaimer. It has no scripts or remote assets. The Print / save as PDF control opens the browser's print dialog; choose Save as PDF where supported.

The guide download is not a PDF disguised as a link. It is explicitly labelled printable HTML.

## 8. Prototype forms and privacy

Forms are simulated. Before entry, users are asked to use fictional details. No field values are read, serialised, logged, transmitted or persisted. No fetch, XHR, beacon, localStorage, sessionStorage, cookie or HubSpot request is made.

Native browser validation is used. A Content Security Policy with connect-src 'none' and form-action 'none' also prevents network submission. With JavaScript disabled, submit remains disabled.

A boolean in memory allows a later-stage progressive form to be previewed on the same page. It stores no personal profile and resets on navigation / reload. The success message explains the intended live HubSpot journey without claiming an actual enquiry occurred. Real contact is via the official seca UK site.

## 9. Future HubSpot integration

Replace simulated forms with approved HubSpot embedded forms only after privacy, security and clinical/brand review.

Map clinical area and organisation fields; associate Contacts and Companies carefully. NHS shared domains and parent healthcare groups require consideration. Use stage-appropriate additional questions rather than requesting all fields initially.

Implement permission handling, subscription types, suppression, retention, lead ownership and tested follow-up routes. Keep patient records and measurement data out of marketing CRM. Calibrate scoring and MQL rules against sales conversion data.

The Campaign Strategy page contains illustrative active lists, nurture paths, scoring and account-level signals. It is not a claim that a particular HubSpot subscription already supports or is configured for every feature.

## 10. Future tracking

The end of head on each page is a potential insertion point for an approved consent-managed tracking integration. None is installed.

site.js dispatches limited non-PII CustomEvents with the beyondweight: prefix as an integration interface. They do not send data anywhere. Before live implementation, define events for meaningful guide downloads, calculator completion, product engagement and demo requests, with explicit deduplication and attribution rules.

A real integration must deliberately revise the CSP for approved script, frame, image and connection domains. Do not weaken it speculatively or send form field / patient data into analytics.

## 11. Official seca links

Central configuration is in assets/js/config.js. Static source references also appear in the HTML so they remain available without JavaScript. When a source URL changes, update config.js, the corresponding HTML references and docs/SOURCES.md. Search the repository for the old URL to avoid stale references.

## Quality checks

Optional development / CI tooling only:

    npm install --no-save playwright @axe-core/playwright
    npx playwright install --with-deps chromium
    node tests/site.test.cjs

The test server uses /seca-medical-campaigns/, not merely /. Tests cover local links and fragment targets, JavaScript syntax, calculator edge cases, forms, guide downloads, filters, all five pathways, mobile navigation, horizontal overflow, image loading, console errors and axe accessibility checks.

The GitHub Actions quality run uploads desktop/mobile screenshots and test output. Runtime dependencies remain zero.
