<?php
include("../../jsonwrapper.php");
include("../../util/connection.php");

$level = 1;

$params = array_merge($_GET, $_POST);

$connection = new Connection();

$query = "UPDATE preferences SET default_size = (SELECT id FROM sizes WHERE name = '".$params['default_size']."'), " .
		 		"default_days = '".$params['default_days']."', default_grams_50lbs = '".$params['default_grams_50lbs']."', " .
		 		"default_margin = '".$params['default_margin']."'";

if($connection->exec_query($query) != null)
	echo "{success:true, level:$level}";
	
if($params['original_default_grams_50lbs'] != $params['default_grams_50lbs'] && $params['default_grams_50lbs'] != "")
{
	$defaultGrams50lbs = $params['default_grams_50lbs'];
	
	if($defaultGrams50lbs != "" && $defaultGrams50lbs != 0)
		$query = "UPDATE fertilizers SET cost = (bag_cost/$defaultGrams50lbs) * grams_per_pot, updated = now()";
	else
		$query = "UPDATE fertilizers SET cost = 0, updated = now()";
			
	$connection->exec_query($query);
}
?>