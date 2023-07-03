'use strict';

const AUTH_GUARDS = ['authPublic', 'authGuest', 'authUser', 'authAdmin'];

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'ensure all load functions are wrapped in an auth guard'
        },
        schema: [],
        fixable: null
    },
    create: function (context) {
        const filename = context.getFilename();

        // Check if the filename starts with `+page` or `+layout` and ends with `.ts`
        const fileRegex = /\/\+(page|layout).*\.ts$/;
        const isPageOrLayout = fileRegex.test(filename);

        if (!isPageOrLayout) {
            return {};
        }

        return {
            ExportNamedDeclaration(node) {
                const { declarations } = node.declaration;
                if (!declarations) {
                    return;
                }

                const loadFunctionDeclaration = declarations.find(
                    declaration => declaration.id.name === 'load'
                );
                if (!loadFunctionDeclaration) return;

                const expression = loadFunctionDeclaration.init.expression;

                const reportError = () =>
                    context.report({
                        node,
                        message: `All load functions have to be wrapped by an auth guard (${AUTH_GUARDS.map(
                            x => `\`${x}\``
                        ).join(', ')})`
                    });

                if (!expression || expression.type !== 'CallExpression') {
                    reportError();
                    return;
                }

                // Handle normal auth guards.
                // E.g. `export const load = authPublic(...)`
                if (AUTH_GUARDS.includes(expression.callee.name)) return;

                // Handle conditional auth guards.
                // E.g. `export const load = (dev ? authPublic : authAdmin)(...)`
                // See routes/(app)/hello/+page.server.ts
                if (expression.callee.type === 'ConditionalExpression') {
                    const possibleIdentifiers = [
                        expression.callee.consequent,
                        expression.callee.alternate
                    ].map(({ name }) => name);

                    // Make sure both possible identifiers are auth guards.
                    if (possibleIdentifiers.every(name => AUTH_GUARDS.includes(name))) return;
                }

                reportError();
            }
        };
    }
};
