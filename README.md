# OAuth Atlas

An OAuth readiness portal prototype for developers building AI agent integrations.

## Run locally

With Node.js 20+:

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. The full application is built with Next.js App Router, React, TypeScript, and Tailwind CSS. The `app/` directory contains the application and typed guide schema.

## Folder preview for review or submission

The project includes a self-contained `preview.html` with no build step. To launch it from the project folder:

```bash
npm run preview
```

Open <http://localhost:4173>. This standalone preview includes the library, guide details, investigator simulation, saved checklist state, workspace/profile menus, theme switching, and Markdown/JSON exports. It can also be opened directly by double-clicking `preview.html`; the local server is recommended for browser APIs such as clipboard and share URLs.

If port 4173 is already in use, run `$env:PORT=4174; npm run preview` in PowerShell, then open <http://localhost:4174>. Run `npm run preview` from this folder and keep its terminal open while reviewing the page.

## Prototype behavior

- Curated Slack, Notion, Google Workspace, Salesforce, GitHub, and HubSpot guides.
- Search, category and difficulty filters, and setup/friction sorting.
- Guide metrics, four-step navigation, responsibility matrix, blockers, sources, and progress checklist.
- Simulated investigator progress and a fallback guide for arbitrary names and URLs. Generated details are explicitly marked unverified.
- Share links, Markdown/JSON export, and locally saved checklist progress.

The live investigator is simulated. Provider requirements and timelines are planning guidance; confirm current provider documentation before shipping.

## Checks

```bash
npm test
npm run lint
npm run build
```
