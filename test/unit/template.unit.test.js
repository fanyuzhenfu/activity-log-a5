import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTemplate, extractEventData, getEventAction } from '../../src/utils/templateEngine.js';

test('unit: replaces placeholders and removes empty links', () => {
    assert.equal(applyTemplate('{emoji} {action} [{repo}]({url}) {number}', {
        emoji: '✅', action: 'Updated', repo: 'private repository', url: '', number: '',
    }), '✅ Updated private repository');
});

test('unit: merged pull requests use merged action', () => {
    assert.equal(getEventAction('PullRequestEvent', { action: 'closed', pull_request: { merged: true } }), 'merged');
});

test('unit: private repository details are hidden', () => {
    const result = extractEventData({
        type: 'PushEvent', public: false, repo: { name: 'owner/private-project' },
        created_at: '2026-10-13T00:00:00Z', payload: { ref: 'refs/heads/secret', head: 'abc' },
    }, { PushEvent: 'PUSH' }, true);
    assert.equal(result.repo, 'a private repository');
    assert.equal(result.repo_url, '');
    assert.equal(result.ref, '');
    assert.equal(result.url, '');
});
