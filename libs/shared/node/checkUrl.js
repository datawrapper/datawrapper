function checkUrl(url) {
    if (typeof url !== 'string' || url.indexOf('://unix:') > -1 || url.indexOf('unix:') === 0) {
        return false;
    }

    return true;
}

module.exports = checkUrl;
