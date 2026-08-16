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
- **Long-Press Variants**: Hold a reply for an expanded follow-up—for example, hold **Yes** to insert “Yes, but explain why.”
- **Template Variables**: Save replies such as `Explain {{topic}} for {{audience}}`; Prompticon asks for the values before inserting or sending the completed prompt.
- **Keyboard Shortcuts**: Press `Alt` + `1` through `9` to insert the first nine replies in the active profile.
- **Searchable Command Palette**: Press `Alt` + `P` or click `⌕` on the toolbar to find a saved reply by its emoji, label, or text, then use arrow keys and Enter to select it.
- **Opt-In Smart Question Detection**: Enable local-only detection to show temporary Yes/No, True/False, or multiple-choice answers from the latest AI response.
- **First-Run Onboarding**: A short, interactive three-step walkthrough shows new users how to use and control quick replies.
- **Focused Settings Menu**: Use the top-right settings icon for toolbar visibility, website selection, click behavior, and smart detection.
- **Refined Utility UI**: A compact, light-first popup with focused settings and no internal scrollbars.
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
