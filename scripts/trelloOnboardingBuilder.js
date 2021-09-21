String.prototype.cleanup = function() {
    return this.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-");
};

const includeCommand = "/targetfor";
const basicsCardsSuffix = "basics";

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
            const reorganizedCardsCount = await reorganizeCards(initialTimelineCardPosition, this.trelloApiKey, this.trelloOAuth1);
            this.message = `Reorganized ${reorganizedCardsCount} cards in the Learning Path!`;

            function computeInitialTimelineCardPositions() {
                const timelineCardPosition = {};
                allCardsInLearningPath
                    .filter(card => Object.keys(timelineInformationMapping).includes(card.name))
                    .forEach(card => timelineCardPosition[timelineInformationMapping[card.name]] = card.pos);
                return timelineCardPosition;
            }
            async function reorganizeCards(timelineCardPosition, trelloApiKey, trelloOAuth1) {
                const cardsToReorganizeWithTimelineInformation = computeCardsThatCanBeReorganized();
                for (const cardWithTimelineInformation of cardsToReorganizeWithTimelineInformation) {
                    const expectedCardPositionInList = timelineCardPosition[cardWithTimelineInformation.timelineInformationIndex] + 1;
                    incrementPositionsForTimelineInformationAfter(cardWithTimelineInformation.timelineInformationIndex, timelineCardPosition);
                    const nameWithoutTimelineInformation = removeTimelineInformation(cardWithTimelineInformation.name);
                    await updateCard(
                        cardWithTimelineInformation.id,
                        { name: nameWithoutTimelineInformation, pos: expectedCardPositionInList },
                        { trelloApiKey, trelloOAuth1 }
                    );
                }
                return cardsToReorganizeWithTimelineInformation.length;

                function computeCardsThatCanBeReorganized() {
                    return allCardsInLearningPath
                        .filter(card => canMoveCardInSpecificTimeline(card.name))
                        .map(card => {
                            const timelineInformation = getTimelineInformation(card.name);
                            let timelineInformationIndex = timelineInformationMapping[timelineInformation];
                            return { ...card, timelineInformationIndex };
                        })
                        .filter(({ timelineInformationIndex }) => Object.keys(timelineCardPosition).includes(`${timelineInformationIndex}`))
                }
            }
            function canMoveCardInSpecificTimeline(name) {
                return hasDayInformation() || hasWeekInformation() || hasMonthInformation();

                function hasDayInformation() {
                    return /.+\[DAY \d]/i.test(name);
                }
                function hasWeekInformation() {
                    return /.+\[WEEK \d]/i.test(name);
                }
                function hasMonthInformation() {
                    return /.+\[MONTH \d]/i.test(name);
                }
            }
            function getTimelineInformation(name) {
                const timelineInformationRegex = /.+\[((DAY|WEEK|MONTH) \d)]/i;
                return timelineInformationRegex.exec(name)[1].toUpperCase();
            }
            function incrementPositionsForTimelineInformationAfter(timelineInformationIndex, timelineCardPosition) {
                for(const index of Object.keys(timelineCardPosition)) {
                    if (timelineInformationIndex > index) { continue; }

                    timelineCardPosition[index]++;
                }
            }
            function removeTimelineInformation(name) {
                const timelineInformationRegex = /(.+)\[(DAY|WEEK|MONTH) \d]/i;
                return timelineInformationRegex.exec(name)[1].trim();
            }
        }
    }
});
