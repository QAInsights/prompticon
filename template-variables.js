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

  function resolveBuiltinValues(template, context = {}) {
    const variables = getTemplateVariables(template);
    const prefilled = {};
    const remaining = [];
    const selection = typeof context?.selection === 'string' ? context.selection.trim() : '';
    const pageTitle = typeof context?.pageTitle === 'string' ? context.pageTitle.trim() : '';

    for (const name of variables) {
      if (name === 'selection' && selection) {
        prefilled[name] = selection;
      } else if (name === 'page_title' && pageTitle) {
        prefilled[name] = pageTitle;
      } else {
        remaining.push(name);
      }
    }

    const partiallyRendered = Object.keys(prefilled).length
      ? template.replace(VARIABLE_PATTERN, (match, name) => (name in prefilled ? prefilled[name] : match))
      : template;

    return { prefilled, remaining, partiallyRendered };
  }

  return { getTemplateVariables, renderTemplate, resolveBuiltinValues };
});
