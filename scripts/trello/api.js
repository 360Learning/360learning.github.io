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
    const rawUrl = `https://api.trello.com/1/${relativeUrl}`;
    return `${rawUrl}?${computeEncodedUrlParams({ ...params, key: trelloApiKey, token: trelloOAuth1 })}`;
}

function computeEncodedUrlParams(urlParams) {
    const encodedParams = Object.keys(urlParams).map(key => `${key}=${encodeURI(urlParams[key])}`);
    return encodedParams.join("&");
}
