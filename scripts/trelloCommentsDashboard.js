const TRELLO_BASE_URL = "https://trello.com";
const TRELLO_CREDENTIALS_HELPER_FILE = "https://docs.google.com/document/d/1HwaedNa861gkj93TaradW5n0MID8cbeamiU5SXCvX64/edit#heading=h.ijjo2dol5z6v"
const GOOGLE_SHEETS_EXPORT_TEMPLATE = "https://docs.google.com/spreadsheets/d/1gAbqE94JWzFgeq6Q7DwCjlTb7NQtsIEzCtOS8pyFBBA/edit#gid=0"
const SCOPES_BOARD_NAME = "2. Scopes";
const HR_CU_PATHS_BOARD_NAME = "HR: CU Paths";
const ZCONVEXITY_BOARDS_PREFIX = "zConvexity";

new Vue({
    el: '#app',
    data: {
        comments: null,
        options: {
            before: undefined,
            since: undefined,
            limit: 1000,
            excludedBoards: {
                scopes: true,
                HRCUPaths: true,
                zConvexity: true
            },
            truncationLength: 5
        },
        error: null,
        loading: false,
        search: "",
        sort: { field: "date", ascending: false },
        trelloCredentialsHelperFile: TRELLO_CREDENTIALS_HELPER_FILE,
        googleSheetsExportTemplate: GOOGLE_SHEETS_EXPORT_TEMPLATE,
        credentials: {
            trelloApiKey: "",
            trelloOAuth1: ""
        },
        username: ""
    },
    computed: {
        filteredComments() {
            const search = this.search.toLowerCase();

            return this.comments.filter(comment => {
                return (
                    comment.board.toLowerCase().includes(search) ||
                    comment.card.toLowerCase().includes(search) ||
                    comment.originalText.toLowerCase().includes(search)
                );
            });
        },
        isSubmitButtonDisabled() {
            return ! this.isValid || this.loading;
        },
        isValid() {
            return !! this.credentials.trelloApiKey && !! this.credentials.trelloOAuth1 && !! this.username;
        }
    },
    methods: {
        buildCsv() {
            const header = [
                "Date",
                "Board",
                "Card",
                "Comment"
            ];
            const rows = this.filteredComments.map((comment) => ([
                comment.date,
                escape(comment.board),
                `=HYPERLINK("${comment.link}";${escape(comment.card)})`,
                escape(comment.originalText)
            ]));
            return [header, ...rows].map(row => row.join("\t")).join("\n");

            function escape(value) {
                return `"${value.replaceAll('"', '""')}"`;
            }
        },
        buildOptions() {
            return {
                limit: Math.min(this.options.limit ?? 1000, 1000),
                ...(this.options.since ? { since: this.options.since } : {}),
                ...(this.options.before ? { before: this.options.before } : {})
            }
        },
        async copyCsvToClipboard() {
            const csv = this.buildCsv();
            await navigator.clipboard.writeText(csv);
        },
        downloadCsvFile() {
            const csv = this.buildCsv();

            const dummyElement = document.createElement("a");
            const exportDate = moment().format("YYYY-MM-DD");
            dummyElement.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
            dummyElement.setAttribute("download", `Trello comments export ${this.username} ${exportDate}.csv`);
            dummyElement.style.display = "none";

            document.body.appendChild(dummyElement);
            dummyElement.click();
            document.body.removeChild(dummyElement);
        },
        async fetchComments() {
            this.comments = null;
            this.error = null;
            this.loading = true;
            try {
                const comments = await fetchUserComments(this.username, this.buildOptions(), this.credentials);
                this.comments = parseComments(comments, this.options);
                this.sortComments();
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
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

function parseComments(comments, options) {
    return comments
        .filter(ignoreExcludedBoards)
        .map(parseComment);

    function ignoreExcludedBoards(comment) {
        const boardName = comment.data.board.name;
        if (options.excludedBoards.scopes && boardName === SCOPES_BOARD_NAME) { return false; }
        if (options.excludedBoards.HRCUPaths && boardName === HR_CU_PATHS_BOARD_NAME) { return false; }
        if (options.excludedBoards.zConvexity && boardName.startsWith(ZCONVEXITY_BOARDS_PREFIX)) { return false; }
        return true;
    }
    function parseComment(comment) {
        return {
            board: comment.data.board.name,
            card: comment.data.card.name,
            date: comment.date.slice(0, 10),
            originalText: comment.data.text,
            text: buildCommentText(comment.data.text, options.truncationLength),
            link: buildLinkToComment(comment)
        };
    }
}

function buildCommentText(markdown, truncationLength) {
    return markdownit().render(buildTruncatedText());

    function buildTruncatedText() {
        if (! truncationLength) { return markdown; }
        const lines = markdown.split("\n");
        if (lines.length <= truncationLength) { return markdown; }
        return markdown.split("\n").slice(0, truncationLength).join("\n") + "\n\n[...]";
    }
}
function buildLinkToComment(comment) {
    return `${TRELLO_BASE_URL}/c/${comment.data.card.shortLink}#action-${comment.id}`;
}
