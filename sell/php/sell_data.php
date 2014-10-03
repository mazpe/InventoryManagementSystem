<?php
 include("../../util/connection.php");
  
 $reader_root = "data";

 $reader_id = "id";
  
 $rs = getRows();
 
 $row_count = mysql_num_rows($rs);
 
 $rows = Array();
 
 for($i = 0;$i < $row_count; $i++)
	$rows[]=mysql_fetch_array($rs);
 
 $json = Array();

 $json[$reader_root] = $rows;
 $json[$reader_id] = 'id';
   
 echo "".json_encode($json)."";
 
 function getRows()
 {
 	$connection = new Connection();

	$plantId = $_REQUEST['plant_id'];
	
	if($plantId != "" && $plantId != 0)
		$query = "SELECT S.id, S.id AS order_no, S.date, S.plant_id, S.qty, I.plant ".
			 "FROM sell S INNER JOIN inventory I " .
			 "ON S.plant_id = I.id " .
			 "WHERE I.id = '$plantId'";
	else
		$query = "SELECT S.id, S.id AS order_no, S.date, S.plant_id, S.qty, I.plant ".
			 "FROM sell S INNER JOIN inventory I " .
			 "ON S.plant_id = I.id ";
			 
	return $connection->getResultSet($query);
 } 
?>