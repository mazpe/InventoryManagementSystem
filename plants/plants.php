<?
	session_start();
	
	include_once('../general.php');
	
	if(!isset($_SESSION['username']))
		header("location: /login.php?return_url=plants/plants.php");
?>	
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en_US" xml:lang="en_US">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta http-equiv="Content-Language" content="en" />

	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta http-equiv="Content-Language" content="en" />
	<title>Nursery Ims</title>

	<script type="text/javascript" src="/ext22/adapter/ext/ext-base.js"></script>
	<script type="text/javascript" src="/ext22/ext-all.js"></script>
	<link rel="stylesheet" type="text/css" href="/ext22/resources/css/ext-all.css" />
	
	<script type="text/javascript" src="/plants/js/plants.js"></script>
	<script type="text/javascript" src="/ext22/examples/grid/GroupSummary.js"></script>
	<script type="text/javascript" src="/ext22/examples/grid/Ext.ux.grid.GridSummary.js"></script>

	<style type="text/css">
		.x-grid3-summary-row {
		    border-left:1px solid #fff;
		    border-right:1px solid #fff;
		    color:#333;
		    background: #f1f2f4;
		}
		.x-grid3-summary-row .x-grid3-cell-inner {
		    font-weight:bold;
		    padding-bottom:4px;
		}
		.x-grid3-cell-first .x-grid3-cell-inner {
		    padding-left:16px;
		}
		.x-grid-hide-summary .x-grid3-summary-row {
		    display:none;
		}
		.x-grid3-summary-msg {
		    padding:4px 16px;
		    font-weight:bold;
		}
	</style>

</head>
<body>
	<div id="north">
		<?
			include_once('../header.php');
		?> 
  	</div>
  	<div id="center"></div>
</body>
</html>