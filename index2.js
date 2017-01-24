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

var autoExpandToAndSelectPath = hash('selected');

function findNodesByUrl(searchUrl) {
    'use strict';
    var nodes = [];
    var jstree = $('#tree').jstree();
    function recurse(nodeId) {
        var node = jstree.get_node(nodeId)
        if (node.data) {
            if (node.data.url === searchUrl) {
                nodes.push(node);
                return;
            }
            if (searchUrl.indexOf(node.data.url) != 0) {
                return;
            }
        }
        node.children.forEach(recurse);
    }
    recurse('#');
    return nodes;
}


function createResource() {
    'use strict';
    var relPath = $('#nameOfResourceToCreate').val();
    if(!relPath) {
        $('#nameOfResourceToCreate').effect('highlight', {color: '#F88'}, 200);
        return;
    }
    var basePath = $('#nameOfResourceToCreateBaseUrl').text();
    var url = basePath + relPath;
    $.ajax({
        url: url,
        type: 'PUT',
        data: '{}'
    }).then(function () {
        var affectedParentNodes = findNodesByUrl(basePath);
        autoExpandToAndSelectPath = url;
        var jstree = $('#tree').jstree();
        jstree.deselect_all();
        affectedParentNodes.forEach(function(node) {
            jstree.refresh_node(node);
        });
        jstree.refresh_node(basePath);
        $('#dialogCreateResource').parent().effect('highlight', {color: '#8F8'}, 200);
    });
}

function deleteResource() {
    'use strict';
    var url = $('#nameOfResourceToDelete').text();
    $.ajax({
        url: url,
        type: 'DELETE'
    }).then(function () {
        var jstree = $('#tree').jstree();
        var affectedNodes = findNodesByUrl(url);
        affectedNodes.forEach(function(node) {
            node = jstree.get_parent(node);
            jstree.refresh_node(node);
            jstree.select_node(node);
        });
        $('#dialogDeleteResource').dialog('close');
    });
}

