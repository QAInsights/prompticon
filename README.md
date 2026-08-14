# Prompticon

A sleek, lightweight Chrome extension that adds fluid, customizable quick-reply buttons (e.g. Yes / No / Continue / A-E Quiz options) floating gracefully above the chat input on your favorite LLM chat platforms.

Never type repetitive answers or multiple-choice options by hand again!

## 🌐 Supported Platforms

- **[ChatGPT](https://chatgpt.com)**
- **[Claude](https://claude.ai)**
- **[Gemini](https://gemini.google.com)**
- **[Grok](https://grok.com)**
- **[Mistral Le Chat](https://chat.mistral.ai)**
- **[Qwen Chat](https://chat.qwen.ai)**
- **[Meta AI](https://meta.ai)**
- ...and most web chat interfaces via intelligent fallback detection.

---

## ✨ Features

- **Fluid Movable Toolbar**: Click and drag the `⠿` handle (or any toolbar chip) to position your quick replies anywhere on your screen.
- **One-Click Reset (`↺`)**: Snap the toolbar right back to its default position above the composer anytime.
- **Collapsible (`✕` / `💬 Quick Replies`)**: Minimize the toolbar into a compact pill on the left when you want minimal distraction.
- **Multiple Profiles**: Switch between **General** (Yes, No, Continue, More detail, Shorter, Thanks) and **Quiz** (A, B, C, D, E) modes, or create custom presets.
- **Optional Auto-Send**: Automatically submits the prompt on click, or simply populates the composer for review.
- **Premium Glassmorphic Aesthetics**: Modern Apple & Google-inspired glassmorphism with smooth micro-interactions, dark mode adaptation, and dynamic font matching.
- **Zero Tracking & Privacy-First**: 100% client-side with no analytics, third-party trackers, or network calls.

---

## 📦 Publishing & Packaging

To create a production-ready `.zip` bundle for the Chrome Web Store:

```bash
npm run pack
```

This generates `prompticon-v1.3.0.zip` ready for upload in the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

## 🛠️ Local Development & Testing

1. Open `chrome://extensions/` in Chrome or Chromium.
2. Toggle on **Developer mode** (top-right).
3. Click **Load unpacked** and select this directory (`llm-emoji`).
4. Run automated unit tests:

```bash
npm test
```

---

## 📄 License

MIT © [QAInsights](https://qainsights.com)

