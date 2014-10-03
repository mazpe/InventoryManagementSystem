<?php
/*
 * This is script is used to
 * get the data of the materials.
 */
include("../../jsonwrapper.php");
include("../../util/connection.php");

$conn = new Connection();

$dateRange = $_POST['date_range'];
$job = $_POST['job_id'];
$employee = $_POST['employee_id'];
$name = $_POST['plant'];

$dateCondition = "";
$jobCondition = "";
$blockCondition = "";
$plantCondition = "";
$completedCondition = "";
$employeeCondition = "";
$materialCondition = "";
$nameCondition = "";

//Date range
if(isset($_POST['start']) && isset($_POST['end']) && $_POST['start'] == "" && $_POST['end'] == "")
	$dateCondition = "IA.completed_date <= curdate()";
else
if(isset($_POST['start']) && isset($_POST['end']) && $_POST['start'] != "" && $_POST['end'] == "")
	$dateCondition = "IA.completed_date >= '".$_POST['start']."'";
else
if(isset($_POST['start']) && isset($_POST['end']) && $_POST['start'] == "" && $_POST['end'] != "")
	$dateCondition = "IA.completed_date <= '".$_POST['end']."'";
else
if(isset($_POST['start']) && isset($_POST['end']) && $_POST['start'] != ""&& $_POST['end'] != "")
	$dateCondition = "IA.completed_date >= '".$_POST['start']."' AND IA.completed_date <= '".$_POST['end']."'";
else
	if($dateRange != '' && $dateRange != 'All')
	{
		if($dateRange == 'Past Due')
			$dateCondition = "IA.completed_date <= curdate()";
		else
		if($dateRange == 'This Week')
			$dateCondition = "IA.completed_date BETWEEN date_sub(curdate(),INTERVAL WEEKDAY(curdate()) - 0 DAY) AND date_add(curdate(),INTERVAL 6 - WEEKDAY(curdate()) DAY)";
		else
			if($dateRange == 'This Year')
				$dateCondition = "YEAR(IA.completed_date) = YEAR(now())";
			else		
				if($dateRange == 'Month to Date')
					$dateCondition = "(YEAR(IA.completed_date) = YEAR(now()) AND MONTH(IA.completed_date) = MONTH(now()) AND IA.completed_date <= now())";
				else
					if($dateRange == 'Year to Date')
						$dateCondition = "(YEAR(IA.completed_date) = YEAR(now()) AND IA.completed_date <= now())";
					else
						$dateCondition = "IA.completed_date IS NOT NULL";
	}
	else
		$dateCondition = "IA.completed_date IS NOT NULL";

if($job != "" && $job != 0)
	$jobCondition = "IA.job_id = $job";	
else
	$jobCondition = "IA.job_id != 0";

if($employee != "" && $employee != 0)
	$employeeCondition = "TP.employee_id = $employee";	
else
	$employeeCondition = "(1)";

if($name != "" && $name != "All")
	$nameCondition = "I.plant = '$name'";	
else
	$nameCondition = "(1)";
				
$query = 	" SELECT E.full_name, J.name AS job, IA.completed_date, I.qty, I.plant, TP.cost".
			" FROM ticket T INNER JOIN inventory_activity IA".
			" ON T.id = IA.ticket INNER JOIN ticket_piece_work TP".
			" ON T.id = TP.ticket INNER JOIN inventory I ".
			" ON I.id = IA.inventory_id INNER JOIN employees E".
			" ON TP.employee_id = E.id INNER JOIN jobs J".
			" ON IA.job_id = J.id".
			" WHERE T.status = 'Closed' AND $nameCondition AND $employeeCondition AND $dateCondition AND $jobCondition";

//echo $query;

$rs = $conn->exec_query($query);
$rows = array();

while($row = mysql_fetch_assoc($rs))
{
	$rows[] = $row;
	
	/*$cont++;
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
	//$newRows[] = $row;
}

 $json = array();
 $json["data"] = $rows;
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