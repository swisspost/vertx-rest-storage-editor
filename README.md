<p align='right'>A <a href="http://www.swisspush.org">swisspush</a> project <a href="http://www.swisspush.org" border=0><img align="top"  src='https://1.gravatar.com/avatar/cf7292487846085732baf808def5685a?s=32'></a></p>

## vertx-rest-storage-editor ##

### What is this for an editor? ###

This editor and tree was specific builded for the [vertx-rest-storage](https://github.com/swisspush/vertx-rest-storage) to show and manage the hosted resources.
The Tree is based on the project [jstree](https://github.com/vakata/jstree/releases), the editor is based on [jquery](https://github.com/jquery/jquery) and the [ace-editor](https://github.com/ajaxorg/ace).

### How to use it ###

Download the newest version as zip from Github and extract it in a folder on the [vertx-rest-storage](https://github.com/swisspush/vertx-rest-storage). The easiest way to deploy this application (as a zip file) is over the [vertx-rest-mirror](https://github.com/swisspush/vertx-rest-mirror).

In a other way you can build and test it yourself (see `Build / Test` at the end of the page).

### Editor configuration ###

In the folder `app/js/` you will find the `rest-editor.settings.js` file. In this file you can setup some parameters for the rest editor.

**settings:**

	apiVersion: String - if you use a REST-API version
	limitDefault: int - how many data-records will initially loaded
	limitStretch: int - how many data-records will be loaded when you click on the "load more" button
	limitParam: String - get parameter for the amout of data-records
	rawEditMode: int - 1 if you want to see the code as default (0 is for render mode)
	ContextDisabledDelete: Boolean - default status of the contextmenu (delete button)
	ContextDisabledAdd: Boolean - default status of the contextmenu (add button)
	devBaseUrl: String - overwrite localhost, if you want to connect on an other system
    baseUrl: String - overwrite baseUrl, if you want to connect on an other system

**security blacklist:**

Set an entry for an URL you want to restrict.
Every restriction is recoursive!

	[
	    {"route": "/path/to/my/source/1/", "add": true, "del": false},
	    {"route": "/path/to/my/source/2/", "add": false, "del": false}
	]

**icon types by FontAwesome:**

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

### Build / Test ###

	npm install

You can use the following grunt commands:

	grunt               // execute clean, copy

	grunt build			// clean up and copy the relevant vendor files
	grunt test  		// execute karma tests
	grunt package		// create a releasable zip package



### Development ###

	npm start

The command `npm start` starts an dev-server (lite-server) with an auto-reloading feature for an comfortable development.