const test = require('node:test');
const assert = require('node:assert/strict');
const detection = require('../smart-detection.js');

test('detects clear Yes/No and True/False prompts', () => {
  assert.deepEqual(
    detection.detectSmartReplies('Would you like to continue? Answer Yes or No.'),
    [
      { emoji: '✦', label: 'Yes', text: 'Yes' },
      { emoji: '✦', label: 'No', text: 'No' }
    ]
  );
  assert.deepEqual(
    detection.detectSmartReplies('True or False: this change is backwards compatible?'),
    [
      { emoji: '✦', label: 'True', text: 'True' },
      { emoji: '✦', label: 'False', text: 'False' }
    ]
  );
});

test('detects clear lettered and numbered multiple-choice lists', () => {
  assert.deepEqual(
    detection.detectSmartReplies('Choose one:\nA) Red\nB) Green\nC) Blue').map((reply) => reply.text),
    ['A', 'B', 'C']
  );
  assert.deepEqual(
    detection.detectSmartReplies('Select an option:\n1. Draft\n2. Review\n3. Publish').map((reply) => reply.text),
    ['1', '2', '3']
  );
});

test('rejects ordinary prose and incomplete option lists', () => {
  assert.deepEqual(detection.detectSmartReplies('Yes or no is a common binary pattern.'), []);
  assert.deepEqual(detection.detectSmartReplies('Choose one:\nA) Only option'), []);
});
