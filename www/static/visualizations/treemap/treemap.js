
(function(){
    // Simple Treemap
    // --------------

    var Treemap = Datawrapper.Visualizations.Treemap = function() {

    };

    _.extend(Treemap.prototype, Datawrapper.Visualizations.RaphaelChart.prototype, {

        render: function(el) {

            el = $(el);
            this.setRoot(el);
            var me = this,
                row = 0;

            var filterUI = me.getFilterUI(row);
            if (filterUI) $('#header').append(filterUI);

            var c = me.initCanvas();

            function parseTree(dataset, row) {
                var tree = { children: [] };
                dataset.eachSeries(function(s) {
                    var parts = s.name.split('>');
                    var node = tree;
                    _.each(parts, function(p, i) {
                        parts[i] = p = p.trim();
                        var found = false;
                        _.each(tree.children, function(c) {
                            if (c.name.trim() == p) {
                                node = c;
                                found = true;
                                return false;
                            }
                        });
                        if (!found) { // child not found, create new one
                            var n = { name: p, children: [], color: me.getSeriesColor(s, row) };
                            if (i == parts.length-1) n.value = s.data[row];
                            node.children.push(n);
                            node = n;
                        }
                    });
                });
                return tree;
            }

            var tree = parseTree(me.dataset, 0),
                treemap = d3_treemap.layout.treemap();

            c.lpad += 1;
            c.rpad = 2;
            c.bpad = 2;

            var area = c.w * c.h;

            treemap.size([c.w - c.lpad - c.rpad, c.h - c.tpad - c.bpad]).padding(1);

            console.log(c);

            treemap(tree);

            function renderNode(node, level) {
                if (node.children.length === 0) {
                    c.paper.rect().attr({
                        x: c.lpad + node.x,
                        y: c.tpad + node.y,
                        width: node.dx,
                        height: node.dy,
                        fill: node.color,
                        stroke: me.theme.colors.background,
                        r: 0
                    });
                }
                if (node.name) {
                    var tx = c.lpad + node.x + node.dx * 0.5,
                        ty = c.tpad + node.y + node.dy* 0.5;
                    c.paper.text(tx, ty, node.name).attr({
                        'font-size': Math.sqrt((node.dy * node.dx) / area) * Math.sqrt(area)/8,
                        fill: me.invertLabel(node.color) ? '#fff' : '#000'
                    });
                }
                _.each(node.children, function(n) {
                    renderNode(n, level+1);
                });
            }
            renderNode(tree, 0);
        }

    });

    

}).call(this);
