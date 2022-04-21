async function fetchUserComments(memberId, options, credentials) {
    const client = new TrelloClient(credentials);
    return client.get(`members/${memberId}/actions`, {
        filter: "commentCard",
        member: false,
        memberCreator: false,
        ...options
    });
}
