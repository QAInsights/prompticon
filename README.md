# Prompticon

A sleek, lightweight Chrome and Firefox extension that adds fluid, customizable quick-reply buttons (e.g. Yes / No / Continue / A-E Quiz options) floating gracefully above the chat input on your favorite LLM chat platforms.

Never type repetitive answers or multiple-choice options by hand again!

## 🌐 Supported Platforms

- **[ChatGPT](https://chatgpt.com)**
- **[Claude](https://claude.ai)**
- **[Gemini](https://gemini.google.com)**
- **[Grok](https://grok.com)**
- **[Mistral Le Chat](https://chat.mistral.ai)**
- **[Qwen Chat](https://chat.qwen.ai)**
- **[Meta AI](https://meta.ai)**
- **[DeepSeek](https://chat.deepseek.com)**
- ...and most web chat interfaces via intelligent fallback detection.

---

## ✨ Features

- **Fluid Movable Toolbar**: Click and drag the `⠿` handle (or any toolbar chip) to position your quick replies anywhere on your screen. Prompticon remembers a separate position for each supported website.
- **One-Click Reset (`↺`)**: Snap the toolbar right back to its default position above the composer anytime.
- **Collapsible (`✕` / `💬 Quick Replies`)**: Minimize the toolbar into a compact pill on the left when you want minimal distraction.
- **Visibility Control**: Hide the toolbar globally or choose exactly which supported websites should display it.
- **Multiple Profiles**: Switch between General, Developer, Writer, Student, Support, Recruiter, Sales, and Quiz reply packs, then tailor each pack to your workflow.
- **Curated Profile Packs**: Start with tailored quick replies for developers, writers, students, support teams, recruiters, and sales conversations.
- **Click Behavior Control**: Choose whether a quick reply fills the composer for review (the default) or sends immediately.
- **Time-saved stats**: See a local-only estimate of time saved by quick replies, with a reset button and a settings toggle.
- **Long-Press Variants**: Hold a reply for an expanded follow-up—for example, hold **Yes** to insert “Yes, but explain why.”
- **Template Variables**: Save replies such as `Explain {{topic}} for {{audience}}`; Prompticon asks for the values before inserting or sending the completed prompt.
- **Keyboard Shortcuts**: Press `Alt` + `1` through `9` to insert the first nine replies in the active profile.
- **Searchable Command Palette**: Press `Alt` + `P` or click `⌕` on the toolbar to find a saved reply by its emoji, label, or text, then use arrow keys and Enter to select it.
- **Accessible Popup Shortcut**: Press `Alt` + `Shift` + `P` to open Prompticon from the keyboard. Browser shortcut settings can be used to customize it.
- **Opt-In Smart Question Detection**: Enable local-only detection to show temporary Yes/No, True/False, or multiple-choice answers from the latest AI response.
- **First-Run Onboarding**: A short, interactive three-step walkthrough shows new users how to use and control quick replies.
- **Focused Settings Menu**: Use the top-right settings icon for toolbar visibility, website selection, click behavior, and smart detection.
- **Refined Utility UI**: A compact, light-first popup with focused settings and no internal scrollbars.
- **Zero Tracking & Privacy-First**: 100% client-side with no analytics, third-party trackers, or network calls.

---

## 🌍 Browser Support

- Current stable Chrome and Chromium-based browsers.
- Firefox Desktop 142 or newer.

Prompticon uses one shared Manifest V3 codebase for both browser families. Firefox-specific manifest metadata is ignored by Chrome, and new features should remain within the APIs supported by both browsers or provide a small compatibility fallback.

### Cross-browser release guardrails

- Request only permissions required by a shipped feature and explain any site access in store listings.
- Keep all executable code inside the extension package; do not use remote scripts, `eval`, or unsafe HTML insertion.
- Treat values from storage and supported websites as untrusted and render them with native DOM properties such as `textContent` and `value`.
- Require trusted user events before injected page controls can fill or submit chat content.
- Keep private browsing disabled unless private-session storage and data isolation are explicitly designed and tested.
- Run `npm test`, `npm run lint:firefox`, and manual Chrome/Firefox smoke tests before publishing each version.

## 📦 Publishing & Packaging

Create a production-ready Chrome Web Store bundle:

```bash
npm run pack
```

This generates `prompticon-chrome-v1.3.3.zip` ready for the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).

Validate and create the Firefox Add-ons bundle:

```bash
npm run check:firefox
```

This runs the complete test suite, treats Mozilla validator warnings as errors, and generates `web-ext-artifacts/prompticon-firefox-v1.3.3.zip` for the [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/). See [AMO_SUBMISSION.md](AMO_SUBMISSION.md) for the listing copy, reviewer notes, and submission checklist.

---

## 🛠️ Local Development & Testing

### Chrome

1. Open `chrome://extensions/`.
2. Toggle on **Developer mode**.
3. Click **Load unpacked** and select this directory.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select this repository's `manifest.json`.

Run automated unit tests:

```bash
npm test
```

Run Mozilla's strict validator without creating a package:

```bash
npm run lint:firefox
```

---

## 📄 License

MIT © [QAInsights](https://qainsights.com)
