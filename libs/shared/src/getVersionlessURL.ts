export default function getVersionlessURL(publicURL: string) {
    return publicURL.replace(/^(.+\/)([\w-]+)\/\d+(\/.*)?$/, '$1$2$3');
}
