'use strict';

const AUTH_GUARDS = [
    'authPublic',
    'authGuest',
    'authUser',
    'authDatawrapperStaff',
    'authFeaturePreview',
    'authAdmin'
];

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'ensure all load functions and request handlers are wrapped in an auth guard'
        },
        schema: [],
        fixable: null
    },
    create: function (context) {
        const filename = context.getFilename();

        // Check if the filename starts with `+page.server`, `+layout.server`, or `+server` and ends with `.ts` or `.js`
        const fileRegex = /\/\+(page\.|layout\.)?server\.(ts|js)$/;
        const isServerFile = fileRegex.test(filename);

        if (!isServerFile) {
            return {};
        }

        return {
            ExportNamedDeclaration(node) {
                let { declarations } = node.declaration;
                declarations = declarations || [node.declaration];

                if (!declarations) {
                    return;
                }

                const reportError = () =>
                    context.report({
                        node,
                        message: `All load functions and request handlers have to be wrapped by an auth guard (${AUTH_GUARDS.map(
                            x => `\`${x}\``
                        ).join(', ')})`
                    });

                const requestHandlerDeclarations = declarations.filter(declaration =>
                    ['load', 'GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(declaration.id.name)
                );
                if (!requestHandlerDeclarations.length) return;

                for (const declaration of requestHandlerDeclarations) {
                    // Handle request handlers using the `function` keyword.
                    // E.g. `export function load(...)`
                    if (declaration.type === 'FunctionDeclaration') {
                        reportError();
                        return;
                    }
                    const expression = declaration.init.expression;
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
            }
        };
    }
};
