# Prompticon

A small Chrome extension that adds Yes / No / Continue (and custom) quick-reply
buttons — “tips” — that appear on hover above the chat input on your favorite
LLM chat site, so you don't have to type common replies by hand.

Works with:

- [Claude](https://claude.ai)
- [ChatGPT](https://chatgpt.com)
- [Gemini](https://gemini.google.com)
- [Grok](https://grok.com)
- [Mistral Le Chat](https://chat.mistral.ai)
- [Qwen Chat](https://chat.qwen.ai)
- [Meta AI](https://meta.ai)
- ...and most other chat sites, thanks to a generic "find any visible chat
  composer" fallback.

## Install (unpacked, for local/dev use)

1. Open `chrome://extensions`.
2. Enable "Developer mode" (top right toggle).
3. Click "Load unpacked" and select this folder (`llm-emoji`).
4. Open or refresh any supported chat site. Hover over the chat input (or
   focus it) and a row of quick-reply buttons appears just above it.

## Customize

Click the extension icon in the toolbar to:

- Edit, add, or remove quick replies (emoji, short label, and the actual text).
- Toggle "Auto-send on click" if you want the button to fill the box and send
  immediately instead of just filling it.

## How it works

The content script detects the current provider from the URL, then looks up its
composer and send-button selectors in a provider registry (`PROVIDERS` in
`content.js`). It mounts a floating toolbar that appears when you hover over
the chat input and positions itself just above it. Clicking a button focuses
the input and inserts its text:

- The toolbar samples the composer's computed `font-family` / `font-size` and
  applies it to the buttons (clamped to a readable range), so the buttons
  visually match each site's own UI typography.
- The panel mirrors the input's width (clamped to the viewport) and is centered
  over it, so the chip row lines up with the composer on every site.
- Because the toolbar is a fixed-position overlay rather than injected into the
  page's layout, it can't be clipped by fixed-height, `overflow: hidden`
  composer docks — the failure mode that broke Gemini and Qwen with the old
  inline approach. It hides a moment after the pointer leaves the input or the
  panel. Focusing the composer opens it too, so keyboard and touch users get
  the same buttons.

- `contenteditable` editors (Claude's ProseMirror, ChatGPT, Gemini, ...) are
  filled via `execCommand('insertText', ...)`, which is the reliable way to
  update React/ProseMirror/Quill-based editors.
- Plain `<textarea>`/`<input>` composers (Grok, Meta AI, ...) are filled via
  the native value setter plus an `input` event, so React-based sites pick the
  text up too.

If a provider's selectors all fail (or the site isn't in the registry yet), a
generic fallback scores every visible input on the page — preferring editable
fields inside a `<form>` near the bottom with a hint like "message"/"prompt" —
and finds any send-like button.

## Known caveats

All of these sites are SPAs whose class names are auto-generated and change
with every deploy. The script deliberately avoids matching on those classes
and instead relies on:

- stable per-provider selectors (`aria-label`, `data-testid`, `id`, role), and
- the generic fallback described above.

If a future redesign changes those attributes and the toolbar stops appearing,
open `content.js` and adjust the `inputSelectors` / `sendSelectors` for that
provider (inspect the input box in DevTools to find a stable selector). New
chat sites can be added by appending an entry to the `PROVIDERS` array and
adding the host to `manifest.json`.

## Files

- `manifest.json` - extension config (Manifest V3) + list of supported hosts
- `content.js` - provider registry, composer/send detection, hover toolbar
- `content.css` - toolbar/button styling (light + dark mode)
- `popup.html` / `popup.js` - settings UI for editing quick replies
