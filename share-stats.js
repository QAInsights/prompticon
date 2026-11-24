(function initializeShareStats(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PrompticonShareStats = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const REVIEW_MILESTONE_USES = 20;
  const REVIEW_PROMPT_DISMISSED_KEY = 'reviewPromptDismissed';
  const FIREFOX_REVIEW_URL = 'https://addons.mozilla.org/firefox/addon/prompticon/reviews/';
  const CHROME_FALLBACK_URL = 'https://chromewebstore.google.com/search/Prompticon';

  function shouldShowReviewPrompt(stats, dismissed) {
    if (dismissed === true) return false;
    const uses = Number(stats?.uses);
    return Number.isFinite(uses) && uses >= REVIEW_MILESTONE_USES;
  }

  function getReviewUrl({ runtimeId = '', userAgent = '' } = {}) {
    if (/firefox/i.test(String(userAgent))) return FIREFOX_REVIEW_URL;
    if (/^[a-p]{32}$/i.test(String(runtimeId))) {
      return `https://chromewebstore.google.com/detail/prompticon/${runtimeId}/reviews`;
    }
    return CHROME_FALLBACK_URL;
  }

  function buildShareText(stats, formatDuration) {
    const uses = Math.max(0, Math.floor(Number(stats?.uses) || 0));
    const totalSeconds = Math.max(0, Number(stats?.totalSeconds) || 0);
    const duration = typeof formatDuration === 'function' ? formatDuration(totalSeconds) : `${Math.round(totalSeconds)}s`;
    const replyWord = uses === 1 ? 'quick reply' : 'quick replies';
    return `Prompticon saved me ${duration} across ${uses} ${replyWord} on my AI chats — 100% local & free. https://qainsights.com`;
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function renderShareCardDataUrl(stats, formatDuration, createCanvas) {
    const makeCanvas = typeof createCanvas === 'function'
      ? createCanvas
      : () => (typeof document !== 'undefined' ? document.createElement('canvas') : null);
    const canvas = makeCanvas();
    if (!canvas || typeof canvas.getContext !== 'function') return null;

    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const uses = Math.max(0, Math.floor(Number(stats?.uses) || 0));
    const duration = typeof formatDuration === 'function'
      ? formatDuration(stats?.totalSeconds || 0)
      : `${Math.round(stats?.totalSeconds || 0)}s`;

    // Dark slate background with emerald ambient glow
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#07110d');
    bg.addColorStop(0.55, '#0b1724');
    bg.addColorStop(1, '#091f16');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(960, 120, 20, 960, 120, 440);
    glow.addColorStop(0, 'rgba(169, 255, 104, 0.24)');
    glow.addColorStop(1, 'rgba(169, 255, 104, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Frosted glass card frame
    drawRoundedRect(ctx, 64, 56, width - 128, height - 112, 32);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(169, 255, 104, 0.28)';
    ctx.stroke();

    // Header brand + privacy pill
    ctx.fillStyle = '#a9ff68';
    ctx.font = '700 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('⚡ PROMPTICON', 112, 134);

    drawRoundedRect(ctx, 816, 102, 272, 42, 21);
    ctx.fillStyle = 'rgba(169, 255, 104, 0.14)';
    ctx.fill();
    ctx.fillStyle = '#d9f99d';
    ctx.font = '600 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('100% LOCAL · ZERO TRACKING', 838, 129);

    // Hero metric
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('TIME SAVED ON AI CHATS', 112, 240);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 124px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(duration, 108, 376);

    const replyWord = uses === 1 ? 'quick reply' : 'quick replies';
    let detail = `across ${uses.toLocaleString('en-US')} ${replyWord}`;
    if (stats?.firstUsedAt) {
      const since = new Date(stats.firstUsedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      detail += ` since ${since}`;
    }
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(detail, 112, 438);

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('One-click quick replies & templates for 26+ AI chat platforms · qainsights.com', 112, 528);

    return typeof canvas.toDataURL === 'function' ? canvas.toDataURL('image/png') : null;
  }

  return {
    REVIEW_MILESTONE_USES,
    REVIEW_PROMPT_DISMISSED_KEY,
    FIREFOX_REVIEW_URL,
    CHROME_FALLBACK_URL,
    shouldShowReviewPrompt,
    getReviewUrl,
    buildShareText,
    renderShareCardDataUrl
  };
});
