import test from 'ava';
import purifySvg from './purifySvg';

test('purifySvg removes scripts and html tags including their content', t => {
    t.is(
        purifySvg(`
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<g>
  <path />
  <circle r="5" />
  <script>alert("foo")</script>
  <strong>html tag</strong>
</g>
</svg>
<strong>more html</strong>`),
        `
<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">
<g>
  <path></path>
  <circle r="5"></circle>
  \n  </g></svg>


`
    );
});

test('purifySvg returns an empty string when the SVG element is missing', t => {
    t.is(purifySvg('<path />'), '');
});
