import { extractEventData, applyTemplate } from './templateEngine.js';

/**
 * 以可注入的 client 處理事件，讓 integration test 不需要呼叫 GitHub API。
 * Production code 的預設 Octokit 流程不會被這個教學用 adapter 改變。
 */
export async function renderActivityFromClient(client, {
    username,
    eventEmojiMap = {},
    template,
    hideDetailsOnPrivateRepos = false,
    limit = 10,
    ignoredEvents = [],
} = {}) {
    const response = await client.rest.activity.listEventsForAuthenticatedUser({
        username,
        per_page: limit,
        page: 1,
    });
    const events = (response.data || [])
        .filter((event) => !ignoredEvents.includes(event.type))
        .slice(0, limit);

    return events.map((event) => {
        const data = extractEventData(event, eventEmojiMap, hideDetailsOnPrivateRepos);
        return applyTemplate(template, data);
    }).join('\n');
}
