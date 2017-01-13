// add node to nodes array
function addNode(id, parent, text) {
    var type, node;
    if (text.indexOf('/') === -1) {
        var re = /(?:\.([^.]+))?$/;
        if (re.exec(text)[1] === undefined) {
            type = 'file';
        } else {
            type = re.exec(text)[1];
        }
        node = {'id': id, 'parent': parent, 'type': type, 'text': text, 'state': {'opend': false, 'disabled': false, 'selected': false}};
    }
    else {
        node = {'id': id, 'parent': parent, 'type': 'folder-close', 'text': text.replace("/", ""), 'state': {'opened': false, 'disabled': false, 'selected': false, 'isLoaded': false}};
    }
    nodes.push(node);
    return node;
}

// add new node dialog
function addNodeDialog(node) {
    // handle root node
    if (node === undefined) {
        node = {};
        node.id = getUrlPath();
    }
    // Bootstrap dialog to add new item
    var $text = $('<div></div>');
    $text.append('<h4>Add new File or Folder</h4><hr>');
    $text.append('<p>Please enter new file name. If you want to create a folder you have to use this format \'foldername/filename\'.</p><br>');
    $text.append('<input id="newElement" type="text" class="form-control" placeholder="foldername/filename" autofocus>');
    BootstrapDialog.show({
        message: $text,
        buttons: [{
            label: 'Save and add item',
            cssClass: 'btn-primary',
            hotkey: 13, // catch enter
            action: function(dialogRef){
                if (node.state !== undefined) {
                    if (node.state.isLoaded === false) {
                        getChilds(baseUrl, node, settings.limitParam);
                    }
                }
                var file = $('#newElement').val();
                if (file !== null) {
                    // HTTP Request on crush
                    addNodeService(node.id, file)
                        .success(function(result) {
                            var files = file.split('/');
                            var id = node.id;
                            for (var i in files) {
                                if (i != files.length - 1) {
                                    file = files[i] + '/';
                                } else {
                                    file = files[i];
                                }
                                addNode(id+file, id, file);
                                id = id+file;
                            }
                            dialogRef.close();
                            if (node.state === undefined) {
                                reloadTree();
                            } else {
                                tree.refresh();
                            }
                        });
                }
            }
        }],
        onshown: function(dialogRef) {
            $('#newElement').focus();
        }
    });
}

// remove node from nodes array
function removeNode(id) {
    var parentNodeIndex = searchNodePosByIdinNodes(id);
    if (tree.get_node(id).type.indexOf('folder') === 0 && tree.get_node(id).state.isLoaded === true) {
        var index = searchNodesByParentinNodes(id);
        if (tree.get_node(id).state.opened === true) {
            tree.close_node(tree.get_node(id));
        }
        for (var i in index) {
            nodes.splice(index[i][0], 1);
            tree.delete_node(index[i][1]);
        }
    }
    nodes.splice(parentNodeIndex, 1);
    tree.delete_node(nodes[parentNodeIndex]);
    if (tree.get_node(id).parent === '#') {
        reloadTree();
    } else {
        tree.refresh();
    }
}

// calls to change folder state
function changeFolderState(node, openState, type) {
    if (node.id === "#") {
        tree.get_node(node.id).state.opened = openState;
        tree.get_node(node.id).type = type;
    } else {
        var nodePos = searchNodePosByIdinNodes(node.id);
        nodes[nodePos].state.opened = openState;
        nodes[nodePos].type = type;
        if (openState === true) {
            tree.open_node(nodes[nodePos]);
        } else {
            tree.close_node(nodes[nodePos]);
        }
    }
    tree.settings.core.data = nodes;
    tree.refresh();
}

// focuse the selected node
function focusSelectedNode() {
    var selected = tree.get_selected();
    if (selected.length > 0) {
        selected = document.getElementById(selected);
        if (selected !== null) {
            $('#sidebar').scrollTop(selected.offsetTop - 350);
        }
    }
}
