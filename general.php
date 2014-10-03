<?php
/*
 * Created on Jul 12, 2007
 *
 * To change the template for this generated file go to
 * Window - Preferences - PHPeclipse - PHP - Code Templates
 */

/**
 * The real url for the specific file. 
 * @param {String} path
 * @param {String} file
 * 
 * @return {String}
 */
  
function getURL($path, $file)
{
	$url = "http://".$_SERVER['SERVER_NAME'].":".$_SERVER['SERVER_PORT'].$_SERVER['PHP_SELF'];
	
	$firstIndex = strpos($url, $path);
	
	$baseURL = substr($url, 0, $firstIndex);
	
	$newURL = $baseURL.$path.'/'.$file;
	  
	return $newURL;
}
?>
