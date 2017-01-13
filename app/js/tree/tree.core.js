// base configuration for tree
$(function () {
    baseUrl  = getBaseUrl();
    // catch environment
    if (baseUrl.indexOf('localhost') != -1) {
        if (settings.devBaseUrl.length > 0) {
            console.warn('!! CARFUL: you work on DEV with ' + settings.devBaseUrl + ' !!');
            console.warn('!! if you want change this go to server/apps/web/rest-editor/js/settings.js !!');
            console.warn('!! ************************************************************************ !!');
            baseUrl = settings.devBaseUrl;
            devMode = true;
        }
    } else {
        if (settings.baseUrl.length > 0) {
            baseUrl = settings.baseUrl;
        }
    }
    // initial load
    if (getUrlPath().substr(getUrlPath().length - 1) === '/') {
        loadData();
        checkUrlPermission();
    }
});

var root, uri, src, contextItem, contextNode, disabledNode = false, devMode = false;

function loadTree(nodes) {
    $('#tree') // jshint ignore:line
    // event handler to load and open / close the tree
    // crush has an other structure then jsTree it needs, so we have to load the json data a littlebit special
    // the crush returned value will be parsed in a jsTree valid json object.
        .on('select_node.jstree', function (e, data) {
            // handel selects on tree
            getDataHandler(data.node);
            focusSelectedNode(data.node);
        })
        .on('open_node.jstree', function (e, data) {
            // handels clicks to change state and icon
            changeFolderState(data.node, true, 'folder-open');
        })
        .on('close_node.jstree', function (e, data) {
            // handels clicks to change state and icon
            changeFolderState(data.node, false, 'folder-close');
            tree.select_node(data.node);
        })
        .on('redraw.jstree', function (e, data) {
            // we don't get an node here so i handle the focus
            // in the select_node.jstree Handler
            // focusSelectedNode();
        })
        .jstree({
            'core' : {
                'data': nodes,
                'themes': {
                    'name': 'proton',
                    'responsive': true,
                    'dots' : true
                }
            },
            // loaded plugins for jsTree
            "plugins": [ "types", "contextmenu", "search" ],
            // get types and return the correct font class
            "types": iconTypes,
            // context menu configuration
            "contextmenu": {
                "items": function ($node) {
                    checkUrlPermission($node);
                    return {
                        // Add item contextmenu button
                        "Create": {
                            "label": "Create new node",
                            "action": function (obj) {
                                addNodeDialog(tree.get_node(obj.reference[0].parentNode.id));
                            },
                            "icon": "fa fa-plus",
                            "_disabled": settings.ContextDisabledAdd
                        },
                        // Delete contextmenu button
                        "Delete": {
                            "label": "Delete node",
                            "action": function (obj) {
                                var id = obj.reference[0].parentNode.id;
                                // Bootstrap dialog confirmation
                                BootstrapDialog.confirm({
                                    'message': '<h4>Are you sure to continue with this action?</h4><hr>'+'<b>Delete item:</b> '+id+'<br>',
                                    'size': 'size-large',
                                    'callback': function(result){
                                        if(result) {
                                            removeNodeService(id)
                                                .success(function(result) {
                                                    removeNode(id);
                                                })
                                                .error(function(result) {
                                                    BootstrapDialog.show({
                                                        title: 'Error: delete node',
                                                        message: '<br>Couln\'t delete node!<br><hr>status:' + result.status + ', status text: ' + result.statusText+'<br><br>',
                                                        type: BootstrapDialog.TYPE_DANGER
                                                    });
                                                });
                                        }
                                    }
                                });
                            },
                            "icon": "fa fa-trash-o",
                            "_disabled": settings.ContextDisabledDelete
                        }
                    };
                }
            }
        });
    // reference jsTree instance for quick acces on jsTree functions
    tree = $.jstree.reference('#tree');

    window.tree = tree;
    getBreadcrumb();
}

