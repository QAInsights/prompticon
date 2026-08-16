(function initializeOnboarding(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.PrompticonOnboarding = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  const ONBOARDING_STEP_COUNT = 3;

  function getOnboardingStepState(step) {
    const index = Math.min(Math.max(Number.isInteger(step) ? step : 0, 0), ONBOARDING_STEP_COUNT - 1);
    return {
      index,
      number: index + 1,
      isFirst: index === 0,
      isLast: index === ONBOARDING_STEP_COUNT - 1
    };
  }

  function shouldShowOnboarding(onboardingCompleted) {
    return onboardingCompleted !== true;
  }

  return {
    ONBOARDING_STEP_COUNT,
    getOnboardingStepState,
    shouldShowOnboarding
  };
});
