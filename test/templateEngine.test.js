import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTemplate, extractEventData, getEventAction } from '../src/utils/templateEngine.js';

test('applyTemplate replaces values and removes empty optional markdown links', () => {
    const rendered = applyTemplate('{emoji} {action} [{repo}]({url}) {number}', {
        emoji: 'OK',
        action: 'Updated',
        repo: 'private repository',
        url: '',
        number: '',
    });
    assert.equal(rendered, 'OK Updated private repository');
});

test('getEventAction reports a merged pull request', () => {
    assert.equal(getEventAction('PullRequestEvent', {
        action: 'closed',
        pull_request: { merged: true },
    }), 'merged');
});

test('extractEventData hides private repository details', () => {
    const result = extractEventData({
        type: 'PushEvent',
        public: false,
        repo: { name: 'owner/private-project' },
        created_at: '2026-10-13T00:00:00Z',
        payload: { ref: 'refs/heads/secret-branch', head: 'abc123' },
    }, { PushEvent: 'PUSH' }, true);

    assert.equal(result.repo, 'a private repository');
    assert.equal(result.repo_url, '');
    assert.equal(result.ref, '');
    assert.equal(result.url, '');
});
