import purifyHtml from '@datawrapper/shared/purifyHtml.js';
import templateParser from './templateParser.mjs';

const ALLOWED_TAGS =
    '<a><abbr><address><b><big><blockquote><br/><br><caption><cite><code><col><colgroup><dd><del><details><dfn><div><dl><dt><em><figure><font><h1><h2><h3><h4><h5><h6><hr><hgroup><i><img><ins><kbd><li><mark><meter><ol><p><pre><q><s><small><span><strike><strong><sub><summary><sup><table><tbody><td><th><thead><tfoot><tr><tt><u><ul><wbr>';
/*
 * returns a function that evaluates template strings
 * using `expr-eval`.
 */
export default function htmlTemplate(template) {
    const evaluateTemplate = templateParser(template);
    return context => purifyHtml(evaluateTemplate(context), ALLOWED_TAGS);
}
