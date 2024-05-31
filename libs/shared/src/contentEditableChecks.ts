export const isContentEditablePlaintextOnlySupported = () => {
    const span = document.createElement('span');
    span.setAttribute('contenteditable', 'plaintext-only');
    const supported = span.contentEditable === 'plaintext-only';
    span.remove();
    return supported;
};

export const plainTextOnlyIfSupported = () => {
    return isContentEditablePlaintextOnlySupported() ? 'plaintext-only' : 'true';
};
