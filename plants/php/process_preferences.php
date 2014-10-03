<?php
include("../../jsonwrapper.php");
include("../../util/connection.php");

$level = 1;

$params = array_merge($_GET, $_POST);

$connection = new Connection();

$query = "DELETE FROM preferences";
$connection->exec_query($query);

$query = "INSERT INTO preferences (id, default_size, default_days) 
				SELECT 0, (SELECT id FROM sizes WHERE name = '".$params['default_size']."'), '".$params['default_days']."'";

if($connection->exec_query($query) != null)
	echo "{success:true, level:$level}";
?>