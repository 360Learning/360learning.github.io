async function get(relativeUrl, params, { trelloApiKey, trelloOAuth1 } = {}) {
    const res = await axios.get(buildUrlWithParams(trelloApiKey, trelloOAuth1, relativeUrl, params));
    return res.data;
}

async function post(relativeUrl, params, { trelloApiKey, trelloOAuth1 } = {}) {
    const res = await axios.post(buildUrlWithParams(trelloApiKey, trelloOAuth1, relativeUrl, params));
    return res.data;
}

async function put(relativeUrl, params, { trelloApiKey, trelloOAuth1 } = {}) {
    const res = await axios.put(buildUrlWithParams(trelloApiKey, trelloOAuth1, relativeUrl, params));
    return res.data;
}

function buildUrlWithParams(trelloApiKey, trelloOAuth1, relativeUrl, params) {
    const rawUrl = `https://api.trello.com/1/${relativeUrl}?key=${trelloApiKey}&token=${trelloOAuth1}`;
    return params ? `${rawUrl}&${encodeURI(params)}` : rawUrl;
}
