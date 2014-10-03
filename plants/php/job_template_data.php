<?php
 include("../../util/connection.php");
  
 $reader_root = "data";

 $reader_id = "id";

 $connection = new Connection();
   
 $rs = getRows($connection);
 
 $row_count = mysql_num_rows($rs);
 
 $rows = Array();
 
 for($i = 0;$i < $row_count; $i++)
 {
 	$row = mysql_fetch_array($rs);
 	
 	//read job ref
 	if($row[0] == 2 || $row[0] == 4) 	
 	{
 		if($row[1] != "")
 		{
 			$query = "SELECT cost, name, days FROM ".$row[1]." WHERE id = ".$row[2];
 			$auxRow = $connection->get_row($query);
 			
 			if(isset($auxRow['cost']))
 			{
 				$row['material_cost'] = $auxRow['cost'];
 				$row['material'] = $auxRow['name'];
 				$row['days'] = $auxRow['days'];
 			}
 		} 			
 	}
 		
 	$rows[]=$row;
 }
	
 $json = Array();

 $json[$reader_root] = $rows;
 $json[$reader_id] = 'id';
   
 echo "".json_encode($json)."";
 
 function getRows($connection)
 {
 	/**
	 * We need to specify the orden of the fields to allow a correct select on the top when fetching the rows.
	 */
	//WHERE template_id = ".$_POST['template_id']." AND completed = ".$_POST['completed'];

	$query = "SELECT J.type, J.ref, id_material, J.id, JT.job_id AS id_job, id_labor, L.cost AS labor_cost, L.name AS labor, completed, J.name  
				FROM job_template JT INNER JOIN jobs J  
				ON JT.job_id = J.id LEFT JOIN labor L  
				ON L.id = JT.id_labor   
			 WHERE template_id = ".$_POST['template_id']." AND completed = ".$_POST['completed'];
	
	$dir = $_POST['dir']; // DESC or ASC
	$sort = $_POST['sort'];// the column

	$dir = (isset($dir)? $dir : "ASC");
	$sort = (isset($sort)? $sort : "J.`position`");

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