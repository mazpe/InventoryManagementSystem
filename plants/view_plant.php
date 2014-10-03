<?
	session_start();
	
	include_once('../general.php');
	
	if(!isset($_SESSION['username']))
		header("location: /login.php?return_url=view_plant/view_plant.php?id=".$_GET['id']);
	
	include("../util/connection.php");
	
	$plant_info = getPlantInfo($_GET['id']);
	
	if(! is_array($plant_info))
		$plant_info = array();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en_US" xml:lang="en_US">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta http-equiv="Content-Language" content="en" />
	<title>Nursery Ims</title>

	<link rel="stylesheet" type="text/css" href="../ext22/resources/css/ext-all.css" />
	<!--link rel="stylesheet" type="text/css" href="../ext22/resources/css/xtheme-gray.css" /-->
	<link rel="stylesheet" type="text/css" href="../ext22/examples/form/forms.css"/>
	<link rel="stylesheet" type="text/css" href="../ext22/examples/grid/Ext.ux.grid.GridSummary.css"/>
	
	<script type="text/javascript" src="../ext22/adapter/ext/ext-base.js"></script>
	<script type="text/javascript" src="../ext22/ext-all.js"></script>
	
	<script type="text/javascript" src="../ext22/examples/grid/GroupSummary.js"></script>
	<script type="text/javascript" src="../ext22/examples/grid/Ext.ux.grid.GridSummary.js"></script>	
	<script type="text/javascript" src="../plants/js/view_plant.js"></script>
	
	<script type="text/javascript">
		var plantInfo = { 	
						<?
							$cont = 0;
							foreach(array_keys($plant_info) as $key)
							{
								echo $key."		: '{$plant_info[$key]}'";
								
								if($cont+1 != count(array_keys($plant_info)))
									echo ",\n";
								else
									echo "\n";
								
								$cont++;						
							}
						?>
						 };
	</script>
	
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
<?
	include_once('../header.php');
?>
<div id="center"></div>
<input type="hidden" value='<?= $_GET['id'] ?>' id='plant-id' />
<input type="hidden" value='<?= $plant_info['plant'] ?>' id='plant-name' />

<div id='form'></div>

<div id="editor-grid"></div>

<form id='general-form'></form>

<div id="hello-win" class="x-hidden">
    <div class="x-window-header">Add Jobs</div>

    <div id="hello-tabs">
        
    </div>
</div>
</body>
</html>
<?
function getPlantInfo($id  = "0")
{
	$conn = new Connection();

	$sql = " select * from inventory where id='$id' ";
	return $conn->get_row($sql);
}
?>