// handels clicks on node's (select)
function getDataHandler(node) {
    var re = /folder/;
    if (re.exec(node.type) === null) {
        if (node.id.indexOf(':loadmore') > 5) { // string length
            if (node.parent === "#") {
                var specUrl = baseUrl + node.id.replace(":loadmore", "");
                getChilds(specUrl, tree.get_node(node.parent), '?offset='+(node.data-settings.limitStretch)+'&limit='+node.data);
            } else {
                getChilds(baseUrl, tree.get_node(node.parent), '?offset='+(node.data-settings.limitStretch)+'&limit='+node.data);
            }

        } else {
            // load file and show it in the ace editor
            if (window.event.button === 0) {
                show(node.id);
                return true;
            }
        }
    } else {
        if (window.event.button === 0) {
            if (tree.is_parent(node) === false) {
                getChilds(baseUrl, node, settings.limitParam);
            } else {
                // start correct jsTree handler
                if (tree.is_closed(node)) {
                    tree.open_node(node);
                } else {
                    tree.close_node(node);
                }
            }
        }
    }
}

// load base tree and parse json
function loadData() {
    loadDataService()
        .success(function(data) {
            parseJson(data, '','#');
            loadTree(nodes);
        })
        .error(function(XMLHttpRequest, textStatus, errorThrown){
            BootstrapDialog.show({
                title: 'Error: loading tree data',
                message: '<br>Can\'t loading data, please check your connection and try again.<br><hr>status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+'<br><br>',
                type: BootstrapDialog.TYPE_DANGER
            });
        });
}

// load childs and parse json
function getChilds(url, node, param) {
    getChildsService(url, node, param)
        .success(function(data) {
            parseJson(data, node.id, node.id);
            tree.get_node(node.id).state.isLoaded = true;
            changeFolderState(node, true, 'folder-open');
        })
        .error(function(XMLHttpRequest, textStatus, errorThrown){
            BootstrapDialog.show({
                title: 'Error: loading tree data',
                message: '<br>Can\'t loading data, please check your connection and try again.<br><hr>status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText+'<br><br>',
                type: BootstrapDialog.TYPE_DANGER
            });
        });
}

// json parse function - parse redis response json into the required jsTree json
function parseJson(data, url, parent) {
    if (url === '') {
        url = getUrlPath();
    }
    for (var i in data) {
        var lm = settings.limitDefault;
        if (nodes.length > 0) {
            if (nodes[nodes.length-1].id.indexOf(':loadmore') !== -1 && parent === nodes[nodes.length-1].parent) {
                lm = nodes[nodes.length-1].data;
                nodes.splice(nodes.length-1, 1);
                tree.deselect_all(); // deselect all nodes, without this are two nodes selected
                //tree.select_node(nodes[nodes.length-1]); // select node - a refresh will show this node
            }
        }
        for (var j in data[i]) {
            // add child to nodes array
            var entry = data[i][j];
            // 
            if($.isPlainObject(entry) && entry["name"] != null){
              addNode(url+entry["name"], parent, entry["name"]);
            } else {
              addNode(url+entry, parent, entry);
            }
            // if a load more button is at the end of the nodes array move them to the end
            if (nodes.length > 1) {
                if (nodes[nodes.length-2].id.indexOf(':loadmore') !== -1) {
                    nodes.move(nodes.length-2, nodes.length-1);
                }
            }
        }
        if (data[i].length < lm) {
        } else {
            if (lm >= settings.limitDefault) {
                lm = lm + settings.limitStretch;
                nodes.push({'id': url+':loadmore', 'parent': parent, data: lm, 'type': 'loadmore', 'text': 'load more ...', 'state': {'opend': false, 'disabled': false, 'selected': false}});
            }
        }
    }
    return nodes;
}

// parse the url to the crush path
function getUrlPath() {
    if (window.location.hash.split("#")[1] === undefined) {
        return '';
    } else {
        return window.location.hash.split("#")[1];
    }
}

// parse base url
function getBaseUrl() {
    var url = window.location.href.split("/");
    return url[0] + "//" + url[2];
}

