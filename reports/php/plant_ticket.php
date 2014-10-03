<?php
/*
 * This is script is used to
 * get the data of the materials.
 */
include("../../jsonwrapper.php");
include("../../util/connection.php");

$conn = new Connection();

$completed = $_GET['completed'];
$ticketId = $_GET['ticket'];

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
$material =  $_POST['material_id'];

$dateCondition = "";
$jobCondition = "";
$blockCondition = "";
$plantCondition = "";
$completedCondition = "";
$employeeCondition = "";
$materialCondition = "";

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
	$employeeCondition = "(1)";

if($material != "" && $material != 0)
	$materialCondition = " AND IA.ref_id = $material";	
else
	$materialCondition = " AND (1)";
			
if($status != 'All')
	$query = "SELECT IA.id, IA.status, I.plant, B.id AS block_id, B.name AS block, IA.inventory_id, IA.job_id , schedule_date as date, J.name as job_name, J.type, J.ref, IA.ref_id, IA.material_cost, IA.completed, L.name AS labor_name, IA.labor_cost, labor_id, IA.employee_id, E.full_name AS employee, IA.completed_date, IA.ticket, I.qty    
			FROM inventory I INNER JOIN inventory_activity IA 
			ON I.id = IA.inventory_id INNER JOIN jobs J 
			ON IA.job_id = J.id LEFT JOIN labor L
			ON IA.job_id = L.job_id AND L.id = IA.labor_id LEFT JOIN blocks B 
			ON I.block = B.id LEFT JOIN employees E 
			ON IA.employee_id = E.id 
			WHERE IA.ticket = $ticketId AND $completedCondition AND status = '$status' AND $dateCondition AND $blockCondition AND $jobCondition AND $plantCondition AND $employeeCondition $materialCondition";
else
	$query = "SELECT IA.id, IA.status, I.plant, B.id AS block_id, B.name AS block, IA.inventory_id, IA.job_id , schedule_date as date, J.name as job_name, J.type, J.ref, IA.ref_id, IA.material_cost, IA.completed, L.name AS labor_name, IA.labor_cost, labor_id, IA.employee_id, E.full_name AS employee, IA.completed_date, IA.ticket, I.qty     
			FROM inventory I INNER JOIN inventory_activity IA 
			ON I.id = IA.inventory_id INNER JOIN jobs J 
			ON IA.job_id = J.id LEFT JOIN labor L
			ON IA.job_id = L.job_id AND L.id = IA.labor_id LEFT JOIN blocks B 
			ON I.block = B.id LEFT JOIN employees E 
			ON IA.employee_id = E.id 
			WHERE IA.ticket = $ticketId AND $dateCondition AND $blockCondition AND $jobCondition AND $plantCondition AND $employeeCondition $materialCondition"; 

$rows = $conn->exec_query($query);
$newRows = array();

while($row = mysql_fetch_assoc($rows))
{
	$cont++;
	$materialInfo 	= getMaterialInfo($row['ref'],$row['ref_id']);

	if(is_array($materialInfo))
	{
		foreach($materialInfo as $field => $value)
		{
			$row[$field] = $value;
		}
	}

	/*if(is_array($laborInfo))
	{
		foreach($laborInfo as $field => $value)
		{
			$row[$field] = $value;
		}
	}*/
	$newRows[] = $row;
}

 $json = array();
 $json["data"] = $newRows;
 $json["id"] = "plants";
 $json["totalCount"] = $cont;

 echo "".json_encode($json)."";

function getMaterialInfo($ref,$id)
{
	global $conn;
	if($ref <> "other" && $ref <> "" )
	{

		$query = " select id as id_material, name as material_name, cost as cost_name from $ref where id = '$id' ";

		$results = $conn->exec_query($query);

		if($results)
		{
			return mysql_fetch_assoc($results);
		}
	}
	else
	{
		return "";
	}
}
?>