const TRELLO_CREDENTIALS_HELPER_FILE = "https://docs.google.com/document/d/1HwaedNa861gkj93TaradW5n0MID8cbeamiU5SXCvX64/edit#heading=h.ijjo2dol5z6v"

const LIST_IDS = [
    "65e07588569c27c0664edf17", // https://trello.com/c/rWgYEIaP
    "65d8c6c2bdf8fb6ece5c3288", // https://trello.com/c/FJrnjzoC
    "65eb3c3f18360ab17df520fd", // https://trello.com/c/l4Qqa3lh
    "65f86bf9394966aa2a03379f"  // https://trello.com/c/jym1mHmg
]

new Vue({
    el: '#app',
    data: {
        options: {
            quarter: "",
            squad: ""
        },
        error: null,
        loading: false,
        trelloCredentialsHelperFile: TRELLO_CREDENTIALS_HELPER_FILE,
        credentials: {
            trelloApiKey: "",
            trelloOAuth1: ""
        },
        urgencyCardsBySquadName: {},
        squadNames: null,
        listIdBySquadName: {},
        reportBuilt: false,
        reportBuildForAllSquads: false
    },
    computed: {
        areCredentialsFilled() {
            return !! this.credentials.trelloApiKey && !! this.credentials.trelloOAuth1;
        },
        isAccessButtonDisabled() {
            return ! this.areCredentialsFilled || this.loading;
        },
        isSubmitButtonDisabled() {
            return ! this.areCredentialsFilled || this.loading || ! this.options.squad || ! this.options.quarter;
        },
        quarters() {
            const currentQuarter = moment().quarter();
            return [-3, -2, -1, 0].map(quarterOffset => moment().quarter(currentQuarter + quarterOffset).format("[Q]Q YYYY"));
        }
    },
    methods: {
        async buildReport() {
            this.resetReport();
            this.error = null;
            this.loading = true;
            const selectedSquadNames = this.getSelectedSquadNames();
            try {
                for (const selectedSquadName of selectedSquadNames) {
                    await this.buildReportForSquad(selectedSquadName);
                }
                this.reportBuilt = true;
                this.reportBuildForAllSquads = (this.options.squad === "*");
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async buildReportForSquad(squadName) {
            const listId = this.listIdBySquadName[squadName];
            const cards = await fetchCardsInList(listId, this.credentials);
            const filteredCards = cards.filter(card => ! card.isTemplate && card.labels.map(label => label.name.replace("-", " ")).includes(this.options.quarter));
            this.urgencyCardsBySquadName[squadName] = filteredCards.map(({name, url}) => ({ name, url }));
        },
        async fetchSquadNames() {
            this.error = null;
            this.loading = true;
            try {
                this.squadNames = (await Promise.all(LIST_IDS.map(this.getSquadNameFromListId))).sort();
            }
            catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        getSelectedSquadNames() {
            return this.options.squad === "*" ? this.squadNames : [this.options.squad];
        },
        async getSquadNameFromListId(listId) {
            const list = await fetchList(listId, this.credentials);
            const squadName = list.name.match(/[^[]+(?=\])/g).pop();
            this.listIdBySquadName[squadName] = listId;
            return squadName;
        },
        resetReport() {
            this.reportBuilt = false;
            this.reportBuildForAllSquads = false;
            this.urgencyCardsBySquadName = {};
        }
    }
});
