String.prototype.cleanup = function() {
    return this.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-");
};

const includeCommand = "/targetfor";
//const basicsCardsSuffix = "basics";
const basicsCardsSuffix = "my toto test";

var app = new Vue({
    el: '#app',
    data: {
        trelloApiKey: "",
        trelloOAuth1: "",
        hrCuPathsBoard: "https://trello.com/b/uKPiQQ7R/hr-cu-paths",
        learningPathCard: "",
        message: ""
    },
    computed: {
        isValid() {
            return !! this.trelloApiKey && !! this.trelloOAuth1 && !! this.hrCuPathsBoard && !! this.learningPathCard;
        },
        hrCuPathsBoardId() {
            if (! this.hrCuPathsBoard) { return ""; }

            const boardIdRegex = /https:\/\/trello\.com\/b\/([^\/]+)\/.*/;
            const boardIdRegexMatches = boardIdRegex.exec(this.hrCuPathsBoard);
            if (! boardIdRegexMatches) { return ""; }

            return boardIdRegexMatches[1];
        },
    },
    methods: {
        async includeBasics() {
            this.message = "Including basics cards...";
            const allCardsOnCuPaths = await fetchCardsOnBoard(this.hrCuPathsBoardId, { trelloApiKey: this.trelloApiKey, trelloOAuth1: this.trelloOAuth1 });
            const allBasicsCardIds = allCardsOnCuPaths
                .filter(({ name }) => name.trim().toLowerCase().endsWith(basicsCardsSuffix))
                .map(({ shortLink }) => shortLink);
            const commentText = `${includeCommand} ${this.learningPathCard}`;
            for (const cardId of allBasicsCardIds) {
                await postComment(cardId, commentText, { trelloApiKey: this.trelloApiKey, trelloOAuth1: this.trelloOAuth1 })
            }
            this.message = `Including ${allBasicsCardIds.length} basics cards with success!`;
        },
        organizeLearningPath() {
            this.message = "Not yet available, please be patient :)";
        }
    }
});
