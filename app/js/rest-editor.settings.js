var nodes = [];   // deprecated
var tree = {};    // deprecated
var baseUrl = ''; // deprecated
var homeUrl = ''; // deprecated

// basic app settings
var settings = {
    apiVersion: 'v1',
    limitDefault: 500,    // deprecated
    limitStretch: 20000,  // deprecated
    pageSize: 500,
    limitParam: '?limit=500', // deprecated
    rawEditMode: 1,
    ContextDisabledDelete: true,
    ContextDisabledAdd: true,
    devBaseUrl: '',    // deprecated
    baseUrl: ''        // deprecated
};

// routes to not allow additions or deletions (blacklist)
var security = [
    {route: '/path/to/my/source/1/', add: true, del: false},
    {route: '/path/to/my/source/2/', add: false, del: false}
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
