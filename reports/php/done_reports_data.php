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
$job = $_POST['job_id'];
$block = $_POST['block_id'];
$plant = $_POST['plant_id'];
$employee = $_POST['employee_id'];

$dateCondition = "";
$jobCondition = "";
$blockCondition = "";
$plantCondition = "";
$completedCondition = "";
$employeeCondition = "";

//Date range
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

if($job != "" && $job != 0)
	$jobCondition = "IA.job_id = $job";	
else
	$jobCondition = "IA.job_id != 0";

if($completed != "" && $completed != 0)
	$completedCondition = "IA.completed = $completed";	
else
	$completedCondition = "IA.completed IS NOT NULL";
	
if($block != "" && $block != 0)
	$blockCondition = "I.block = $block";	
else
	$blockCondition = "I.block != 0";

if($plant != "" && $plant != 0)
	$plantCondition = "IA.inventory_id = $plant";	
else
	$plantCondition = "IA.inventory_id != 0";

if($employee != "" && $employee != 0)
	$employeeCondition = "IA.employee_id = $employee";	
else
	$employeeCondition = "(IA.employee_id <> 0 OR IA.employee_id IS NULL)";
			
/*if($status != 'All')
	$query = "SELECT IA.id, IA.status, I.date_planted, I.plant, B.id AS block_id, B.name AS block, IA.inventory_id, IA.job_id , Max(schedule_date) as fert_date, J.name as job_name, I.size, I.qty,J.type, J.ref, IA.ref_id, F.name as fert_name,IA.material_cost, IA.completed
				from inventory I inner join inventory_activity IA 
				on I.id = IA.inventory_id right join fertilizers F 
				on IA.ref_id = F.id AND IA.job_id=2 INNER JOIN jobs J 
				ON IA.job_id = J.id LEFT JOIN blocks B 
				ON I.block = B.id 
			WHERE $completedCondition AND status = '$status' AND $dateCondition AND $blockCondition AND $jobCondition AND $plantCondition AND J.name like 'Fertilizer'
			Group by I.plant";
else
	$query = "SELECT IA.id, IA.status, I.date_planted, I.plant, B.id AS block_id, B.name AS block, IA.inventory_id, IA.job_id , Max(schedule_date) as fert_date, J.name as job_name, I.size, I.qty,J.type, J.ref, IA.ref_id, F.name as fert_name,IA.material_cost, IA.completed
			from inventory I inner join inventory_activity IA 
			on I.id = IA.inventory_id right join fertilizers F 
			on IA.ref_id = F.id AND IA.job_id=2 INNER JOIN jobs J 
			ON IA.job_id = J.id LEFT JOIN blocks B 
			ON I.block = B.id 
			WHERE $dateCondition AND $blockCondition AND $jobCondition AND $plantCondition AND J.name like 'Fertilizer'
			Group by I.plant"; 
			
$rows = $conn->exec_query($query);*/

$rs = getRows($conn);
$row_count = mysql_num_rows($rs);

$rows = Array();

for($i = 0;$i < $row_count; $i++)
 {
 	$row = mysql_fetch_array($rs);

 	//read job ref
 	if($row[0] == 2 || $row[0] == 3) 	
 	{
 		if($row[1] != "")
 		{ 			
 			if($row[4] == "Fertilizer")
 				$table = "fertilizers";
 			
 			if($row[4] == "Herbicide")
 				$table = "herbicides";
 					
 			$query = "SELECT T.name as mat_name, Max(schedule_date) as mat_date
					from inventory I inner join inventory_activity IA 
					on I.id = IA.inventory_id right join ".$table." T 
					on IA.ref_id = T.id AND IA.job_id = ".$row[0]." INNER JOIN jobs J 
					ON IA.job_id = J.id LEFT JOIN blocks B 
					ON I.block = B.id 
					WHERE ".$table.".id = ".$row[9]."		
					group by I.plant"; 		
					
			echo $query;	

 			$auxRow = $conn->get_row($query);
 			
 			 			
 			if(isset($auxRow['mat_name']))
 			{
 				
 				
 				if($auxRow['mat_name'] == "Herbicide")
 				{
 					$row['herb_mat'] = $auxRow['mat_name'];
 					$row['herb_date'] = $auxRow['mat_date'];
 					
 					echo "-".$row['herb_mat']; 
 				}
 				
 				if($auxRow['mat_name'] == "Fertilizer")
 				{
 					$row['fert_mat'] = $auxRow['mat_name'];
 					$row['fert_date'] = $auxRow['mat_date'];
 				} 				
 			}
 		} 			
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
	$query = "select I.id, IA.job_id, I.plant, MAX(schedule_date) as schedule_date, J.name, I.qty, I.block, I.size, I.date_planted, J.ref
			from inventory I inner join inventory_activity IA inner join jobs J
			on IA.job_id = J.id
			group by schedule_date, I.plant";
	
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