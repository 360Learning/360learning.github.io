async function fetchCardsInList(listId, { trelloApiKey, trelloOAuth1 } = {}) {
    return new TrelloClient({ trelloApiKey, trelloOAuth1 }).get(`lists/${listId}/cards`);
}

async function fetchList(listId, { trelloApiKey, trelloOAuth1 } = {}) {
    return new TrelloClient({ trelloApiKey, trelloOAuth1 }).get(`lists/${listId}`);
}
