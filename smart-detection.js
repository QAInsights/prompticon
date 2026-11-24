(function initializeSmartDetection(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PrompticonSmartDetection = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  function createChoiceReply(label) {
    return { emoji: '✦', label, text: label };
  }

  function hasQuestionCue(text) {
    return /\?|\b(?:answer|choose|pick|reply|respond|select)\b/i.test(text);
  }

  function extractLineChoices(text, expression) {
    const labels = [];
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(expression);
      if (match && !labels.includes(match[1])) labels.push(match[1]);
    }
    return labels.length >= 2 ? labels.slice(0, 9).map(createChoiceReply) : [];
  }

  function extractOptionChoices(text) {
    const labels = [];
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*(?:\*{0,2})?(Option\s+(?:[1-9]|[A-H]))(?:\*{0,2})?(?:[).:-]|\s+)\s*\S/i);
      if (match) {
        const normalized = match[1].replace(/\s+/g, ' ').replace(/^option/i, 'Option');
        if (!labels.includes(normalized)) labels.push(normalized);
      }
    }
    return labels.length >= 2 ? labels.slice(0, 6).map(createChoiceReply) : [];
  }

  function isClosingConfirmationQuestion(text) {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const tail = lines[lines.length - 1] || '';
    return /\b(?:would you like|do you want|should i|shall i|want me to)\b[^?]{0,120}\?\s*$/i.test(tail);
  }

  function detectSmartReplies(text) {
    const source = String(text || '').trim();
    if (!source || !hasQuestionCue(source)) return [];

    if (/\b(?:yes\s*(?:\/|or)\s*no|no\s*(?:\/|or)\s*yes)\b/i.test(source)) {
      return ['Yes', 'No'].map(createChoiceReply);
    }
    if (/\b(?:true\s*(?:\/|or)\s*false|false\s*(?:\/|or)\s*true)\b/i.test(source)) {
      return ['True', 'False'].map(createChoiceReply);
    }

    const optionChoices = extractOptionChoices(source);
    if (optionChoices.length) return optionChoices;

    const letterChoices = extractLineChoices(source, /^\s*([A-H])(?:[).:-])\s+\S/i);
    if (letterChoices.length) return letterChoices;

    const numberedChoices = extractLineChoices(source, /^\s*([1-9])(?:[).:-])\s+\S/);
    if (numberedChoices.length) return numberedChoices;

    if (isClosingConfirmationQuestion(source)) {
      return ['Yes', 'No'].map(createChoiceReply);
    }

    return [];
  }

  return { detectSmartReplies };
});
