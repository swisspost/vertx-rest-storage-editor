// basic app settings
var settings = {
    homeUrl: '/eagle',
    pageSize: 500,
    startInEditMode: true,       // if 'false' we start in Raw-Mode
    deleteRecursiveVisible: false,
    uploadUrl: '/server/upload',
    exportUrlParameter: '?export'
};

// routes to disallow additions or deletions (blacklist)
var security = [
    // {route: '/', add: true, del: false},                  // matches all collections
    // {route: '/path/to/source/1', add: true, del: false, import: false, export: false},  // matches URLs which 'ends' with this pattern - so this is a single resource
    // {route: '/path/to/source/', add: false, del: false, import: true},  // matches the collection - but _not_ it's children
    // {route: '/path/to/all/.*', add: false, del: false, export: false}    // if you want to 'lock' a whole tree (incl. subntree), append ".*"
];

// icons for the documents in the tree by FontAwesome - not used at the moment
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
