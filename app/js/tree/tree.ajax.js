// load data service
function loadDataService() {
    return $.ajax({
        url: baseUrl + getUrlPath() + settings.limitParam,
        type: 'GET'
    });
}

// load childs of node service
function getChildsService(url, node, param) {
    return $.ajax({
        url: baseUrl + node.id + param,
        type: 'GET'
    });
}

// new node service
function addNodeService(nodeId, file) {
    return $.ajax({
        url: baseUrl + nodeId + file,
        type: 'PUT'
    });
}

// delete node by id service
function removeNodeService(id) {
    return $.ajax({
        url: baseUrl + id,
        type: 'DELETE'
    });
}

// search a file over a REAT API call
function searchRequestService(search) {
    return $.ajax({
        type: "GET",
        url: baseUrl + search
    });
}
