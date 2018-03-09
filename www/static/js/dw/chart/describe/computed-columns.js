/* global _,dw,define */
define(['jquery', 'd3'], function($, d3) {

    $(function() {
        // initModal();
        $('.computed-columns').click(initModal);

        var firstRun = true,
            active = null,
            columns = {},
            cm = null,
            chart = dw.backend.currentChart;

        var modal = $('#computed-columns'),
            code = $('.code', modal),
            colname = $('.col-name', modal),
            colNameGrp = d3.select(colname.parent().get(0)),
            colNameError = d3.select(modal.get(0)).select('.col-name-error'),
            val_preview = $('.value-preview', modal),
            nav = $('ul.nav', modal),
            emptyNote = d3.select($('.empty-note', modal)[0]),
            hint = $('.hint', modal),
            btnAdd = $('.btn-add-new', modal),
            btnRemove = $('.btn-remove', modal),
            btnClose = $('.btn-close', modal);

        function initModal() {
            modal.modal();

            if (firstRun) {
                initEditor();
            } else {
                initNav();
            }

            function onNameChange() {
                var new_name = colname.val();
                colNameError.classed('hide', true);
                colNameGrp.classed('error', false);

                if (new_name == active) return;

                if (columnNameExists(new_name)) {
                    colNameError.classed('hide', false);
                    colNameGrp.classed('error', true);
                    return;
                }
                columns[new_name] = columns[active];

                delete columns[active];
                active = new_name;
                chart.set('metadata.describe.computed-columns', columns);
                chart.save();
                initNav();
            }


            function initNav() {
                columns = dw.utils.clone(chart.get('metadata.describe.computed-columns', {}));
                if (_.isArray(columns)) columns = {};

                var keys = d3.keys(columns).filter(function(d) { return d; });

                if (!active && keys.length > 0) activate(keys[0]);
                if (!keys.length) {
                    btnRemove.addClass('hide');
                    hint.addClass('hide');
                    colname.attr('disabled', true);
                    cm.setOption('readOnly', true);
                    code.addClass('disabled');
                } else {
                    btnRemove.removeClass('hide');
                    hint.removeClass('hide');
                    colname.attr('disabled', false);
                    cm.setOption('readOnly', false);
                    code.removeClass('disabled');
                }

                nav.html('');
                emptyNote.classed('hide', keys.length);
                var li = d3.select(nav.get(0))
                    .selectAll('li')
                    .data(keys)
                    .enter().append('li')
                    .classed('active', function(d, i) { return active == d; });

                li.append('a')
                    .html(function(d) { return d; })
                    .on('click', function(d) {
                        active = d;
                        activate(d);
                        li.classed('active', function(d, i) { return active == d; });
                    });

                var $li_new = nav.append('<li><a class="add_new"><i class="fa fa-plus"></i> '+nav.data('add-new')+'</a></li>');
                $('a.add_new', nav).off('click').click(addNewClick);

                $('.col-select .column', modal).remove();
                $('.col-select', modal).removeClass('active');

                if (active) {
                    chart.dataset().eachColumn(function(col, i) {
                        if (col.isComputed || i > 10) return;
                        $('<div/>')
                            .addClass('column')
                            .html(column_name_to_var(col.name()))
                            .appendTo($('.col-select', modal))
                            .click(function(d) {
                                cm.replaceSelection($(this).text());
                                cm.focus();
                            });
                    });
                    $('.col-select', modal).addClass('active');
                }
            }

            function activate(d) {
                active = d;
                cm.setValue(columns[d] || '');
                cm.refresh();
                colname.val(d);
            }

            function addNewClick() {
                var cnbase = nav.data('untitled'),
                    i = 1, name = cnbase;
                while (columnNameExists(name)) name = cnbase + ' ('+(++i)+')';
                columns[name] = '';
                chart.set('metadata.describe.computed-columns', columns);
                chart.save();
                activate(name);
                initNav();
                colname.focus().select();
            }

            function initEditor() {

                btnClose.click(function() {
                    modal.modal('hide');
                });

                btnAdd.click(addNewClick);

                btnRemove.click(function() {
                    delete columns[active];
                    colname.val('');
                    active = undefined;
                    chart.set('metadata.describe.computed-columns', columns);
                    chart.save();
                    cm.setValue('');
                    val_preview.html('');
                    cm.refresh();
                    initNav();
                });

                require([
                    'cm/lib/codemirror',
                    'cm/mode/javascript/javascript',
                    'cm/addon/hint/show-hint',
                    'cm/addon/edit/matchbrackets',
                    'cm/addon/display/placeholder',
                ], function(CodeMirror) {

                    var keywords = ['__row'];

                    chart.dataset().columns()
                        .filter(function(col) {
                            return !col.isComputed;
                        }).forEach(function(col) {
                            var cname = column_name_to_var(col.name());
                            keywords.push(cname);
                            if (col.type() == 'number') {
                                keywords.push(cname+'__sum');
                                keywords.push(cname+'__min');
                                keywords.push(cname+'__max');
                                keywords.push(cname+'__mean');
                                keywords.push(cname+'__median');
                            }
                        });

                    keywords = keywords.concat(['sum','round','min','max','median','mean']);

                    function scriptHint(editor, options) {
                        // Find the token at the cursor
                        var cur = editor.getCursor(),
                            token = editor.getTokenAt(cur),
                            match = [];

                        if (token.type == 'variable') {
                            match = keywords.filter(function(chk) {
                                return chk.toLowerCase().indexOf(token.string.toLowerCase()) === 0;
                            });
                        }

                        return {
                            list: match,
                            from: CodeMirror.Pos(cur.line, token.start),
                            to: CodeMirror.Pos(cur.line, token.end)
                        };
                    }

                    CodeMirror.registerHelper("hint", "javascript", function(editor, options) {
                        return scriptHint(editor, options);
                    });

                    cm = CodeMirror(code.get(0), {
                        value: '',
                        mode: 'javascript',
                        theme: 'default',
                        indentUnit: 2,
                        tabSize: 2,
                        lineWrapping: true,
                        matchBrackets: true,
                        placeholder: '// enter formula here',
                        continueComments: "Enter",
                        extraKeys: {
                            'Tab': 'autocomplete'
                        }
                    });

                    colname.on('change keyup', _.throttle(onNameChange, 200));

                    cm.on('changes', _.debounce(function() {
                        if (!active) return;
                        columns[active] = cm.getValue();
                        chart.set('metadata.describe.computed-columns.'+active, cm.getValue());
                        chart.saveSoon();
                        if (chart.dataset().hasColumn(active)) {
                            val_preview.html(chart.dataset().column(active).raw()
                                .slice(0,5).join('<br>'));
                        }
                    }, 1000));

                    firstRun = false;

                    initNav();
                });
            }

            function column_name_to_var(name) {
                // if you change this, change dw.chart.js as well
                return name.toString().toLowerCase()
                    .replace(/\s+/g, '_')           // Replace spaces with _
                    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                    .replace(/-/g, '_')             // Replace - with single _
                    .replace(/\_\_+/g, '_')         // Replace multiple _ with single _
                    .replace(/^_+/, '')             // Trim _ from start of text
                    .replace(/_+$/, '')             // Trim _ from end of text
                    .replace(/^(\d)/, '_$1')        // If first char is a number, prefix with _
                    .replace(/(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|window|with|yield)/, '$1_'); // reserved keywords
            }

            function columnNameExists(cn) {
                return columns[cn] || chart.dataset().hasColumn(cn);
            }

        }
    });

});
