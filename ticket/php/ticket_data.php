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

	$query = "SELECT COUNT(IA.id) AS job_count, T.id, T.created, T.status, J.name AS job_type  
				FROM ticket T LEFT JOIN inventory_activity IA 
				ON T.id = IA.ticket LEFT JOIN jobs J 
				ON IA.job_id = J.id 
				GROUP BY T.id";

	$dir = $_POST['dir']; // DESC or ASC
	$sort = $_POST['sort'];// the column

	$dir = (isset($dir)? $dir : "ASC");
	$sort = (isset($sort)? $sort : "id");

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