module.exports = {
    "env": {
        "browser": true,
        "commonjs": true
    },
    "parser": "babel-eslint",
    "extends": "eslint:recommended",
    "globals": {
        "Reflect": true
    },
    "rules": {
    	"no-sequences": "error",
        "eqeqeq": ["error", "smart"],
        "no-multiple-empty-lines": ["error", { "max": 1 }],
        "no-console": ["error", { allow: ["warn", "error"] }]
    }
};
