async function postComment(cardId, text, { trelloApiKey, trelloOAuth1 } = {}) {
    return new TrelloClient({ trelloApiKey, trelloOAuth1 }).post(`cards/${cardId}/actions/comments`, { text });
}
