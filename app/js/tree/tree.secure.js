// compare actual URL with the blacklist in the security list
function checkUrlPermission(node) {
    if (security) {
        // if security is empty
        if (security.length === 0) {
            changePermissionForNotMatchingItems(node);
        }
        // if security has items
        for (var i in security) {
            // replace slash
            var route = security[i].route.replace(/\//g, '');
            var url = getUrlPath().replace(/\//g, '');
            if (node) {
                var id = node.id.replace(/\//g, '');
            }
            // check if url is secured
            if (url.match(route) !== null && url.length >= url.match(route)[0].length) {
                changePermission(security[i]);
                $("#addRootNodeBtn").prop("disabled", settings.ContextDisabledAdd);
                break;
            } else {
                // if url isn't secured check if ressource is secured
                if (node) {
                    if (id.match(route) !== null && id.length >= id.match(route)[0].length) {
                        changePermission(security[i]);
                        break;
                    } else {
                        changePermissionForNotMatchingItems(node);
                    }
                }
            }
        }
    }
}

// change permissions if an rule exists
function changePermission(element) {
    if (element.add === true) {
        settings.ContextDisabledAdd = false;
    } else {
        settings.ContextDisabledAdd = true;
    }

    if (element.del === true) {
        settings.ContextDisabledDelete = false;
    } else {
        settings.ContextDisabledDelete = true;
    }
}

// change permissions for folders and files if no rule exists
function changePermissionForNotMatchingItems(node) {
    settings.ContextDisabledDelete = false;
    settings.ContextDisabledAdd = false;
    $("#addRootNodeBtn").prop("disabled", settings.ContextDisabledAdd);
    if (node.type.indexOf('folder') !== 0 && settings.ContextDisabledAdd === false) {
        settings.ContextDisabledAdd = true;
    } else {
        settings.ContextDisabledAdd = false;
    }
}
