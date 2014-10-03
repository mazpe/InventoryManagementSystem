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

if(isset($_GET['status']))
	$status = $_GET['status'];
else
	if(isset($_POST['status']))
		$status = $_POST['status'];

if($status == "")
	$status = "All";

if(isset($_GET['date_range']))	
	$dateRange = $_GET['date_range'];
	
if(isset($_GET['job_id']))	
	$job = $_GET['job_id'];
	
if(isset($_GET['block_id']))	
	$block = $_GET['block_id'];

if(isset($_GET['size_id']))
	$size = $_GET['size_id'];
	
if(isset($_GET['plant_id']))	
	$plant = $_GET['plant_id'];
	
if(isset($_GET['employee_id']))	
	$employee = $_GET['employee_id'];
	
if(isset($_GET['material_id']))	
	$material =  $_GET['material_id'];

if(isset($_GET['name']))
	$name = $_GET['name'];

$dateCondition = "";
$jobCondition = "";
$blockCondition = "";
$plantCondition = "";
$completedCondition = "";
$employeeCondition = "";
$materialCondition = "";
$nameCondition = "";

//Date range
if(isset($_GET['start']) && isset($_GET['end']) && $_GET['start'] == "" && $_GET['end'] == "")
	$dateCondition = "IA.schedule_date <= curdate()";
else
if(isset($_GET['start']) && isset($_GET['end']) && $_GET['start'] != "" && $_GET['end'] == "")
	$dateCondition = "IA.schedule_date >= '".$_GET['start']."'";
else
if(isset($_GET['start']) && isset($_GET['end']) && $_GET['start'] == "" && $_GET['end'] != "")
	$dateCondition = "IA.schedule_date <= '".$_GET['end']."'";
else
if(isset($_GET['start']) && isset($_GET['end']) && $_GET['start'] != ""&& $_GET['end'] != "")
	$dateCondition = "IA.schedule_date >= '".$_GET['start']."' AND IA.schedule_date <= '".$_GET['end']."'";
else
	if($dateRange != '' && $dateRange != 'All')
	{
		if($dateRange == 'Past Due')
			$dateCondition = "IA.schedule_date <= curdate()";
		else
		if($dateRange == 'This Week')
			$dateCondition = "IA.schedule_date BETWEEN date_sub(curdate(),INTERVAL WEEKDAY(curdate()) - 0 DAY) AND date_add(curdate(),INTERVAL 6 - WEEKDAY(curdate()) DAY)";
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

if($size != "" && $size != 0)
	$sizeCondition = "I.size = $size";	
else
	$sizeCondition = "I.size != 0";

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
			
if($name != "" && $name != "All")
	$nameCondition = "I.plant = '$name'";	
else
	$nameCondition = "(1)";
				
if($status != 'All')
	$query = "SELECT IA.id, FORMAT(I.qty, 0) AS qty, qty AS original_qty, IA.status, I.plant, B.id AS block_id, S.name AS size, B.name AS block, IA.inventory_id, IA.job_id , DATE_FORMAT(schedule_date, '%m/%d/%y') AS date, J.name as job_name, J.type, J.ref, IA.ref_id, IA.material_cost, IA.completed, L.name AS labor_name, L.cost AS labor_cost, labor_id, IA.employee_id, E.full_name AS employee, IA.completed_date, IA.ticket    
			FROM inventory I INNER JOIN inventory_activity IA 
			ON I.id = IA.inventory_id INNER JOIN jobs J 
			ON IA.job_id = J.id LEFT JOIN labor L
			ON IA.job_id = L.job_id AND L.id = IA.labor_id LEFT JOIN blocks B 
			ON I.block = B.id LEFT JOIN employees E 
			ON IA.employee_id = E.id LEFT JOIN sizes S 
			ON I.size = S.id 
			WHERE $completedCondition AND status = '$status' AND $dateCondition AND $blockCondition AND $sizeCondition AND $jobCondition AND $plantCondition AND $employeeCondition $materialCondition AND $nameCondition";
else
	$query = "SELECT IA.id, FORMAT(I.qty, 0) AS qty, qty AS original_qty, IA.status, I.plant, B.id AS block_id, B.name AS block, S.name AS size, IA.inventory_id, IA.job_id , DATE_FORMAT(schedule_date, '%m/%d/%y') as date, J.name as job_name, J.type, J.ref, IA.ref_id, IA.material_cost, IA.completed, L.name AS labor_name, L.cost AS labor_cost, labor_id, IA.employee_id, E.full_name AS employee, IA.completed_date, IA.ticket  
			FROM inventory I INNER JOIN inventory_activity IA 
			ON I.id = IA.inventory_id INNER JOIN jobs J 
			ON IA.job_id = J.id LEFT JOIN labor L
			ON IA.job_id = L.job_id AND L.id = IA.labor_id LEFT JOIN blocks B 
			ON I.block = B.id LEFT JOIN employees E 
			ON IA.employee_id = E.id LEFT JOIN sizes S 
			ON S.id = I.size 
			WHERE $dateCondition AND $blockCondition AND $sizeCondition AND $jobCondition AND $plantCondition AND $employeeCondition $materialCondition AND $nameCondition"; 

	$dir = $_GET['dir']; // DESC or ASC
	$sort = $_GET['sort'];// the column

	
	if($sort == 'qty')
		$sort = 'original_qty';
	else
		if($sort == 'material_name')
			$sort = 'job_name';
			
	$dir = (isset($dir)? $dir : "ASC");
	$sort = (isset($sort)? $sort : "schedule_date");

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
/*?>

<?*/

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
<head>
	<link rel="stylesheet" type="text/css" href="../print/css/report_print.css" />
</head>
<body>
<html>
	<table align=left border=1px cellspacing=0 cellmargin=0 class='jobs-pending-table'>
		<caption id="table-caption">Pending Jobs</caption>		
		<th width = '20' class= 'jos-pending-header'>&nbsp;</th>
		<th width = '50' class= 'jos-pending-header'>Block</th>
		<th width = '50' class= 'jos-pending-header'>Plant Id</th>
		<th width = '50' class= 'jos-pending-header'>Size</th>
		<th width = '80' class= 'jos-pending-header'>Plant</th>
		<th width = '50' class= 'jos-pending-header'>QTY</th>
		<th width = '90' class= 'jos-pending-header'>Shedule Date</th>
		<th width = '70' class= 'jos-pending-header'>Material</th>
		<th width = '60' class= 'jos-pending-header'>Job Name</th>		
		<?
			foreach($newRows as $row)
			{
				?>
					<tr>
						<td class= 'report-row2'>&nbsp;</td>
						<td align=center class = 'report-row2'><?=$row['block']?>&nbsp;</td>
						<td align=center class = 'report-row2'><?=$row['inventory_id']?>&nbsp;</td>
						<td align=center class = 'report-row2'><?=$row['size']?>&nbsp;</td>
						<td class = 'report-row2'><?=$row['plant']?>&nbsp;</td>
						<td align=right class = 'report-row2'><?=$row['qty']?>&nbsp;</td>
						<td align=center class = 'report-row2'><?=$row['date']?>&nbsp;</td>
						<td align="center" class = 'report-row2'><?=$row['material_name']?>&nbsp;</td>
						<td class = 'report-row2'><?=$row['job_name']?>&nbsp;</td>						
					</tr>
				<?
			}
		?>
		
	</table>
</html>
</body>