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

	$query = "SELECT P.id, P.template, P.plant, S.name as size, P.days ".
			 "from plant_template P inner join sizes  S on  P.size_id = S.id";

	$dir = $_POST['dir']; // DESC or ASC
	$sort = $_POST['sort'];// the column

	$dir = (isset($dir)? $dir : "ASC");
	$sort = (isset($sort)? $sort : "template");

	$query .= " ORDER BY $sort $dir ";
	
 	if(isset($_POST['limit']))
 	{
		$limit = $_POST['limit']; //the pagesize
		$start = $_POST['start']; //Offset
		
		$query .= "LIMIT $start, $limit";
 	}	

	return $connection->getResultSet($query);
 } 
?>