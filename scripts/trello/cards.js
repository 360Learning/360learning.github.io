async function postComment(cardId, text, { trelloApiKey, trelloOAuth1 } = {}) {
    return post(
        `cards/${cardId}/actions/comments`,
        { text },
        { trelloApiKey, trelloOAuth1 }
    );
}
