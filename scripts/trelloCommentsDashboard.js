const TRELLO_BASE_URL = "https://trello.com";
const TRELLO_CREDENTIALS_HELPER_FILE = "https://docs.google.com/document/d/1HwaedNa861gkj93TaradW5n0MID8cbeamiU5SXCvX64/edit#heading=h.ijjo2dol5z6v"

new Vue({
    el: '#app',
    data: {
        comments: null,
        error: null,
        sort: { field: "date", ascending: false },
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
                this.sortComments();
            } catch (error) {
                this.error = error.message;
            }
        },
        sortComments() {
            const field = this.sort.field;
            const ascendingFactor = this.sort.ascending ? 1 : -1;
            this.comments.sort((comment1, comment2) => {
                return comment1[field].localeCompare(comment2[field]) * ascendingFactor;
            });
        },
        updateSort(sort) {
            this.sort = sort;
            this.sortComments();
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
            text: buildCommentText(comment.data.text),
            link: buildLinkToComment(comment)
        };
    }
}

function buildCommentText(markdown) {
    return markdownit().render(markdown);
}
function buildLinkToComment(comment) {
    return `${TRELLO_BASE_URL}/c/${comment.data.card.shortLink}#action-${comment.id}`;
}
