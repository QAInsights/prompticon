const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const onboarding = require('../onboarding.js');

test('onboarding has a concise three-step flow', () => {
  assert.equal(onboarding.ONBOARDING_STEP_COUNT, 3);
});

test('getOnboardingStepState clamps invalid steps and reports navigation state', () => {
  assert.deepEqual(onboarding.getOnboardingStepState(-1), {
    index: 0,
    number: 1,
    isFirst: true,
    isLast: false
  });
  assert.deepEqual(onboarding.getOnboardingStepState(1), {
    index: 1,
    number: 2,
    isFirst: false,
    isLast: false
  });
  assert.deepEqual(onboarding.getOnboardingStepState(9), {
    index: 2,
    number: 3,
    isFirst: false,
    isLast: true
  });
});

test('onboarding is shown until completion is explicitly recorded', () => {
  assert.equal(onboarding.shouldShowOnboarding(undefined), true);
  assert.equal(onboarding.shouldShowOnboarding(false), true);
  assert.equal(onboarding.shouldShowOnboarding(true), false);
});

test('popup uses a native dialog and explicitly hides inactive onboarding slides', () => {
  const popupHtml = fs.readFileSync(path.join(__dirname, '..', 'popup.html'), 'utf8');
  const popupScript = fs.readFileSync(path.join(__dirname, '..', 'popup.js'), 'utf8');

  assert.match(popupHtml, /<dialog class="onboarding" id="onboarding"/);
  assert.match(popupHtml, /class="onboarding-step-markers"/);
  assert.match(popupHtml, /\.onboarding-slide\[hidden\]\s*\{\s*display:\s*none;/);
  assert.match(popupScript, /onboardingEl\.showModal\(\)/);
  assert.match(popupScript, /onboardingStepMarkers\.forEach/);
});

test('popup editor does not create an internal scrolling reply list', () => {
  const popupHtml = fs.readFileSync(path.join(__dirname, '..', 'popup.html'), 'utf8');

  assert.doesNotMatch(popupHtml, /\.list-container\s*\{[^}]*overflow-y:\s*auto;/);
  assert.doesNotMatch(popupHtml, /\.list-container\s*\{[^}]*max-height:/);
});
