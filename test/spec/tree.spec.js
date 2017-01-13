baseUrl = 'http://localhost:9876';
dojoApp = {};
dojoApp.show=function() {return true;}
function getUrlPath() {
    return '/root/server/';
}
describe("test methods for jsTree - with context to the tree and REST API", function() {
    var nodes;
    var data;
    window.event = new Object();
    window.event.button = 0;
    beforeEach(function() {
        // mock tree
        tree = {
            open_node: function(node) {
                return true;
            },
            settings: {
                core: ''
            },
            refresh: function() {
                return true;
            }
        };
        nodes = [{"id":"/root/server/admin/","parent":"#","type":"folder-close","text":"admin","state":{"opened":false,"disabled":false,"selected":false,"isLoaded":false}},{"id":"/root/server/apps/","parent":"#","type":"folder-close","text":"apps","state":{"opened":false,"disabled":false,"selected":false,"isLoaded":false}},{"id":"/root/server/pages/","parent":"#","type":"folder-close","text":"pages","state":{"opened":false,"disabled":false,"selected":false,"isLoaded":false}},{"id":"/root/server/roles/","parent":"#","type":"folder-close","text":"roles","state":{"opened":false,"disabled":false,"selected":false,"isLoaded":false}},{"id":"/root/server/test1/","parent":"#","type":"folder-open","text":"test1","state":{"opened":true,"disabled":false,"selected":false,"isLoaded":true}},{"id":"/root/server/tests/","parent":"#","type":"folder-close","text":"tests","state":{"opened":false,"disabled":false,"selected":false,"isLoaded":false}},{"id":"/root/server/users/","parent":"#","type":"folder-close","text":"users","state":{"opened":false,"disabled":false,"selected":false,"isLoaded":false}},{"id":"/root/server/test1/Foo","parent":"/root/server/test1/","type":"file","text":"Foo","state":{"opend":false,"disabled":false,"selected":false}},{"id":"/root/server/test1/clientcache","parent":"/root/server/test1/","type":"file","text":"clientcache","state":{"opend":false,"disabled":false,"selected":false}},{"id":"/root/server/test1/clientcacheXX","parent":"/root/server/test1/","type":"file","text":"clientcacheXX","state":{"opend":false,"disabled":false,"selected":false}},{"id":"/root/server/test1/clientcacheXX2","parent":"/root/server/test1/","type":"file","text":"clientcacheXX2","state":{"opend":false,"disabled":false,"selected":false}},{"id":"/root/server/test1/clientcacheXX3","parent":"/root/server/test1/","type":"file","text":"clientcacheXX3","state":{"opend":false,"disabled":false,"selected":false}},{"id":"/root/server/test1/clientcacheXX4","parent":"/root/server/test1/","type":"file","text":"clientcacheXX4","state":{"opend":false,"disabled":false,"selected":false}},{"id":"/root/server/test1/credentials","parent":"/root/server/test1/","type":"file","text":"credentials","state":{"opend":false,"disabled":false,"selected":false}},{"id":"/root/server/test1/blub","parent":"/root/server/test1/","type":"file","text":"blub","state":{"opend":false,"disabled":false,"selected":false}}];

        data = {
            server: [
                'admin/', 'apps/', 'pages/', 'roles/', 'test1/', 'tests/', 'users/'
            ]
        };

        $.mockjaxSettings.logging = false;
        $.mockjax({
            url: baseUrl + getUrlPath() + "*",
            type: "GET",
            dataType: "json",
            status: 200,
            statusText: "OK",
            response: function(settings) {
                this.responseText = "random " + Math.random();
            }
        });
    });

    it ("loadData", function() {
         var resp = loadDataService();
         resp.then(function(result) {
             expect(result.status).toBe(200);
         })
    });
    it ("dataHandler for files", function() {
        expect(getDataHandler(nodes[10])).toBe(true);
    });
    it ("dataHandler for folder", function() {
        var el = function() {
            getDataHandler(nodes[4]);
        };
        expect(el).toThrow();
    });
     it ("getChilds", function() {
         var resp = getChildsService(baseUrl, nodes[5], settings.limitParam);
         resp.then(function(result) {
             expect(result.status).toBe(200);
         });
     });
    it ("parseJson", function() {
        var resp = parseJson(data, '/root/server/', '#');
        expect(resp[2]).toEqual(nodes[2]);
    });
    it ("addNode - folder", function() {
        var resp = addNode('/root/server/pages/', '#', 'pages/');
        expect(resp).toEqual(nodes[2]);
    });
    it ("addNode - file", function() {
        var resp = addNode('/root/server/test1/clientcache', '/root/server/test1/', 'clientcache');
        expect(resp).toEqual(nodes[8]);
    });
    it ("searchNode Position by ID in nodes array", function() {
        var resp = searchNodePosByIdinNodes('/root/server/test1/clientcache');
        expect(resp).toEqual(8);
    });
    it ("remove node from nodes array", function() {
        var el = function() {
            removeNode('/root/server/test1/clientcache');
        };
        // expect error because tree methods are not available!
        expect(el).toThrow();
    });
    it ("searchNodesByParentinNodes", function() {
        var resp = searchNodesByParentinNodes(nodes[4].id);
        expect(resp[0][1]).toEqual(nodes[8]);
    });
    it ("search file over request", function () {
        var resp = searchRequestService('/root/server/pages/index.html');
        resp.then(function(result) {
            expect(result.status).toBe(200);
        });
    });
    it ("changeFolderState", function() {
//        console.log(tree);
        changeFolderState(nodes[4], true, 'folder-open');
        expect(nodes[4].type).toBe('folder-open');
        expect(nodes[4].state.opened).toBe(true);
    });
});

describe("test methods for jsTree - no context to the tree or REST API", function() {
    beforeEach(function () {
        baseUrl = 'http://localhost:9876';
    });
    it ("checkUrlPermission all allowed", function() {
        security = [];
        checkUrlPermission(nodes[0]);
        expect(settings.ContextDisabledAdd).toBe(false);
        expect(settings.ContextDisabledDelete).toBe(false);
    });
    it ("checkUrlPermission general forbidden", function() {
        security = [{"route": "/root/server/", "add": false, "del": false}];
        checkUrlPermission(nodes[0]);
        expect(settings.ContextDisabledAdd).toBe(true);
        expect(settings.ContextDisabledDelete).toBe(true);
    });
    it ("checkUrlPermission delete allowed", function() {
        settings.forbiddenEdit = ['node'];
        security = [{"route": "/root/server/", "add": false, "del": true}];
        checkUrlPermission(nodes[0]);
        expect(settings.ContextDisabledAdd).toBe(true);
        expect(settings.ContextDisabledDelete).toBe(false);
    });
    it ("checkUrlPermission add allowed", function() {
        settings.forbiddenEdit = ['node'];
        security = [{"route": "/root/server/", "add": true, "del": false}];
        checkUrlPermission(nodes[0]);
        expect(settings.ContextDisabledAdd).toBe(false);
        expect(settings.ContextDisabledDelete).toBe(true);
    });
    it ("getUrlPath", function() {
        expect(getUrlPath()).toBe('/root/server/');
    });
});
