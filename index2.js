/*
 * see http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 */
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
    window.history.replaceState(undefined, undefined, hash);
}

var autoExpandToAndSelectPath = hash('selected');

function goHome() {
    'use strict';
    window.location.href = settings.homeUrl;
}

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
            if (searchUrl.indexOf(node.data.url) !== 0) {
                return;
            }
        }
        node.children.forEach(recurse);
    }
    recurse('#');
    return nodes;
}

function gotoResource() {
    'use strict';
    autoExpandToAndSelectPath = $('#nameOfResourceToSearch').val();
    var jstree = $('#tree').jstree();
    jstree.refresh();
    $('#dialogSearchResource').dialog('close');
}

function createResource() {
    'use strict';
    var relPath = $('#nameOfResourceToCreate').val();
    if (!relPath) {
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
            node.data.childrenNames = null;
            jstree.refresh_node(node);
        });
        // jstree.refresh_node(basePath);
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
        affectedNodes.forEach(function (node) {
            jstree.delete_node(node);
            var parentNode = jstree.get_node(node.parent);
            parentNode.data.childrenNames = null;
            jstree.refresh_node(parentNode);
        });
        $('#dialogDeleteResource').dialog('close');
    });
}

$(function ($) {
    'use strict';

    if(settings.startInEditMode) {
        $('#edit-mode-toggler').prop('checked', true);
    }
    $('#edit-mode-toggler').checkboxradio({
        icon: false
    });

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

    /**************************************************************************************************************
     * Setup three modal dialogs
     *************************************************************************************************************/
    $('#dialogSearchResource').dialog({
        autoOpen: false,
        modal: true,
        width: '50vw',
        close: function() {
            $('#nameOfResourceToSearch').autocomplete('destroy');
        }
    });
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
     * Helper to map Vertx-Rest-Storage proprietary JSON-format for 'directories' to a flat array of strings
     *************************************************************************************************************/
    function flattenToArray(data) {
        var childrenUrls = [];
        if (typeof data === 'string') {
            return childrenUrls;
        }
        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                childrenUrls = childrenUrls.concat(data[property]);
            }
        }
        return childrenUrls;
    }

    /**************************************************************************************************************
     * Setup jstree (see http://www.jstree.com)
     * Root nodes and more
     *************************************************************************************************************/
    var jstree;

    var treeBase = getParameterByName('treeBase');
    if (!treeBase.endsWith('/')) {
        treeBase += '/';
    }
    var ROOT_NODES = [{
        text: treeBase,
        data: {url: treeBase},
        icon: 'fa fa-folder',
        children: true
    }, {
        id: '#bookmarkFolder',
        text: 'Bookmarked URLs',
        data: {url: ''},
        icon: 'fa fa-star-o',
        children: true
    }];
    var bookmarkUrls;
    try {
        bookmarkUrls = JSON.parse(window.localStorage.getItem('bookmarkUrls'));
    } catch (ignore) {
    }
    if (!bookmarkUrls) {
        bookmarkUrls = [];
    }

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
                var childrenNodes;

                if (node.id === '#') {
                    // initialize the one-and-only rood node
                    callback.call(this, ROOT_NODES);
                    return;
                } else if (node.id === '#bookmarkFolder') {
                    childrenNodes = bookmarkUrls.map(function (url) {
                        var isLeaf = !url.endsWith('/');
                        return {
                            text: url,
                            data: {url: url},
                            icon: isLeaf ? 'fa fa-file-text-o' : 'fa fa-folder',
                            children: !isLeaf   // force jstree to show a '+' icon and to be able to open a not-yet loaded tree
                        };
                    });
                    callback.call(this, childrenNodes);
                    return;
                }

                var nodeUrl = node.data.url;

                if (node.data.childrenNames) {
                    // already loaded? This happens when we use page up/down
                    childrenNodes = page(node);
                    callback.call(this, childrenNodes);
                    return;
                }

                $.get(nodeUrl, function success(data) {
                    node.data.childrenNames = flattenToArray(data); // childrenNames are a 'cache' to enable faster paging
                    node.data.pageOffset = 0;
                    childrenNodes = page(node);
                }).fail(function (err) {
                    // show a single red error children on AJAX error
                    childrenNodes = [{
                        text: err.responseText || err.statusText,
                        data: {url: nodeUrl + '[errorIndicator]'},
                        li_attr: {style: 'color: red;'},
                        icon: null
                    }];
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
                m.search = {
                    label: 'Search: ' + node.data.url,
                    icon: 'fa fa-search',
                    separator_after: true,
                    action: function() {
                        $('#dialogSearchResource').dialog('option', 'position', {
                            my: 'left center',
                            at: 'left+150 top',
                            of: $('#tree').jstree().get_node(node, true),
                            collision: 'fit'
                        }).dialog('open');
                        $('#nameOfResourceToSearch').autocomplete({
                            // autoFocus: true,
                            delay: 0,
                            source: function (request, callback) {
                                var parentUrl = request.term;
                                var i = parentUrl.lastIndexOf('/');
                                if (i < parentUrl.length) {
                                    parentUrl = parentUrl.substring(0, i + 1);
                                }
                                $.get(parentUrl, function success(data) {
                                    var children = flattenToArray(data);
                                    var suggestions = [];
                                    for (var i = 0; i < children.length; i++) {
                                        var suggestion = parentUrl + children[i];
                                        if (suggestion.indexOf(request.term) === 0) {
                                            suggestions.push(suggestion);
                                        }
                                        if (suggestions.length > 100) {
                                            break;
                                        }
                                    }
                                    if (suggestions.length === 1 && suggestions[0] === request.term) {
                                        suggestions.length = 0;
                                    }
                                    callback(suggestions);
                                });
                            },
                            select: function (event, ui) {
                               this.value = ui.item.value;
                                if (event.keyCode === 9) { // if TAB Key
                                    event.preventDefault();
                                    $('#nameOfResourceToSearch').focus();
                                }
                                window.setTimeout(function () {
                                    $('#nameOfResourceToSearch').autocomplete('search');
                                }, 10);
                               return false;
                            }
                        });
                        $('#nameOfResourceToSearch').val(node.data.url);
                        $('#nameOfResourceToSearch').autocomplete('search');
                    }
                };
                var isBookmark = node.parent === '#bookmarkFolder';
                m.bookmark = {
                    label: isBookmark ? 'remove from Bookmarks' : 'Bookmark this node',
                    icon: 'fa fa-thumb-tack',
                    separator_after: true,
                    action: function () {
                        if (isBookmark) {
                            var idx = bookmarkUrls.indexOf(node.data.url);
                            if (idx >= 0) {
                                bookmarkUrls.splice(idx, 1);
                            }
                        } else {
                            bookmarkUrls.push(node.data.url);
                        }
                        // store list of bookmarked urls to localStorage
                        window.localStorage.setItem('bookmarkUrls', JSON.stringify(bookmarkUrls));
                        jstree.refresh_node('#bookmarkFolder');
                    }
                };
                var addAllowed = true, delAllowed = true;
                if (security) {
                    security.forEach(function (rule) {
                        var regexp = rule.route;
                        if (!regexp.endsWith('$')) {
                            regexp += '$';
                        }
                        regexp = new RegExp(regexp);
                        if (regexp.test(node.data.url)) {
                            addAllowed = addAllowed && rule.add;
                            delAllowed = delAllowed && rule.del;
                        }
                    });
                }

                if (node.data.url.endsWith('/')) {
                    m.create = {
                        label: 'Create resource',
                        _disabled: !addAllowed,
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
                    _disabled: !delAllowed,
                    icon: 'fa fa-trash',
                    action: function () {
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

    jstree = $('#tree').jstree();

    /**************************************************************************************************************
     * The 'paging' function: If a node has more than 500 children, only 500 of them are 'rendered' to the jstree
     * Additionally we then add two more nodes: the two "Blue Page Up/Down virtual entries"
     *************************************************************************************************************/
    function page(node) {
        var nodeUrl = node.data.url;

        if (autoExpandToAndSelectPath) {
            for (var i = 0; i < node.data.childrenNames.length; i++) {
                var tmpUrl = node.data.url + node.data.childrenNames[i];
                if (autoExpandToAndSelectPath.indexOf(tmpUrl) === 0) {
                    node.data.pageOffset = Math.floor(i / settings.pageSize) * settings.pageSize;
                    break;
                }
            }
        }
        var from = node.data.pageOffset;
        var to = Math.min(node.data.childrenNames.length, from + settings.pageSize);

        var childrenNodes = [];
        if (from !== 0 || to !== node.data.childrenNames.length) {
            childrenNodes.push({
                text: 'prev page ' + from + '..' + (to - 1) + ' (total ' + node.data.childrenNames.length + ')',
                data: {
                    pageOffsetAddition: -settings.pageSize
                },
                icon: 'fa fa-fast-backward',
                li_attr: {style: 'color: blue; font-style: italic;'}
            });
            childrenNodes.push({
                text: 'next page',
                data: {
                    pageOffsetAddition: +settings.pageSize
                },
                icon: 'fa fa-fast-forward',
                li_attr: {style: 'color: blue; font-style: italic;'}
            });
        }

        for (i = from; i < to; i++) {
            var name = node.data.childrenNames[i];
            var isLeaf = !name.endsWith('/');
            childrenNodes.push({
                text: name,
                data: {
                    url: nodeUrl + name
                },
                icon: isLeaf ? 'fa fa-file-text-o' : 'fa fa-folder',
                children: !isLeaf   // force jstree to show a '+' icon and to be able to open a not-yet loaded tree
            });
        }
        return childrenNodes;
    }


    /**************************************************************************************************************
     * To initially open all childrens of the (virtual) jstree root node.
     * Those children are in fact 'our' real-and-visible root nodes
     *************************************************************************************************************/
    $('#tree').on('load_node.jstree', function (e, data) {
        var node = data.node;
        if (node.id === '#') {
            // open the root nodes automatically
            node.children.forEach(function(childNode) {
                jstree.open_node(childNode);
            });
        }
    });

    $('#tree').on('after_open.jstree', function (e, data) {
        var node = data.node;
        if (node.id !== '#bookmarkFolder') {
            jstree.set_icon(node, 'fa fa-folder-open');  // show the 'open' folder icon
        }
        /**************************************************************************************************************
         * on page load we open the tree node-by-node to a preselected path
         * so we can 'stabilize' the view on "Browser refresh"
         *************************************************************************************************************/
        if (autoExpandToAndSelectPath) {
            for (var i = 0; i < node.children.length; i++) {
                var childNode = jstree.get_node(node.children[i]);
                var childUrl = childNode.data.url;
                if (!childUrl) {
                    continue;
                }
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
        if (node.id !== '#bookmarkFolder') {
            jstree.set_icon(node,'fa fa-folder'); // show the 'closed' folder icon
        }
    });
    $('#tree').on('select_node.jstree', function (e, data) {
        var node = data.node;

        /**************************************************************************************************************
         * Handle clicks on the two "Blue Page Up/Down virtual entries"
         *************************************************************************************************************/
        if (node.data.pageOffsetAddition) {
            var parentNode = jstree.get_node(node.parent);
            var newOffset = parentNode.data.pageOffset + node.data.pageOffsetAddition;
            if (newOffset < 0) {
                newOffset = 0;
            }
            if (newOffset < parentNode.data.childrenNames.length - 1) {
                parentNode.data.pageOffset = newOffset;
            }
            jstree.refresh_node(parentNode);
            return;
        }

        openInEditor(null);
        hash('selected', node.data.url);
        if (node.data.url && !node.data.url.endsWith('/')) {
            if (!node.data.url.endsWith('[errorIndicator]')) {
                openInEditor(node.data.url); // open in editor
            }
        } else if (data.node.state.loaded) {
            // hm... better to close the node - we can reload by open it again (as 'close' removes the childs)
            node.data.childrenNames = null;
            jstree.refresh_node(node);
        } else {
            jstree.open_node(node); // click on node-text to open subtree
        }
    });
    /**************************************************************************************************************
     * On close remove all children stuff - so we force a reload when the subtree is opened again
     * No need for other weird reload Buttons or so...
     *************************************************************************************************************/
    $('#tree').on('after_close.jstree', function (e, data) {
        // we only want to remove children to force fresh reload when opening node again
        var node = data.node;
        node.data.childrenNames = null;
        node.state.loaded = false;
        jstree.delete_node(node.children);
   });
});


var currentUrlInEditor = null;
// toggle raw <-> editor mode
function toggleEditModeClicked() {
    'use strict';
    openInEditor(currentUrlInEditor);
}

// start editor, either in Edit-Mode or in Raw-Mode
function openInEditor(url) {
    'use strict';

    if (currentUrlInEditor) {
        console.log('closing');
        $('#editor-iframe').attr('src', '');
    }
    currentUrlInEditor = url;

    var editMode = $('#edit-mode-toggler').is(':checked');
    if (url && editMode) {
        var editor = getParameterByName('editor') || 'editor.html';
        url = editor + '#' + url;
    }
    if (url) {
        window.setTimeout(function () {
            console.log('opening '+url);
            $('#editor-iframe').attr('src', url);
        }, 10);
    }
}