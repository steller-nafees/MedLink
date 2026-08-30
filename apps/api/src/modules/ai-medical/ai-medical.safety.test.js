const test = require('node:test');
const assert = require('node:assert/strict');

const { sanitizeAiMedicalResponse, containsProhibitedEmergencyNumber } = require('./ai-medical.service');

test('rejects prohibited emergency numbers', () => {
  assert.equal(containsProhibitedEmergencyNumber('Call 911 immediately'), true);
  assert.equal(containsProhibitedEmergencyNumber('Dial 999 for emergency help'), true);
  assert.equal(containsProhibitedEmergencyNumber('Go to the nearest hospital'), false);
});

test('sanitizes AI response by removing emergency numbers and guidance', () => {
  const result = sanitizeAiMedicalResponse({
    severity: 'CRITICAL',
    summary: 'Call 911 now and then call 999 for help.',
    possibleConditions: 'Severe distress',
    tags: 'critical',
    firstAid: 'If the person is unresponsive, call emergency services and begin CPR.',
  });

  assert.equal(result.summary.includes('911'), false);
  assert.equal(result.summary.includes('999'), false);
  assert.equal(result.firstAid.includes('emergency services'), false);
  assert.match(result.firstAid, /nearest hospital|medical care|seek urgent/);
});
