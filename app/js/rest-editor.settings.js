var nodes = [];   // deprecated
var tree = {};    // deprecated
var baseUrl = ''; // deprecated
var homeUrl = ''; // deprecated - now in "settings"

// basic app settings
var settings = {
    homeUrl: '/eagle',
    apiVersion: 'v1',            // seems to be unused
    limitDefault: 500,           // deprecated - now see pageSize
    limitStretch: 20000,         // deprecated - now see pageSize
    limitParam: '?limit=500',    // deprecated - now see pageSize
    pageSize: 500,
    rawEditMode: 1,              // deprecated  now see startInEditMode
    startInEditMode: true,       // if 'false' we start in Raw-Mode
    ContextDisabledDelete: true,
    ContextDisabledAdd: true,
    devBaseUrl: '',              // deprecated
    baseUrl: ''                  // deprecated
};

// routes to disallow additions or deletions (blacklist)
var security = [
    // {route: '/path/to/my/source/1/', add: true, del: false},
    // {route: '/path/to/my/source/2/', add: false, del: false}
];

// icons for the documents in the tree by FontAwesome
var iconTypes = {
    'default': {'icon': 'fa fa-file-text-o'},
    'folder-open': {'icon': 'fa fa-folder-open'},
    'folder-close': {'icon': 'fa fa-folder'},
    'file': {'icon': 'fa fa-file-text-o'},
    'loadmore': {'icon': 'fa fa-refresh'},
    'html': {'icon': 'fa fa-html5'},
    'css': {'icon': 'fa fa-css3'},
    'js': {'icon': 'fa fa-file-code-o'},
    'jpg': {'icon': 'fa fa-picture-o'},
    'png': {'icon': 'fa fa-picture-o'},
    'gif': {'icon': 'fa fa-picture-o'},
    'zip': {'icon': 'fa fa-file-archive-o'},
    'md': {'icon': 'fa fa-book'}
};
