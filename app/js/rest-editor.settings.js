var nodes = [];
var tree = {};
var baseUrl = '';
var homeUrl = '';

// basic app settings
var settings = {
    apiVersion: 'v1',
    limitDefault: 500,
    limitStretch: 20000,
    limitParam: '?limit=500',
    rawEditMode: 1,
    ContextDisabledDelete: true,
    ContextDisabledAdd: true,
    devBaseUrl: "",
    baseUrl: ""
};

// routes to not allow additions or deletions (blacklist)
var security = [
    {"route": "/path/to/my/source/1/", "add": true, "del": false},
    {"route": "/path/to/my/source/2/", "add": false, "del": false}
];

// icons for the documents in the tree by FontAwesome
var iconTypes = {
    "default": {"icon": "fa fa-file-text-o"},
    "folder-open": {"icon": "fa fa-folder-open"},
    "folder-close": {"icon": "fa fa-folder"},
    "file": {"icon": "fa fa-file-text-o"},
    "loadmore": {"icon": "fa fa-refresh"},
    "html": {"icon": "fa fa-html5"},
    "css": {"icon": "fa fa-css3"},
    "js": {"icon": "fa fa-file-code-o"},
    "jpg": {"icon": "fa fa-picture-o"},
    "png": {"icon": "fa fa-picture-o"},
    "gif": {"icon": "fa fa-picture-o"},
    "zip": {"icon": "fa fa-file-archive-o"},
    "md": {"icon": "fa fa-book"}
};

// help text
var help = {
    "title": "vertx-rest-storage-editor",
    "search": {
        "text": [
            "<b class=\"help-text\">Direct search and direct loading mode</b><br>",
            "<span class=\"help-subtext\">Search:<br>This search can only find results in the loaded and visible tree.<br>The regex works like a <i>*word*</i>.</span><br>",
            "<span class=\"help-subtext\">Search over an URL on the rest-storage:<br> Enter an rest-storage URL and the editor will open the ressource if it exists.</span><br>"
        ],
        "icon": "<i class=\"help-icon fa fa-bars\"></i>"
    },
    "tree": {
        "text": "<b class=\"help-text\">Fade-out or fade-in the tree.</b><br>",
        "icon": "<i class=\"help-icon fa fa-arrows-h\"></i>"
    },
    "reset": {
        "text": "<b class=\"help-text\">Reset search.</b><br>",
        "icon": "<i class=\"help-icon fa fa-reply-all\"></i>"
    },
    "reload": {
        "text": "<b class=\"help-text\">It will reload the tree completely.</b><br>",
        "icon": "<i class=\"help-icon fa fa-refresh\"></i>"
    },
    "raw": {
        "text": "<b class=\"help-text\">Switch between the raw mode and the Ace editor mode.</b><br>",
        "icon": "<i class=\"help-icon fa fa-pencil\"></i>"
    },
    "node": {
        "text": "<b class=\"help-text\">Add a new node with a specific Path or add a new Rootnode.</b><br>",
        "icon": "<i class=\"help-icon fa fa-plus\"></i>"
    },
    "help": {
        "text": "<b class=\"help-text\">Help for the rest-storage editor.</b><br>",
        "icon": "<i class=\"help-icon fa fa-question\"></i>"
    },
    "top": {
        "text": "<b class=\"help-text\">Scroll to the top of the tree.</b><br>",
        "icon": "<i class=\"help-icon fa fa-arrow-up\"></i>"
    },
    "bottom": {
        "text": "<b class=\"help-text\">Scroll to the end of the tree.</b><br>",
        "icon": "<i class=\"help-icon fa fa-arrow-down\"></i>"
    },
    "copyright": {
        "text": "<b class=\"help-text\">vertx-rest-storage-editor by swisspush 2017</b><br>",
        "icon": "<i class=\"help-icon fa fa-copyright\"></i>"
    }
}
