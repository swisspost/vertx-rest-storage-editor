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

### Build / Test ###

	npm install

You can use the following grunt commands:

	grunt               // --> clean, copy, package

	grunt build         // clean up and copy the relevant vendor files
	grunt package       // create a releasable zip package


### Development ###

	npm start

The command `npm start` starts a http-server and opens web browser with an initial URL (for comfortable development).