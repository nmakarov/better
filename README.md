better
======

Set of quick and handy jQuery plugins

## $.better.download

Trick the browser to download anything prepared by javascript or even a table


### Quick start

~~~
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="jquery.better.js"></script>

<script type="text/javascript">
	$.better.defaults.downloadUrl = 'bouncefile.php';

	// Save visible lines of any table as a CSV file:
	$("#tableToExport").better('download', {filename:'data2.csv'});

	// Save some arbitrary text:
	$.better.download({data : 'some text', type : 'text/csv', filename : 'text.csv'});

</script>
~~~

### Options / settings

Might be specified as an options hash or individually by `$.better.defaults.*`

Option | Default | Meaning
-------+---------+--------
downloadUrl | bouncefile.php | A php script that does simple thing - returns the specified data to the browser setting a filename and a content type.
downloadType | text/plain | The content type. Most likely, text/csv will be used
downloadFilename | somefile.txt | A required filename