// generate breadcrumbs
function getBreadcrumb() {
    $("#breadcrumb").empty();
    var path = "", title = $("#breadcrumb");
    title.append("<li><a href='/'>/</a></li>");
    $.each(getUrlPath().split('/'), function (k, part) {
        if (part.trim() !== "") {
            path = path + part + '/';
            title.append("<li><a href='/" + path + "'>" + part + "</a></li>");
        }
    });
}

// this function reloads the tree completely
function reloadTree() {
    tree.destroy(false);
    nodes = [];
    loadData();
}

// show and hide tree div
function hideTree() {
    $( "#sidebar" ).fadeToggle( "500", "linear" );
    var toggleWidth = $("#editor").width() == $(window).width() - 480 ? $(window).width() - 80 : $(window).width() - 480;
    var marg = $("#editor").width() == $(window).width() - 480 ? "80px" : "480px";
    $('#editor').animate({ width: toggleWidth, 'margin-left': marg});
}

// show and hide toolbox
function hideToolbox() {
    $("#toolbox").fadeToggle( "300", "linear" );
    $("#backdrop").fadeToggle( "300", "linear" );
    $('#filterInput').focus().select();
}

// close toolbox if you click on a other place
$(document).mouseup(function (e) {
    if (!$("#toolbox").is(e.target) && $("#toolbox").has(e.target).length === 0 &&  $('#toolbox').css('display') != 'none' && $("#toolboxVisibleBtn").has(e.target).length === 0 && !$("#toolbox").is(e.target)) {
        $( "#toolbox" ).fadeOut("300", "linear");
        $( "#backdrop").fadeOut("300", "linear");
    }
});

// help dialog with the help texts from the settings
function helpDialog() {
    var $text = $('<div></div>');
    $text.append(help.search.icon + help.search.text[0] + help.search.text[1] + help.search.text[2]);
    $text.append(help.tree.icon + help.tree.text);
    $text.append(help.reset.icon + help.reset.text);
    $text.append(help.reload.icon + help.reload.text);
    $text.append(help.raw.icon + help.raw.text);
    $text.append(help.node.icon + help.node.text);
    $text.append(help.help.icon + help.help.text);
    $text.append(help.top.icon + help.top.text);
    $text.append(help.bottom.icon + help.bottom.text);
    $text.append(help.copyright.icon + help.copyright.text);
    BootstrapDialog.show({
        title: help.title,
        message: $text
    });
}

nodes.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};

function getURLParameter(name) {
    return decodeURI(
        (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [,null])[1]
    );
}

// load node by id into the editor
function show(id) {
    if (id) {
        uri = id;
    }
    if (uri) {
        var editor = getURLParameter(name);
        if (!editor || editor === "null") {
            editor = "editor.html";
        } else {
            editor = baseUrl + editor;
        }
        var newSrc;
        if(devMode) {
            newSrc = settings.rawEditMode == 1 ? "" + editor + "#" + baseUrl + uri : uri;
        } else {
            newSrc = settings.rawEditMode == 1 ? "" + editor + "#" + uri : uri;
        }
        if (src === newSrc) {
            $("#frame").attr("src", "");
            setTimeout(function () {
                $("#frame").attr("src", src);
            }, 100);
        }
        src = newSrc;
        $("#frame").attr("src", src);
    }
};

// toggle raw or editor mode
function chgRawEditMode() {
    $('#edit-switch').toggleClass("active");
    if (settings.rawEditMode == 1) { settings.rawEditMode = 0; } else { settings.rawEditMode = 1; }
    // dojoApp.show();
    show();
}

// scroll to top
function scrollUp() {
    $('#sidebar').scrollTop(0);
}

// scroll to bottom
function scrollDown() {
    $('#sidebar').scrollTop(99999999999999999);
}

// click function for close button
$("#close").click(function () {
    if ($("#frame").attr("src")) {
        window.location = $("#frame").attr("src");
    }
});

$("#goHome").click(function () {
    $("#goHome").attr("href", baseUrl + homeUrl);
});

$(window).resize(function() {
    $("#editor").width($(window).width() - 480);
});

$(window).load(function() {
    $("#editor").width($(window).width() - 480);
})
