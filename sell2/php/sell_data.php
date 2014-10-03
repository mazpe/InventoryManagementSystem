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

	$dateRange = $_POST['date_range'];
	$name = $_POST['plant'];
	$plantId = $_REQUEST['plant_id'];
	$orderNo = $_REQUEST['order_no'];
	
	//Date range
	if(isset($_POST['start'])&& isset($_POST['end']))
		$dateCondition = "S.date >= '".$_POST['start']."' AND S.date <= '".$_POST['end']."'";
	else
		if($dateRange != '' && $dateRange != 'All')
		{
			if($dateRange == 'This Week')
				$dateCondition = "S.date BETWEEN date_sub(curdate(),INTERVAL WEEKDAY(curdate()) -0 DAY) AND date_add(curdate(),INTERVAL 6 - WEEKDAY(curdate()) DAY)";
			else
				if($dateRange == 'This Year')
					$dateCondition = "YEAR(S.date) = YEAR(now())";
				else		
					if($dateRange == 'Month to Date')
						$dateCondition = "(YEAR(S.date) = YEAR(now()) AND MONTH(S.date) = MONTH(now()) AND S.date <= now())";
					else
						if($dateRange == 'Year to Date')
							$dateCondition = "(YEAR(S.date) = YEAR(now()) AND S.date <= now())";
						else
							$dateCondition = "S.date IS NOT NULL";
		}	
		else
			$dateCondition = "S.date IS NOT NULL";

	if($name != "" && $name != "All")
		$nameCondition = "I.plant = '$name'";	
	else
		$nameCondition = "(1)";

	if($plantId != "" && $plantId != "0")
		$plantCondition = "I.id = '$plantId'";	
	else
		$plantCondition = "(1)";
	
	if($orderNo != "" && $orderNo != "All")
		$orderCondition = "S.id = '$orderNo'";	
	else
		$orderCondition = "(1)";
			
	$query = "SELECT S.id, S.id AS order_no, S.date, S.plant_id, S.qty, I.plant ".
			 "FROM sell S INNER JOIN inventory I " .
			 "ON S.plant_id = I.id " .
			 "WHERE $dateCondition AND $nameCondition AND $orderCondition AND $plantCondition ";
			 
	return $connection->getResultSet($query);
 } 
?>