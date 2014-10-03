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
		if(isset($_GET['status']))
			$status = $_GET['status'];
	
	if($status == "")
		$status = "All";
	
	if(isset($_GET['date_range']))	
		$dateRange = $_GET['date_range'];
	
	if(isset($_GET['employee_id']))
		$employee = $_GET['employee_id'];
	
	$dateCondition = "";


	$completedCondition = "";

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
	
 function getRows($connection)
 {
 	if(isset($_GET['completed']))
 		$completed = $_GET['completed'];
	
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
	
	if(isset($_GET['employee_id']))		
 		$employee = $_GET['employee_id'];
 		
 	if(isset($_GET['block_id']))	
 		$block = $_GET['block_id'];
 		
	if(isset($_GET['plant_id'])) 		
		$plant = $_GET['plant_id'];
		
	if(isset($_GET['size_id']))	
		$size = $_GET['size_id'];
	
	if(isset($_GET['plant']))	
		$name = $_GET['plant'];
	
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
				
	$query = "SELECT B.name as block, I.id as id, S.name as size, plant, FORMAT(qty, 0) AS qty, date_planted, 
				(SELECT MAX(schedule_date) FROM inventory_activity IA WHERE job_id = 5 AND inventory_id = I.id AND completed = 1 AND $dateCondition) AS cut,
				(SELECT MAX(schedule_date) FROM inventory_activity IA WHERE job_id = 21 AND inventory_id = I.id AND completed = 1 AND $dateCondition) AS weed,
				(SELECT MAX(schedule_date) FROM inventory_activity IA WHERE job_id = 22 AND inventory_id = I.id AND completed = 1 AND $dateCondition) AS spray				
				FROM inventory I INNER JOIN blocks B
				ON I.block = B.id INNER JOIN sizes S
				ON I.size = S.id
				WHERE $blockCondition AND $plantCondition AND $sizeCondition AND $nameCondition";

	$dir = $_GET['dir']; // DESC or ASC
	$sort = $_GET['sort'];// the column

	$dir = (isset($dir) ? $dir : "ASC");
	$sort = (isset($sort)? $sort : "I.plant");

	$query .= " ORDER BY $sort $dir ";
	
 	if(isset($_GET['limit']))
 	{
		$limit = $_GET['limit']; //the pagesize
		$start = $_GET['start']; //Offset
		
		$query .= "LIMIT $start, $limit";
 	}
	
	return $connection->getResultSet($query);
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
		<div align=center style="width:800px">Last Done Report</div>
		<div align=center style="width:800px"><? echo $title; ?></div>
	<table align=left border=1px cellspacing=0 cellmargin=0 class='jobs-pending-table'>
		<caption id="table-caption">&nbsp;</caption>			
		<th width = '50' class= 'jos-pending-header'>Block</th>
		<th width = '50' class= 'jos-pending-header'>Plant Id</th>
		<th width = '50' class= 'jos-pending-header'>Size</th>
		<th width = '80' class= 'jos-pending-header'>Plant</th>
		<th width = '50' class= 'jos-pending-header'>QTY</th>
		<th width = '90' class= 'jos-pending-header'>Date Planted</th>
		<th width = '70' class= 'jos-pending-header'>Fertelizer</th>
		<th width = '60' class= 'jos-pending-header'>Fertilizer Date</th>
		<th width = '60' class= 'jos-pending-header'>Herbicides</th>
		<th width = '60' class= 'jos-pending-header'>Herbicides Date</th>
		<th width = '60' class= 'jos-pending-header'>Weed</th>
		<th width = '60' class= 'jos-pending-header'>Cut</th>
		<th width = '60' class= 'jos-pending-header'>Spray</th>		
		<?
			foreach($rows as $row)
			{
				?>
					<tr>
						<td align=center class = 'report-row2'><?=$row['block']?>&nbsp;</td>
						<td align=center class = 'report-row2'><?=$row['id']?>&nbsp;</td>
						<td align=center class = 'report-row2'><?=$row['size']?>&nbsp;</td>
						<td class = 'report-row2'><?=$row['plant']?>&nbsp;</td>
						<td align=right class = 'report-row2'><?=$row['qty']?>&nbsp;</td>
						<td align=center class = 'report-row2'><?=$row['date_planted']?>&nbsp;</td>
						<td align="center" class = 'report-row2'><?=$row['fert_mat']?>&nbsp;</td>
						<td class = 'report-row2'><?=$row['fert_date']?>&nbsp;</td>
						<td class = 'report-row2'><?=$row['herb_mat']?>&nbsp;</td>
						<td class = 'report-row2'><?=$row['herb_date']?>&nbsp;</td>
						<td class = 'report-row2'><?=$row['weed']?>&nbsp;</td>
						<td class = 'report-row2'><?=$row['cut']?>&nbsp;</td>
						<td class = 'report-row2'><?=$row['spray']?>&nbsp;</td>						
					</tr>
				<?
			}
		?>
		
	</table>
</html>
</body>