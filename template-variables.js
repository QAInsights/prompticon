(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PrompticonTemplateVariables = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const VARIABLE_PATTERN = /{{\s*([a-zA-Z][a-zA-Z0-9_-]*)\s*}}/g;

  function getTemplateVariables(template) {
    if (typeof template !== 'string') return [];
    const variables = [];
    const seen = new Set();
    let match;
    while ((match = VARIABLE_PATTERN.exec(template))) {
      const name = match[1];
      if (!seen.has(name)) {
        seen.add(name);
        variables.push(name);
      }
    }
    return variables;
  }

  function renderTemplate(template, values = {}) {
    if (typeof template !== 'string') return '';
    return template.replace(VARIABLE_PATTERN, (_, name) => String(values[name] ?? '').trim());
  }

  return { getTemplateVariables, renderTemplate };
});
