better
======

Set of quick and handy jQuery plugins

Make sure these are present in the HTML:

~~~javascript
<script type="text/javascript" src="jquery.js">
<script type="text/javascript" src="jquery.better.js">
~~~

## $.better.download

Trick the browser to download anything prepared by javascript or even a table

Two ways to use it:

-	as a selector function:

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

-	as a standalone function:

	~~~ javascript
		var sometext = 'some text';
		$.better.download({data : sometext, type : 'text/plain', filename : 'text.txt'});
	~~~

### Options / settings

Might be specified as an options hash or individually by `$.better.defaults.*`

~~~
Option           | Default        | Meaning
-----------------+----------------+-----------------------------------------------------
downloadUrl      | bouncefile.php | A php script that does simple thing - returns 
                 |                | the specified data to the browser setting 
                 |                | a filename and a content type.
                 |                |
downloadType     | text/plain     | The content type. Most likely, text/csv will be used
                 |                |
downloadFilename | somefile.txt   | A required filename
~~~



