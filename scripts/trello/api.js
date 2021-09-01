class TrelloClient {
    constructor({ trelloApiKey, trelloOAuth1 }) {
        this.trelloApiKey = trelloApiKey;
        this.trelloOAuth1 = trelloOAuth1;
    }
    async get(relativeUrl, params = {}) {
        const res = await axios.get(buildUrlWithParams(this.trelloApiKey, this.trelloOAuth1, relativeUrl, params));
        return res.data;
    }

    async post(relativeUrl, params = {}) {
        const res = await axios.post(buildUrlWithParams(this.trelloApiKey, this.trelloOAuth1, relativeUrl, params));
        return res.data;
    }

    async put(relativeUrl, params = {}) {
        const res = await axios.put(buildUrlWithParams(this.trelloApiKey, this.trelloOAuth1, relativeUrl, params));
        return res.data;
    }
}

function buildUrlWithParams(trelloApiKey, trelloOAuth1, relativeUrl, params) {
    const rawUrl = `https://api.trello.com/1/${relativeUrl}`;
    return `${rawUrl}?${computeEncodedUrlParams({ ...params, key: trelloApiKey, token: trelloOAuth1 })}`;
}

function computeEncodedUrlParams(urlParams) {
    const encodedParams = Object.keys(urlParams).map(key => `${key}=${encodeURI(urlParams[key])}`);
    return encodedParams.join("&");
}
