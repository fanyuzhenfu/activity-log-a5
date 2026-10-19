import test from 'node:test';
import assert from 'node:assert/strict';

test('demonstration failure is opt-in through workflow_dispatch only', () => {
    if (process.env.TEST_SCENARIO === 'fail-unit') {
        assert.fail('Intentional Assignment 5 fail-unit demonstration');
    }
});
