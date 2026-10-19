import test from 'node:test';
import assert from 'node:assert/strict';
import { renderActivityFromClient } from '../../src/utils/eventPipeline.js';

const fixtures = [
    { type: 'PullRequestEvent', public: true, repo: { name: 'demo/app' }, created_at: '2026-10-13T00:00:00Z', payload: { action: 'closed', pull_request: { merged: true, number: 7 } } },
    { type: 'PushEvent', public: false, repo: { name: 'demo/private' }, created_at: '2026-10-12T00:00:00Z', payload: { ref: 'refs/heads/main', head: 'abc' } },
];

test('integration: fake Octokit event retrieval, filtering, privacy, and rendering', async () => {
    const calls = [];
    const fakeClient = { rest: { activity: { listEventsForAuthenticatedUser: async (params) => {
        calls.push(params);
        return { data: fixtures };
    } } } };
    const result = await renderActivityFromClient(fakeClient, {
        username: 'fanyuzhenfu',
        eventEmojiMap: { PullRequestEvent: '🔀', PushEvent: '🚀' },
        template: '{emoji} {action} {subject} {number} [{repo}]({url})',
        hideDetailsOnPrivateRepos: true,
    });
    assert.deepEqual(calls, [{ username: 'fanyuzhenfu', per_page: 10, page: 1 }]);
    assert.match(result, /🔀 Merged PR #7/);
    assert.match(result, /🚀 Committed/);
    assert.match(result, /a private repository/);
    assert.doesNotMatch(result, /demo\/private/);
});
