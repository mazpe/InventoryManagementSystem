<?
	session_start();
	
	include_once('../general.php');
	
	if(!isset($_SESSION['username']))
		header("location: /login.php?return_url=plants/add_plant.php");
?>	
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en_US" xml:lang="en_US">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta http-equiv="Content-Language" content="en" />
	<title>Nursery Ims</title>
	
	<link rel="stylesheet" type="text/css" href="../ext22/resources/css/ext-all.css" />
	<link rel="stylesheet" type="text/css" href="../ext22/resources/css/xtheme-gray.css" />
	<link rel="stylesheet" type="text/css" href="../ext22/examples/form/forms.css"/>
	<link rel="stylesheet" type="text/css" href="../ext22/examples/grid/Ext.ux.grid.GridSummary.css"/>
	
	<script type="text/javascript" src="../ext22/adapter/ext/ext-base.js"></script>
	<script type="text/javascript" src="../ext22/ext-all.js"></script>
	
	<script type="text/javascript" src="../plants/js/add_plant.js"></script>
	<script type="text/javascript" src="../ext22/examples/grid/Ext.ux.grid.GridSummary.js"></script>
</head>
<body>
	<?
		include_once('../header.php');
	?>
	<div id="center"></div>
  	<div id='form'></div>	
	<div id="editor-grid"></div>
	<form id='general-form'></form>
</body>
</html>