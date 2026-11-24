const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const shareStats = require('../share-stats.js');
const timeSaved = require('../time-saved.js');

const root = path.join(__dirname, '..');

test('shouldShowReviewPrompt triggers only at milestone and respects dismissal', () => {
  assert.equal(shareStats.shouldShowReviewPrompt({ uses: 0 }, false), false);
  assert.equal(shareStats.shouldShowReviewPrompt({ uses: 19 }, false), false);
  assert.equal(shareStats.shouldShowReviewPrompt({ uses: 20 }, false), true);
  assert.equal(shareStats.shouldShowReviewPrompt({ uses: 120 }, false), true);
  assert.equal(shareStats.shouldShowReviewPrompt({ uses: 120 }, true), false);
});

test('getReviewUrl resolves Firefox, Chrome Web Store, and fallback URLs', () => {
  assert.equal(
    shareStats.getReviewUrl({ userAgent: 'Mozilla/5.0 Firefox/142.0' }),
    shareStats.FIREFOX_REVIEW_URL
  );
  const chromeId = 'abcdefghijklmnopabcdefghijklmnop';
  assert.equal(
    shareStats.getReviewUrl({ runtimeId: chromeId, userAgent: 'Mozilla/5.0 Chrome/130.0' }),
    `https://chromewebstore.google.com/detail/prompticon/${chromeId}/reviews`
  );
  assert.equal(
    shareStats.getReviewUrl({ runtimeId: 'unpacked-dev', userAgent: 'Mozilla/5.0 Chrome/130.0' }),
    shareStats.CHROME_FALLBACK_URL
  );
});

test('buildShareText formats single and multiple quick replies cleanly', () => {
  assert.match(
    shareStats.buildShareText({ totalSeconds: 15, uses: 1 }, timeSaved.formatDuration),
    /saved me 15s across 1 quick reply/
  );
  assert.match(
    shareStats.buildShareText({ totalSeconds: 3660, uses: 42 }, timeSaved.formatDuration),
    /saved me 1h 1m across 42 quick replies/
  );
});

test('renderShareCardDataUrl draws a 1200x630 PNG card with key stats', () => {
  const drawnTexts = [];
  const fakeCtx = {
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
    fillRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    closePath() {},
    fill() {},
    stroke() {},
    fillText(text) { drawnTexts.push(text); }
  };
  const fakeCanvas = {
    width: 0,
    height: 0,
    getContext: () => fakeCtx,
    toDataURL: (mime) => `data:${mime};base64,FAKE`
  };

  const url = shareStats.renderShareCardDataUrl(
    { totalSeconds: 5040, uses: 142, firstUsedAt: Date.UTC(2026, 7, 15) },
    timeSaved.formatDuration,
    () => fakeCanvas
  );

  assert.equal(fakeCanvas.width, 1200);
  assert.equal(fakeCanvas.height, 630);
  assert.equal(url, 'data:image/png;base64,FAKE');
  assert.ok(drawnTexts.includes('1h 24m'));
  assert.ok(drawnTexts.some((line) => line.includes('142 quick replies')));
});

test('share-stats is packaged in Chrome bundle and wired into popup', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const popupHtml = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');

  assert.match(packageJson.scripts['pack:chrome'], /share-stats\.js/);
  assert.match(popupHtml, /<script src="share-stats\.js"><\/script>/);
  assert.match(popupHtml, /id="copyStatsBtn"/);
  assert.match(popupHtml, /id="downloadStatsCardBtn"/);
  assert.match(popupHtml, /id="reviewNudge"/);
});
