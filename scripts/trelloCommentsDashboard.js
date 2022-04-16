const TRELLO_BASE_URL = "https://trello.com";
const TRELLO_CREDENTIALS_HELPER_FILE = "https://docs.google.com/document/d/1HwaedNa861gkj93TaradW5n0MID8cbeamiU5SXCvX64/edit#heading=h.ijjo2dol5z6v"

new Vue({
    el: '#app',
    data: {
        comments: null,
        error: null,
        trelloCredentialsHelperFile: TRELLO_CREDENTIALS_HELPER_FILE,
        credentials: {
            trelloApiKey: "",
            trelloOAuth1: ""
        },
        username: ""
    },
    computed: {
        isValid() {
            return !! this.credentials.trelloApiKey && !! this.credentials.trelloOAuth1 && !! this.username;
        }
    },
    methods: {
        async fetchComments() {
            this.comments = null;
            this.error = null;
            try {
                const comments = await fetchUserComments(this.username, {}, this.credentials);
                this.comments = parseComments(comments);
            } catch (error) {
                this.error = error.message;
            }
        }
    }
});

function parseComments(comments) {
    return comments
        .map(parseComment);

    function parseComment(comment) {
        return {
            board: comment.data.board.name,
            card: comment.data.card.name,
            date: comment.date.slice(0, 10),
            text: comment.data.text,
            link: buildLinkToComment(comment)
        };
    }
}

function buildLinkToComment(comment) {
    return `${TRELLO_BASE_URL}/c/${comment.data.card.shortLink}#action-${comment.id}`;
}
