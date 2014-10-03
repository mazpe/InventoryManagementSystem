<?php
/*
 * This is script is used to
 * get the data of the materials.
 */
include("../../jsonwrapper.php");
include("../../util/connection.php");

$conn = new Connection();

	$completed = $_GET['completed'];
	$status = "";
	
	if(isset($_POST['status']))
		$status = $_POST['status'];
	else
		if(isset($_GET['status']))
			$status = $_GET['status'];
	
	if($status == "")
		$status = "All";
		
	$dateRange = $_POST['date_range'];
	
	$employee = $_POST['employee_id'];
	
	$dateCondition = "";


	$completedCondition = "";

	//Date range
	if(isset($_POST['start'])&& isset($_POST['end']))
		$dateCondition = "IA.schedule_date >= '".$_POST['start']."' AND IA.schedule_date <= '".$_POST['end']."'";	
	else
		if($dateRange != '' && $dateRange != 'All')
		{
			if($dateRange == 'This Week')
				$dateCondition = "IA.schedule_date BETWEEN date_sub(curdate(),INTERVAL WEEKDAY(curdate()) -0 DAY) AND date_add(curdate(),INTERVAL 6 - WEEKDAY(curdate()) DAY)";
			else
				if($dateRange == 'This Year')
					$dateCondition = "YEAR(IA.schedule_date) = YEAR(now())";
				else		
					if($dateRange == 'Month to Date')
						$dateCondition = "(YEAR(IA.schedule_date) = YEAR(now()) AND MONTH(IA.schedule_date) = MONTH(now()) AND IA.schedule_date <= now())";
					else
						if($dateRange == 'Year to Date')
							$dateCondition = "(YEAR(IA.schedule_date) = YEAR(now()) AND IA.schedule_date <= now())";
						else
							$dateCondition = "IA.schedule_date IS NOT NULL";
		}	
		else
			$dateCondition = "IA.schedule_date IS NOT NULL";
		
	
	if($completed != "" && $completed != 0)
		$completedCondition = "IA.completed = $completed";	
	else
		$completedCondition = "IA.completed IS NOT NULL";
		
	
	
	if($employee != "" && $employee != 0)
		$employeeCondition = "IA.employee_id = $employee";	
	else
		$employeeCondition = "(IA.employee_id <> 0 OR IA.employee_id IS NULL)";
	
	$rs = getRows($conn);
	$rows = Array();
		
	while($row = mysql_fetch_assoc($rs))
	{
		$query = "SELECT ref_id, schedule_date AS fert_date, name AS fert_mat
					FROM inventory I inner join inventory_activity IA 
					ON I.id = IA.inventory_id INNER JOIN fertilizers F
					ON IA.ref_id = F.id
					WHERE job_id = 2 AND inventory_id = ".$row['id']." AND completed = 1 AND $dateCondition 
					ORDER BY schedule_date DESC
					LIMIT 1";
		
		$auxRow = $conn->get_row($query);
 			
 			if(isset($auxRow['ref_id']))
 			{
 				$row['fert_mat'] = $auxRow['fert_mat'];
 				$row['fert_date'] = $auxRow['fert_date']; 			
 			}				
 			
 		$query = "SELECT ref_id, schedule_date AS herb_date, name AS herb_mat
				  FROM inventory I inner join inventory_activity IA 
				  ON I.id = IA.inventory_id INNER JOIN herbicides H
				   ON IA.ref_id = H.id
				  WHERE job_id = 3 AND inventory_id = ".$row['id']." AND completed = 1 AND $dateCondition 
					ORDER BY schedule_date DESC
					LIMIT 1";
		
		$auxRow = $conn->get_row($query);
		
		 	if(isset($auxRow['ref_id']))
 			{
 				$row['herb_mat'] = $auxRow['herb_mat'];
 				$row['herb_date'] = $auxRow['herb_date']; 			
 			}		
 		$rows[]=$row;						
	}	
	
	 $json = array();
	 $json["data"] = $rows; 
	 $json["id"] = "plants";
	 $json["totalCount"] = $cont;
	
	 echo "".json_encode($json)."";

 function getRows($connection)
 {
 	$completed = $_GET['completed'];
	$status = "";
	
	if(isset($_POST['status']))
		$status = $_POST['status'];
	else
		if(isset($_GET['status']))
			$status = $_GET['status'];
	
	if($status == "")
		$status = "All";
 	
 	$dateRange = $_POST['date_range'];
 	$employee = $_POST['employee_id'];	
 	$block = $_POST['block_id'];
	$plant = $_POST['plant_id'];
	$size = $_POST['size_id'];
	$name = $_POST['plant'];
	
	$dateCondition = "";
	$blockCondition = "";
	$plantCondition = "";
	$sizeCondition = "";
	$nameCondition = "";
	
	if($dateRange != '' && $dateRange != 'All')
	{
		if($dateRange == 'This Week')
			$dateCondition = "IA.schedule_date BETWEEN date_sub(curdate(),INTERVAL WEEKDAY(curdate()) -0 DAY) AND date_add(curdate(),INTERVAL 6 - WEEKDAY(curdate()) DAY)";
		else
			if($dateRange == 'This Year')
				$dateCondition = "YEAR(IA.schedule_date) = YEAR(now())";
			else		
				if($dateRange == 'Month to Date')
					$dateCondition = "(YEAR(IA.schedule_date) = YEAR(now()) AND MONTH(IA.schedule_date) = MONTH(now()) AND IA.schedule_date <= now())";
				else
					if($dateRange == 'Year to Date')
						$dateCondition = "(YEAR(IA.schedule_date) = YEAR(now()) AND IA.schedule_date <= now())";
					else
						$dateCondition = "IA.schedule_date IS NOT NULL";
	}	
	else
		$dateCondition = "IA.schedule_date IS NOT NULL";
	
		
 	if($block != "" && $block != 0)
		$blockCondition = "I.block = $block";	
	else
		$blockCondition = "I.block != 0";
	
	if($plant != "" && $plant != 0)
		$plantCondition = "I.id = $plant";	
	else
		$plantCondition = "I.id != 0";
	
	if($size != "" && $size != 0)
		$sizeCondition = "I.size = $size";	
	else
		$sizeCondition = "I.size != 0";
	
	if($name != "" && $name != "All")
		$nameCondition = "I.plant = '$name'";	
	else
		$nameCondition = "(1)";
				
	$query = "SELECT B.name as block, I.id as id, S.name as size, plant, qty, date_planted, 
				(SELECT MAX(schedule_date) FROM inventory_activity IA WHERE job_id = 5 AND inventory_id = I.id AND completed = 1 AND $dateCondition) AS cut,
				(SELECT MAX(schedule_date) FROM inventory_activity IA WHERE job_id = 21 AND inventory_id = I.id AND completed = 1 AND $dateCondition) AS weed,
				(SELECT MAX(schedule_date) FROM inventory_activity IA WHERE job_id = 22 AND inventory_id = I.id AND completed = 1 AND $dateCondition) AS spray				
				FROM inventory I INNER JOIN blocks B
				ON I.block = B.id INNER JOIN sizes S
				ON I.size = S.id
				WHERE $blockCondition AND $plantCondition AND $sizeCondition AND $nameCondition";

	$dir = $_POST['dir']; // DESC or ASC
	$sort = $_POST['sort'];// the column

	$dir = (isset($dir)? $dir : "ASC");
	$sort = (isset($sort)? $sort : "I.plant");

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