<?php

if ( ! isset($_REQUEST['data']))
	exit;
$data = $_REQUEST['data'];
$filename = isset($_REQUEST['filename']) ? $_REQUEST['filename'] : 'somefile.csv';
$type = isset($_REQUEST['type']) ? $_REQUEST['type'] : 'text/csv';

header("Content-type: $type");
header("Content-Disposition: attachment; filename=$filename");
header("Pragma: no-cache");
header("Expires: 0");

print $data;