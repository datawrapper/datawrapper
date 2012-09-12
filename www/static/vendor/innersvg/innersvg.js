Object.defineProperty(SVGElement.prototype, 'innerSVG', {
  get: function() {
    var $node, $temp;
    $temp = document.createElement('div');
    $node = this.cloneNode(true);
    $temp.appendChild($node);
    return $temp.innerHTML;
  },
  set: function(markup) {
    var $element, $temp, _i, _len, _ref, _results;
    $temp = document.createElement('div');
    $temp.innerHTML = markup;
    while (this.firstChild) {
      this.firstChild.parentNode.removeChild(this.firstChild);
    }
    _ref = $temp.children;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      $element = _ref[_i];
      _results.push(this.appendChild($element));
    }
    return _results;
  },
  enumerable: false,
  configurable: true
});