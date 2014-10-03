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

if(isset($_GET['status']))
	$status = $_GET['status'];
else
	if(isset($_GET['status']))
		$status = $_GET['status'];

if($status == "")
	$status = "All";

if(isset($_GET['date_range']))	
	$dateRange = $_GET['date_range'];

if(isset($_GET['job_id']))	
	$job = $_GET['job_id'];

if(isset($_GET['block']))
	$block = $_GET['block'];

if(isset($_GET['plant_id']))
	$plant = $_GET['plant_id'];
	
if(isset($_GET['employee_id']))	
	$employee = $_GET['employee_id'];

if(isset($_GET['status']))
	$material =  $_GET['status'];

$dateCondition = "";
$jobCondition = "";
$blockCondition = "";
$plantCondition = "";
$completedCondition = "";
$employeeCondition = "";
$materialCondition = "";

//Date range
if(isset($_GET['start'])&& isset($_GET['end']))
	$dateCondition = "IA.schedule_date >= '".$_GET['start']."' AND IA.schedule_date <= '".$_GET['end']."'";
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
	$query = "SELECT IA.id, IA.status, I.plant, B.id AS block_id, B.name AS block, IA.inventory_id, IA.job_id , schedule_date as date, J.name as job_name, J.type, J.ref, IA.ref_id, IA.material_cost, IA.completed, L.name AS labor_name, IA.labor_cost, labor_id, IA.employee_id, E.full_name AS employee, IA.completed_date, IA.ticket, FORMAT(I.qty, 0) AS qty     
			FROM inventory I INNER JOIN inventory_activity IA 
			ON I.id = IA.inventory_id INNER JOIN jobs J 
			ON IA.job_id = J.id LEFT JOIN labor L
			ON IA.job_id = L.job_id AND L.id = IA.labor_id LEFT JOIN blocks B 
			ON I.block = B.id LEFT JOIN employees E 
			ON IA.employee_id = E.id 
			WHERE IA.ticket = $ticketId AND $completedCondition AND status = '$status' AND $dateCondition AND $blockCondition AND $jobCondition AND $plantCondition AND $employeeCondition $materialCondition";
else
	$query = "SELECT IA.id, IA.status, I.plant, B.id AS block_id, B.name AS block, IA.inventory_id, IA.job_id , schedule_date as date, J.name as job_name, J.type, J.ref, IA.ref_id, IA.material_cost, IA.completed, L.name AS labor_name, IA.labor_cost, labor_id, IA.employee_id, E.full_name AS employee, IA.completed_date, IA.ticket, FORMAT(I.qty, 0) AS qty      
			FROM inventory I INNER JOIN inventory_activity IA 
			ON I.id = IA.inventory_id INNER JOIN jobs J 
			ON IA.job_id = J.id LEFT JOIN labor L
			ON IA.job_id = L.job_id AND L.id = IA.labor_id LEFT JOIN blocks B 
			ON I.block = B.id LEFT JOIN employees E 
			ON IA.employee_id = E.id 
			WHERE IA.ticket = $ticketId AND $dateCondition AND $blockCondition AND $jobCondition AND $plantCondition AND $employeeCondition $materialCondition"; 

$dir = $_GET['dir']; // DESC or ASC
$sort = $_GET['sort'];// the column

$dir = (isset($dir) ? $dir : "ASC");
$sort = (isset($sort)? $sort : "I.plant");

$query .= " ORDER BY $sort $dir ";

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

 $start = "";
 $end = "";
 $title = "";
 
 if(isset($_GET['start'])&& isset($_GET['end']))
 {
 	$start = $_GET['start'];
 	$end = $_GET['end'];
	
	$title = $start." - ".$end;
 }
 else
 {
 	$query = "";
 	
 		if($dateRange != '' && $dateRange != 'All')
		{
			if($dateRange == 'This Week')
			{
				$query = "SELECT DATE_FORMAT(date_sub(curdate(), INTERVAL WEEKDAY(curdate()) -0 DAY), '%m/%d/%Y') as start, DATE_FORMAT(date_add(curdate(), INTERVAL 6 - WEEKDAY(curdate()) DAY), '%m/%d/%Y') as end";
				$row = $conn->get_row($query);
				
				$start = $row['start'];
				$end = $row['end'];											
			}				
			else
				if($dateRange == 'This Year')
				{
					$start = date("Y")."/01/01";
					$end = date("Y")."/12/31";
				}						
				else		
					if($dateRange == 'Month to Date')
					{
						$start = date("Y")."/".date("m")."/01";
						$end = date("Y")."/".date("m")."/".date("d");						
					}	
					else
						if($dateRange == 'Year to Date')
						{
							$start = date("Y")."/01/01";
							$end = date("Y")."/".date("m")."/".date("d"); 		
						}	
		}	
		
		if($start != "" && $end != "")
			$title = $start." - ".$end;
		else
			$title = "All";
 }

?>
<head>
	<link rel="stylesheet" type="text/css" href="../print/css/report_print.css" />
</head>
<body>
<html>
		<div align=center style="width:500px">Jobs Ticket</div>
		<div align=center style="width:500px"><? echo $title;?></div>
	<table align=left border=1px cellspacing=0 cellmargin=0 class='jobs-pending-table'>
		<caption id="table-caption">&nbsp;</caption>			
		<th width = '50' class= 'jos-pending-header'>Schedule Date</th>
		<th width = '50' class= 'jos-pending-header'>Job Name</th>
		<th width = '50' class= 'jos-pending-header'>Material</th>
		<th width = '80' align=center class= 'jos-pending-header'>Block</th>
		<th width = '50' class= 'jos-pending-header'>QTY</th>
		<th width = '90' class= 'jos-pending-header'>Plant Id</th>
		<th width = '70' class= 'jos-pending-header'>Plant</th>
		<th width = '60' class= 'jos-pending-header'>Status</th>
		<?
			foreach($newRows as $row)
			{
				?>
					<tr>
						<td align=center class = 'report-row2'><?=$row['date']?>&nbsp;</td>
						<td align=center class = 'report-row2'><?=$row['job_name']?>&nbsp;</td>
						<td align=center class = 'report-row2'><?=$row['material_name']?>&nbsp;</td>
						<td align=center class = 'report-row2'><?=$row['block']?>&nbsp;</td>
						<td align=right class = 'report-row2'><?=$row['qty']?>&nbsp;</td>
						<td align=center class = 'report-row2'><?=$row['id']?>&nbsp;</td>
						<td align="center" class = 'report-row2'><?=$row['plant']?>&nbsp;</td>
						<td class = 'report-row2'><?=$row['status']?>&nbsp;</td>												
					</tr>
				<?
			}
		?>
		
	</table>
</html>
</body>