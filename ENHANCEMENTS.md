# Codexel Enhancement Suggestions

This document proposes practical, incremental enhancements to improve Codexel's developer experience, reliability, and usability.

## 1) Multi-file Editing Workflow

- Support opening and editing all project files (not only `index.js` and `package.json`).
- Keep one Monaco model per file and preserve cursor/undo history when switching tabs.
- Add "dirty" indicators and unsaved change prompts.

**Why it matters:** Codexel currently offers a strong single-file flow, but projects scale faster when users can navigate and edit multiple files without context loss.

## 2) Run Control + Process Lifecycle

- Add **Run**, **Stop**, and **Restart** controls for the dev server process.
- Persist a reference to spawned processes and terminate them cleanly before restart.
- Display process status in the UI (idle / installing / running / failed).

**Why it matters:** predictable process control reduces confusion, especially during iterative debugging.

## 3) Better Error Experience

- Surface install/runtime errors in a dedicated panel with quick actions (e.g., "reinstall dependencies").
- Parse common npm and Vite errors and show friendlier explanations.
- Keep terminal output, but add lightweight error summaries for faster triage.

**Why it matters:** new users can recover faster when errors are explained in plain language.

## 4) Preview Improvements

- Add a manual **Open in New Tab** action for the running app URL.
- Implement basic preview health checks and auto-reconnect handling.
- Show a loading/empty state in the iframe while waiting for `server-ready`.

**Why it matters:** preview reliability and clarity are core to a browser-based coding environment.

## 5) File Tree + Project Scaffolds

- Replace the static sidebar with a dynamic tree from WebContainer FS.
- Add project templates (vanilla JS, React, Node API, etc.).
- Include quick actions: new file/folder, rename, delete.

**Why it matters:** this turns Codexel from a demo shell into a more complete mini-IDE.

## 6) Editor Quality-of-Life

- Add command palette actions for common tasks (format, run, restart, clear terminal).
- Support Monaco settings toggles (word wrap, minimap, theme).
- Add keyboard shortcuts and a settings popover.

**Why it matters:** these reduce friction for repeat actions and improve accessibility.

## 7) Performance + Resource Handling

- Debounce writes from editor changes before `fs.writeFile`.
- Avoid unnecessary file reads on tab switches when content is already in memory.
- Add guardrails for large logs/output to prevent UI slowdown.

**Why it matters:** smoother editing and terminal responsiveness, especially on lower-end devices.

## 8) Session Persistence

- Persist project files in `localStorage`/IndexedDB snapshots.
- Restore workspace state (open file, cursor position, pane sizes) on reload.
- Add explicit export/import project actions.

**Why it matters:** prevents accidental loss and makes Codexel practical for longer sessions.

## 9) Onboarding + Discoverability

- Add first-run hints (edit code, run app, read logs).
- Show minimal inline docs near terminal/editor controls.
- Provide a curated set of starter examples.

**Why it matters:** reduces time-to-first-success for new users.

## 10) Observability + Debugging Support

- Add structured event logging (boot time, install duration, server-ready latency).
- Provide a lightweight diagnostics modal with environment details.
- Capture non-fatal errors and offer copyable debug bundles.

**Why it matters:** easier diagnosis of flaky browser/runtime issues.

---

## Suggested Implementation Order (Low Risk → Higher Impact)

1. Run/Stop/Restart controls + process lifecycle handling.
2. Better error states and retry actions.
3. Dynamic file tree and multi-file model management.
4. Session persistence and export/import.
5. Performance tuning and diagnostics instrumentation.
