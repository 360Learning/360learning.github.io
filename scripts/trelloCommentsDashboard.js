const TRELLO_CREDENTIALS_HELPER_FILE = "https://docs.google.com/document/d/1HwaedNa861gkj93TaradW5n0MID8cbeamiU5SXCvX64/edit#heading=h.ijjo2dol5z6v"

new Vue({
    el: '#app',
    data: {
        comments: null,
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
            this.comments = [];
        }
    }
});
