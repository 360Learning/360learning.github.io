String.prototype.cleanup = function() {
    return this.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-");
};

async function includeBasics() {
    const allCardsOnCuPaths = await fetchCardsOnBoard(getHrCuPathsBoardId(), { trelloApiKey: getTrelloApiKey(), trelloOAuth1: getTrelloOAuth1() });
    console.log(allCardsOnCuPaths.length);
}
function organizeLearningPath() {
    document.getElementById("message").innerText = "Not yet available, please be patient :)";
}

function getHrCuPathsBoardId() {
    const hrCuPathsBoard = getHrCuPathsBoard();
    if (! hrCuPathsBoard) { return ""; }

    const boardIdRegex = /https:\/\/trello\.com\/b\/([^\/]+)\/.*/;
    const boardIdRegexMatches = boardIdRegex.exec(hrCuPathsBoard);
    if (! boardIdRegexMatches) { return ""; }

    return boardIdRegexMatches[1];
}
function getTrelloApiKey() {
    return document.getElementById("trelloApiKey").value;
}
function getTrelloOAuth1() {
    return document.getElementById("trelloOAuth1").value;
}
function getHrCuPathsBoard() {
    return document.getElementById("hrCuPathsBoard").value;
}

var app = new Vue({
    el: '#app',
    data: {
        trelloApiKey: "",
        trelloOAuth1: "",
        hrCuPathsBoard: "https://trello.com/b/uKPiQQ7R/hr-cu-paths",
        learningPathCard: ""
    },
    computed: {
        isValid() {
            return !! this.trelloApiKey && !! this.trelloOAuth1 && !! this.hrCuPathsBoard && !! this.learningPathCard;
        }
    }
});
