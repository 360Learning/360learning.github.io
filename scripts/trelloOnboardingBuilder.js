String.prototype.cleanup = function() {
    return this.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-");
};

const includeCommand = "/targetfor";
//const basicsCardsSuffix = "basics";
const basicsCardsSuffix = "my toto test";

const timelineInformationMapping = {
    "DAY 1": 0,
    "DAY 2": 1,
    "DAY 3": 2,
    "DAY 4": 3,
    "DAY 5": 4,
    "WEEK 1": 5,
    "WEEK 2": 6,
    "WEEK 3": 7,
    "WEEK 4": 8,
    "WEEK 5": 9,
    "MONTH 1": 10,
    "MONTH 2": 11,
    "MONTH 3": 12,
    "MONTH 4": 13
};

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
        learningPathCardId() {
            if (! this.learningPathCard) { return ""; }

            const cardIdRegex = /https:\/\/trello\.com\/c\/([^\/]+)\/.*/;
            const cardIdRegexMatches = cardIdRegex.exec(this.learningPathCard);
            if (! cardIdRegexMatches) { return ""; }

            return cardIdRegexMatches[1];
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
        async organizeLearningPath() {
            this.message = "Reorganizing Learning Path...";
            const { idList: learningPathListId } = await getCard(this.learningPathCardId, { trelloApiKey: this.trelloApiKey, trelloOAuth1: this.trelloOAuth1 });
            const allCardsInLearningPath = await fetchCardsInList(learningPathListId, { trelloApiKey: this.trelloApiKey, trelloOAuth1: this.trelloOAuth1 });
            const initialTimelineCardPosition = computeInitialTimelineCardPositions();

            function computeInitialTimelineCardPositions() {
                const timelineCardPosition = {};
                for (const card of allCardsInLearningPath) {
                    if (! Object.keys(timelineInformationMapping).includes(card.name)) { continue; }

                    timelineCardPosition[timelineInformationMapping[card.name]] = card.pos;
                }
                return timelineCardPosition;
            }
        }
    }
});
