// search node position in nodes array by id
function searchNodePosByIdinNodes(id) {
    var arr = [];
    for (var i in nodes) {
        arr.push(nodes[i].id);
    }
    return arr.indexOf(id);
}

// return all chields from the folder
function searchNodesByParentinNodes(parentId) {
    var arr = [];
    var res = [];
    for (var i in nodes) {
        arr.push(nodes[i].parent);
    }
    var re = parentId.replace("/", "\/")+'\w*';
    for (var j in arr) {
        if (arr[j] !== undefined) {
            if (arr[j].match(re)){
                res.push([j,nodes[j]]);
            }
        }
    }
    return res;
}

// search node over redis request
function searchRequest(search) {
    search = ['path', search];
    searchRequestService(search[1])
        .success(function(result) {
            show(search[1]);
        })
        .error(function(result){
            BootstrapDialog.show({
                title: 'Warning: This resource is not available',
                message: '<br>Your search was not successful. Try again or load tree manually and search over the visible tree.<br><hr>' + search[1] + '<br><br>',
                type: BootstrapDialog.TYPE_WARNING
            });
        });
}