$(function ($) {
    'use strict';

    /**************************************************************************************************************
     * Make the tree horizontally resizable (width)
     *   - Note the hack to go around the problem with the iframe
     *   - store the width in localStorage and set it on page load from loacalStorage
     *************************************************************************************************************/
    $('#treeResizable').resizable({
        handles: {e: $('#resize-handle')},
        start: function () {
            // hack: we need an overlay above the iframe so that we continue to get mouse-move-events (while resizing is active)
            $('#editor-hide-iframe-overlay').show();
        },
        stop: function () {
            var width = $('#treeResizable').width();
            window.localStorage.setItem('vertx-rest-storage-editor.treeWidth', width);
            $('#editor-hide-iframe-overlay').hide();
        }
    });
    var width = window.localStorage.getItem('vertx-rest-storage-editor.treeWidth');
    if (width) {
        $('#treeResizable').width(width);
    }

    $('#dialogCreateResource').dialog({
        autoOpen: false,
        modal: true,
        width: '50vw'
    });
    $('#dialogDeleteResource').dialog({
        autoOpen: false,
        modal: true,
        width: '50vw'
    });

    /**************************************************************************************************************
     * Setup jstree (see http://www.jstree.com)
     *************************************************************************************************************/
    var treeBase = getParameterByName('treeBase');
    if (!treeBase.endsWith('/')) {
        treeBase += '/';
    }
    var rootNodes = [{
        text: treeBase,
        data: {url: treeBase},
        icon: 'fa fa-folder',
        children: true
    }];

    $('#tree').jstree({
        core: {
            /**************************************************************************************************************
             * basic settings for jstree
             *************************************************************************************************************/
            check_callback: true,
            animation: false,
            themes: {
                name: 'proton',
                responsive: true,
                dots : true,
                icons: true
            },
            /**************************************************************************************************************
             * the 'lazy' data loader - called automatically when opening an unloaded node
             * creates child nodes which are either nodes-with-children ('directory') or leafs ('resources')
             * We distinguish from vertx-rest-storage with a trailing slash (i.e. "img/" is a node-with-children while" "img" is a resource
             *************************************************************************************************************/
            data: function (node, callback) {
                if (node.id === '#') {
                    // initialize the one-and-only rood node
                    callback.call(this, rootNodes);
                    return;
                }

                var nodeUrl = node.data.url;
                var childrenNodes = [];
                function addEntriesToParentNode(entries) {
                    entries.forEach(function (c) {
                        var isLeaf = !c.endsWith('/');
                        var childNode = {
                            text: c,
                            data: {
                                url: nodeUrl + c
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
                }).fail(function (err) {
                    // show a single red error children on AJAX error
                    childrenNodes.push({
                        text: err.responseText || err.statusText,
                        data: {url: nodeUrl + '[errorIndicator]'},
                        li_attr: {style: 'color: red;'},
                        icon: null
                    });
                }).always(function() {
                    callback.call(this, childrenNodes);
                });
            }
        },
        /**************************************************************************************************************
         * Context menu on every tree node
         *************************************************************************************************************/
        plugins: [ 'contextmenu'],
        contextmenu: {
            show_at_node: false,
            items: function (node) {
                var m = {};
                m.title = {label: node.data.url, separator_after: true, _disabled: true};
                m.pin = {
                    label: node.data.pinned ? 'Unpin this node' : 'Pin this node',
                    icon: 'fa fa-thumb-tack',
                    separator_after: true,
                    action: function () {
                        if(node.data.pinned) {
                            $('#tree').jstree().delete_node(node);
                        } else {
                            $('#tree').jstree().create_node('#', {
                                text: node.data.url,
                                icon: 'fa fa-thumb-tack',
                                data: {url: node.data.url, pinned: true}
                           });
                        }
                    }
                };
                if (node.data.url.endsWith('/')) {
                    m.create = {
                        label: 'Create resource',
                        action: function() {
                            $('#dialogCreateResource').dialog('option', 'position', {
                                my: 'left center',
                                at: 'left+150 top',
                                of: $('#tree').jstree().get_node(node, true),
                                collision: 'fit'
                            }).dialog('open');
                            $('#nameOfResourceToCreateBaseUrl').text(node.data.url);
                            $('#nameOfResourceToCreate').val('');
                        }
                    };
                }
                m.delete = {
                    label: node.data.url.endsWith('/') ? 'Delete whole tree' : 'Delete resource',
                    icon: 'fa fa-trash',
                    action: function() {
                        $('#dialogDeleteResource').dialog('option', 'position', {
                            my: 'left center',
                            at: 'left+150 top',
                            of: $('#tree').jstree().get_node(node, true),
                            collision: 'fit'
                        }).dialog('open');
                        $('#nameOfResourceToDelete').text(node.data.url);
                    }
                };
                return m;
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
        jstree.set_icon(node,'fa fa-folder-open');  // show the 'open' folder icon
        /**************************************************************************************************************
         * on page load we open the tree node-by-node to a preselected path
         * so we can 'stabilize' the view on "Browser refresh"
         *************************************************************************************************************/
        if (autoExpandToAndSelectPath) {
            for (var i = 0; i < node.children.length; i++) {
                var childNode = jstree.get_node(node.children[i]);
                var childUrl = childNode.data.url;
                if (autoExpandToAndSelectPath === childUrl) {
                    // found the target
                    node = childNode;
                    break;
                } else if (childUrl.endsWith('/') && autoExpandToAndSelectPath.indexOf(childUrl) === 0) {
                    // this is a child-node which matches the searched url - so open it (and we will be called again)
                    jstree.open_node(childNode);
                    return;
                }
            }
            // no children matches the path _or_ perfect match found
            autoExpandToAndSelectPath = null;
            jstree.select_node(node);
            var offset = jstree.get_node(node, true).offset();
            var height = $('#tree').height();
            $('#tree').scrollTop(offset.top - height / 3);
        }
    });
    $('#tree').on('after_close.jstree', function (e, data) {
        var node = data.node;
        jstree.set_icon(node,'fa fa-folder'); // show the 'closed' folder icon
    });
    $('#tree').on('select_node.jstree', function (e, data) {
        var node = data.node;
        $('#editor-iframe').attr('src', '');
        hash('selected', node.data.url);
        if (!node.data.url.endsWith('/')) {
            if (!node.data.url.endsWith('[errorIndicator]')) {
                openInEditor(node.data.url); // open in editor
            }
        } else if (data.node.state.loaded) {
            // hm... better to close the node - we can reload by open it again (as 'close' removes the childs)
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
});

// toggle raw <-> editor mode
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
    // $('#editor-iframe').attr('src', '');
    window.setTimeout(function () {
        $('#editor-iframe').attr('src', url);
    }, 10);
}