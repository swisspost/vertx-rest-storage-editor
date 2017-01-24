function getParameterByName(name) {
    'use strict';
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function hash(name, value) {
    'use strict';
    var hash;
    try {
        hash = window.location.hash;
        if (hash.startsWith('#')) {
            hash = hash.substring(1);
        }
        hash = JSON.parse(hash);
    } catch(ex) {
        hash = {};
    }
    if (value === undefined) {
        return hash[name];
    }
    hash[name] = value;
    hash = '#' + JSON.stringify(hash);
    history.replaceState(undefined, undefined, hash);
}

$(function ($) {
    'use strict';

    $('#treeResizable').resizable({
        handles: {e: $('#resize-handle')},
        start: function () {
            // hack: we need an overlay above the iframe so that we continue to get mouse-move-events (while resizing is active)
            $('#editor-hide-iframe-overlay').show();
        },
        stop: function () {
            var width = $('#treeResizable').width();
            hash('treeWidth', width);
            $('#editor-hide-iframe-overlay').hide();
        }
    });
    var width = hash('treeWidth');
    $('#treeResizable').width(width);

    var treeBase = getParameterByName('treeBase');
    if (!treeBase.endsWith('/')) {
        treeBase += '/';
    }
    var rootNodes = [{
        id: treeBase,
        text: treeBase,
        data: {},
        icon: 'fa fa-folder',
        children: true
    }];

    $('#tree').jstree({
        plugins: [ 'contextmenu'],
        contextmenu: {
            show_at_node: false,
            items: function (node) {
                var m = {};
                m.title = {label: node.id, separator_after: true, _disabled: true};
                if (!node.data.isLeaf) {
                    m.create = {label: 'Create resource'};
                }
                m.delete = {label: node.data.isLeaf ? 'Delete resource' : 'Delete whole tree'};
                return m;
            }
        },
        core: {
            check_callback: true,
            animation: false,
            themes: {
                name: 'proton',
                responsive: true,
                dots : true,
                icons: true
            },
            data: function (node, callback) {
                if (node.id === '#') {
                    // initialize the one-and-only rood node
                    callback.call(this, rootNodes);
                    return;
                }

                var nodeUrl = node.id;
                var childrenNodes = [];
                function addEntriesToParentNode(entries) {
                    entries.forEach(function (c) {
                        var isLeaf = !c.endsWith('/');
                        var childNode = {
                            id: nodeUrl + c,
                            text: c,
                            data: {
                                isLeaf: isLeaf
                            },
                            icon: isLeaf ? 'fa fa-file-text-o' : 'fa fa-folder',
                            children: !isLeaf   // to force jstree to show a '+' icon and to be able to open a not-yet loaded tree
                        };
                        childrenNodes.push(childNode);
                    });
                }

                $.get(nodeUrl, function success(data) {
                    for (var property in data) {
                        if (data.hasOwnProperty(property)) {
                            addEntriesToParentNode(data[property]);
                        }
                    }
                    callback.call(this, childrenNodes);
                }).fail(function(err) {
                    // show a single red error children on AJAX error
                    childrenNodes.push({
                        text: err.responseText || err.statusText,
                        data: {isLeaf: true},
                        li_attr: { style:'color: red;'},
                        icon: null
                    });
                    callback.call(this, childrenNodes);
                });
            }
        }
    });

    var jstree = $('#tree').jstree();
    $('#tree').on('load_node.jstree', function (e, data) {
        var node = data.node;
        if (node.id === '#') {
            // open the root nodes automatically
            jstree.open_node(node.children);
        }
    });
    $('#tree').on('after_open.jstree', function (e, data) {
        var node = data.node;
        var selected = hash('selected');
        if (selected) {
            node.children.forEach(function (c) {
                if(selected === c) {
                    jstree.select_node(c);
                    $('#tree').off('after_open.jstree');
                    var y = hash('treeScroll');
                    $('#tree').scrollTop(y);
                } else if (selected.indexOf(c) === 0) {
                    jstree.open_node(c);
                }
            });
        }
    });
    $('#tree').on('select_node.jstree', function (e, data) {
        var node = data.node;
        openInEditor('');
        hash('selected', node.id);
        if (node.data.isLeaf) {
            openInEditor(node.id); // open in editor
        } else if (data.node.state.loaded) {
            jstree.refresh_node(node);
        } else {
            jstree.open_node(node); // click on node-text to open subtree
        }
    });
    $('#tree').on('after_close.jstree', function (e, data) {
        // remove children to force fresh reload when opening node again
        var node = data.node;
        node.state.loaded = false;
        jstree.delete_node(node.children);
    });

    $('#tree').scroll(function (e) {
        var y = $('#tree').scrollTop();
        hash('treeScroll', y);
    });
});

// toggle raw or editor mode
function toggleRawMode() {
    'use strict';
    $('#raw-mode-toggler').toggleClass('active');
    openInEditor();
}

// load node by id into the editor
function openInEditor(url) {
    'use strict';

    var rawMode = $('#raw-mode-toggler').hasClass('active');
    var editMode = !rawMode;
    if (url && editMode) {
        var editor = getParameterByName('editor') || 'editor.html';
        url = editor + '#' + url;
    }
    $('#editor-iframe').attr('src', '');
    window.setTimeout(function () {
        $('#editor-iframe').attr('src', url);
    }, 10);
}