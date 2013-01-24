<?php

$http_code = array(
	  200 => "HTTP/1.0 200 OK"
	, 400 => "HTTP/1.0 400 Bad Request"
);
$http_header = $http_code[400];
$o = 'error:no tableId';


if (isset($_REQUEST['tableId']))
{
	$tableId = $_REQUEST['tableId'];

	if (isset($_REQUEST['field']))
	{
		// one field/value pair
		$rowId = $_REQUEST['rowId'];
		$field = $_REQUEST['field'];
		$value = $_REQUEST['value'];

		if ($field == 'task' && ! preg_match('/^[a-zA-Z0-9 ]+$/', $value))
			$o = "error:`task` format mismatched";
		else {
			$o = "ok:tableId $tableId, rowId $rowId, field $field, value $value\n";
			$http_header = $http_code[200];
		}

	}
	else
	{
		$o = 'error:no field';
	}
}

// header($http_header);
print $o;
exit;