<?php

if ( ! isset($_REQUEST['data']))
	exit;
$data = $_REQUEST['data'];
$filename = isset($_REQUEST['filename']) ? $_REQUEST['filename'] : 'somefile.csv';
$type = isset($_REQUEST['type']) ? $_REQUEST['type'] : 'text/csv';

$length = strlen($data);
header("Pragma: no-cache, public");
// header("Pragma: public");
header("Cache-Control: must-revalidate, post-check=0, pre-check=0"); 
header("Cache-Control: private",false); // required for certain browsers 
header("Expires: 0");
header("Content-type: $type");
header("Content-Disposition: attachment; filename=$filename");
header("Content-Transfer-Encoding: binary");
header("Content-Length: $length");

print $data;

/*
header("Pragma: public"); // required
header("Expires: 0"); 
header("Cache-Control: must-revalidate, post-check=0, pre-check=0"); 
header("Cache-Control: private",false); // required for certain browsers 
header("Content-type: application/x-unknown"); // I always use this
header("Content-Disposition: attachment; filename='theFilename.ext'");
header("Content-Transfer-Encoding: binary");
header("Content-Length: 177998"); // you might want to set this
readfile('/the/url/to/theFilename.ext');

*/