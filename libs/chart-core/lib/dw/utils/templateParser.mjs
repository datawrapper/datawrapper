import { Parser } from './parser.mjs';

const TPL_REG = /\{\{(.+?)\}\}/g;
/*
 * returns a function that evaluates template strings
 * using `expr-eval`.
 */
export default function templateParser(template) {
    const expressions = {};
    const parser = new Parser();
    template.replace(TPL_REG, (s, formula) => {
        formula = formula.trim();
        if (formula && !expressions[formula]) {
            expressions[formula] = parser.parse(formula);
        }
    });
    return context =>
        template.replace(TPL_REG, (s, formula) => {
            const result = formula.trim() ? expressions[formula.trim()].evaluate(context) : '';
            return result === null ? '' : result;
        });
}
