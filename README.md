better
======

Set of quick and handy jQuery plugins

Make sure these are present in the HTML:

~~~javascript
<script type="text/javascript" src="jquery.js">
<script type="text/javascript" src="jquery.better.js">
~~~

## $.better.download

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
			$.better.defaults.downloadUrl = 'bouncefile.php';

			// Save visible lines of any table as a CSV file:
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
