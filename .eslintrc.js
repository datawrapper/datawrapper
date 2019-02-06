module.exports = {
    "env": {
        "browser": true,
        "commonjs": true
    },
    "parser": "babel-eslint",
    "extends": [
        "standard",
        "plugin:@tivac/svelte/svelte",
        "plugin:prettier/recommended",
    ],
    "globals": {
        "Reflect": true,
    },
    "rules": {
        "no-sequences": "error",
        "no-console": ["error", { "allow": ["warn", "error"] }],
        "camelcase": ["warn", {"ignoreDestructuring": true}],
        "prettier/prettier": "error",
    },
    "plugins": [
        "html",
        "@tivac/svelte",
        "prettier",
    ],
};
