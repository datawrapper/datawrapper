import test from 'ava';
import purifySvg from './purifySvg.js';

test('purifySvg removes scripts and html tags', t => {
    t.is(
        purifySvg(`
<g>
  <path />
  <circle r="5" />
  <script>alert("foo")</script>
  <strong>html tag</strong>
</g>`),
        `
<g>
  <path></path>
  <circle r="5"></circle>
  alert("foo")
  html tag
</g>`
    );
});
