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
        "eqeqeq": ["error", "smart"],
        "no-multiple-empty-lines": ["error", { "max": 1 }],
        "no-console": ["error", { "allow": ["warn", "error"] }],
        "camelcase": ["warn",{"ignoreDestructuring": true}],
        "no-console": ["error",{"allow": ["warn","error"]}],
        "prettier/prettier": "error",
    },
    "plugins": [
        "html",
        "@tivac/svelte",
        "prettier",
    ],
};
