better
======

Set of quick and handy jQuery plugins

Make sure these are present in the HTML:

~~~javascript
<script type="text/javascript" src="jquery.js">
<script type="text/javascript" src="jquery.better.js">
~~~

## .better.download

Trick the browser to display a download dialog so anything prepared by javascript or any table contents will be downloaded by a user (even images!)

### Two ways to use it:

-	As a selector function.

	This snippet will let all visible rows (display != none) to be saved as .csv

	~~~ javascript
		<table>
			<tr>
				...
		</table>

		<script type="text/javascript">
			// options can be specified globally:
			$.better.defaults.downloadUrl = 'bouncefile.php';

			$("#tableToExport").better('download', {filename:'data.csv'});
		</script>
	~~~

-	As a standalone function.

	Just prepare some string, set the correct content type - and off you go:

	~~~ javascript
		var sometext = 'some text';
		$.better.download({data : sometext, type : 'text/plain', filename : 'text.txt'});
	~~~

### Options / settings

-	`method` (default `bounce`):
	-	`bounce`: Prepared data will be sent to the server and bounced back as downloadable item. 
		Note: `	downloadUrl` option should be pointed to the bounce file (check the included `bouncefile.php` for the example).
	-	`console`: Just display whatever is prepared/collected to the browser's console.

-	`downloadUrl` (default `bouncefile.php`) - a file on the server which does the bouncing.

-	`downloadType` (default: `text/plain`) - content type. `text/csv` is good as well.

- 	`downloadFilename` (default: `somefile.txt`) - a name the contents will be saved under.


## .better.panel

With this plugin you may easily attach a panel (a simple `<div />` or whatever you pass to it) to any other element on the page. Actually, the panel will be absolutely positioned relative to container.

~~~javascript
	var $newPanel = $("#container").better('panel', {
		  stick : 'top right'
		, pivot : 'middle right'
	});
~~~

`stick` option is a ref point of the container. `pivot` - which part of the panel will be aligned with container's  stick point.

Other options are: 

-	`offset` (like `offset : "10 -10"`) - move the panel to specified number of pixels from calculated top and left position

-	`height` - what height the panel will become. `inherit` - make it the same height as the container.

- 	`panel` - (like `panel : $("<div />", { text : "abcdef" })` ) - use this panel instead of default one.

-	`returnPanel` (default `true`) - return the new panel instead of container (override default jQuery behavior).


Function `$.better.plugins.panels.recalc()` is called when DOM elements resize, but if you modify your panels after they are created (say, add children to them and set panel.width=auto) yuo should call this function yourself.
