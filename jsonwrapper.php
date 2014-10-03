<?php
# In PHP 5.2 or higher we don't need to bring this in
if (!function_exists('json_encode'))
{
	include($_SERVER['DOCUMENT_ROOT']."/jsonwrapper_inner.php");
}
?>