<?php
/*
 * Created on Jan 20, 2009
 *
 * To change the template for this generated file go to
 * Window - Preferences - PHPeclipse - PHP - Code Templates
 */
 
 include("../../util/connection.php");
  
  $connection = new Connection();

  $query = "SELECT L.*, F.id AS fertilizer_id, F.days AS fdays, F.cost AS fcost, H.id AS herbicide_id, H.days AS hdays, H.cost AS hcost ".
			 "FROM loaders2 L LEFT JOIN fertilizers F " .
			 "ON L.FERT = F.name LEFT JOIN herbicides H " .
			 "ON L.HERB = H.name";

  $rs = $connection->getResultSet($query);
  
  $html = "";
   
  $inventoryId = 0;
  $activityId = 0;
  
  $actualWeek = 422;
    
  while($row = mysql_fetch_array($rs))
  {
  	//++$inventoryId;
  	
  	$plant = $row['PLANT'];
  	$block = $row['B'];
  	$size = $row['G'];
  	
  	$weekPlanted = $row['3S'];
  	$weekFertilized = $row['WKSFERT'];  	
	$weekFertilized = ($weekFertilized == '' ? 0 : $weekFertilized);
	
  	$weekPlanted = ($weekPlanted == '' ? $weekFertilized : $weekPlanted);
  	$weeks = $actualWeek - $weekPlanted;
  	$weeks = ($weeks != "" ? $weeks : 0);
  	  	
  	$datePlanted = "DATE_SUB(now(), INTERVAL $weeks WEEK)";
  	$lastModified = "DATE_SUB(now(), INTERVAL $weeks WEEK)";
  	$source = '';
  	$sellPrice = 0;
  	$margin = 0;
  	$budgetCost = 0;
  	$qty = $row['QTY'];
  	$days = 0;
  	$profit = 0;
  	
	$inventoryId = $row['ID'];
	
  	$html .= "INSERT INTO inventory (id, plant, block, size, date_planted, last_modified, source, sell_price, margin, budget_cost, qty, days, profit) " .
  			 "VALUES ('$inventoryId', '$plant', '$block', '$size', $datePlanted, $lastModified, '$source', '$sellPrice', '$margin', '$budgetCost', '$qty', '$days', '$profit');<br>";
	
	++$activityId;
	  			 
	//Fertilizer
	//$weeksToAdd = $row['TFERT'];
	$fertilizerId = $row['fertilizer_id'];
	$scheduledDate = "DATE_SUB(now(), INTERVAL $actualWeek - $weekFertilized WEEK)";
	$materialCost = $row['fcost'];
	$completed = 1;
	$status = 'Closed';
	$completedDate = $scheduledDate;
	$dependsOn = '0';
	$ticket = '0';
	
	$labor = getLabor($connection, 2, $size);
	$laborCost = $labor['cost'];
	$laborId = $row['id'];
		
  	$html .= "INSERT INTO inventory_activity (id, inventory_id, job_id, employee_id, schedule_date, ref_id, material_cost, completed, labor_id, status, completed_date, depends_on, ticket, labor_cost) " .
  				" VALUES ('$activityId', '$inventoryId', '2', 0, $scheduledDate, '$fertilizerId', '$materialCost', '$completed', '$laborId', '$status', $completedDate, '$dependsOn', '$ticket', '$laborCost');<br>";
  				
  	//$weekScheduledDate = $weekFertilized + $weeksToAdd;
  	//$weekScheduledDate = ($weekScheduledDate != '' ? $weekScheduledDate : 0);
  	
	//$scheduledDate = "DATE_ADD(now(), INTERVAL $actualWeek - $weekScheduledDate WEEK)";
	$scheduledDate = "DATE_ADD($scheduledDate, INTERVAL ".$row['fdays']." DAY)";
	$materialCost = 0;
	$completed = 0;	
	$status = 'Pending';
	$completedDate = 'null';
	$dependsOn = $activityId;
	$ticket = '0';
	
	++$activityId;
	
  	$html .= "INSERT INTO inventory_activity (id, inventory_id, job_id, employee_id, schedule_date, ref_id, material_cost, completed, labor_id, status, completed_date, depends_on, ticket, labor_cost) " .
  				" VALUES ('$activityId', '$inventoryId', '2', 0, $scheduledDate, '$fertilizerId', '$materialCost', $completed, '$laborId', '$status', null, '$dependsOn', '$ticket', '$laborCost');<br>";
	
	//Herbicides
	if($row['HERB'] != '')
	{	
		++$activityId;
		
		$herbicideId = $row['herbicide_id'];
		//$weeksToAdd = $row['THERB'];			
		$weekHerbicide = $row['WKSHERB'];
		$weekHerbicide = ($weekHerbicide == '' ? 0 : $weekHerbicide);
		
		$scheduledDate = "DATE_SUB(now(), INTERVAL $actualWeek - $weekHerbicide WEEK)";
		$materialCost = $row['hcost'];
		$completed = 1;		
		$status = 'Closed';
		$completedDate = $scheduledDate;
		$dependsOn = '0';
		$ticket = '0';
		
		//3=Herbicide
		$labor = getLabor($connection, 3, $size);
		$laborCost = $labor['cost'];
		$laborId = $row['id'];
			
	  	$html .= "INSERT INTO inventory_activity (id, inventory_id, job_id, employee_id, schedule_date, ref_id, material_cost, completed, labor_id, status, completed_date, depends_on, ticket, labor_cost) " .
	  				" VALUES ('$activityId', '$inventoryId', '3', 0, $scheduledDate, '$herbicideId', '$materialCost', '$completed', '$laborId', '$status', $completedDate, '$dependsOn', '$ticket', '$laborCost');<br>";
	  				
	  	//$weekScheduledDate = $weekHerbicide + $weeksToAdd;
	  	//$weekScheduledDate = ($weekScheduledDate != '' ? $weekScheduledDate : 0);
	  	
		//$scheduledDate = "DATE_SUB(now(), INTERVAL $actualWeek - $weekScheduledDate WEEK)";
		$scheduledDate = "DATE_ADD($scheduledDate, INTERVAL ".$row['hdays']." DAY)";
		
		$materialCost = $row['hcost'];
		$completed = 0;		
		$status = 'Pending';
		$completedDate = 'null';
		$dependsOn = $activityId;
		$ticket = '0';		
		
		++$activityId;
		
	  	$html .= "INSERT INTO inventory_activity (id, inventory_id, job_id, employee_id, schedule_date, ref_id, material_cost, completed, labor_id, status, completed_date, depends_on, ticket, labor_cost) " .
	  				" VALUES ('$activityId', '$inventoryId', '3', 0, $scheduledDate, '$herbicideId', '$materialCost', $completed, '$laborId', '$status', null, '$dependsOn', '$ticket', '$laborCost');<br>";
	}
	
	//Weed
	/*if($row['WD'] != "")
	{
		++$activityId;
		
		$weedId = 0;
		$weeksToAdd = 0;			
		$weekWeed = $row['WD'];
		$weekWeed = ($weekWeed != '' ? $weekWeed : 0);
		
		$scheduledDate = "DATE_SUB(now(), INTERVAL $actualWeek - $weekWeed WEEK)";
		$materialCost = 0;
		$completed = 1;		
		$status = 'Closed';
		$completedDate = $scheduledDate;
		$dependsOn = '0';
		$ticket = '0';
		
		//3=Herbicide
		$laborCost = 0;
		$laborId = 0;
			
	  	$html .= "INSERT INTO inventory_activity (id, inventory_id, job_id, employee_id, schedule_date, ref_id, material_cost, completed, labor_id, status, completed_date, depends_on, ticket, labor_cost) " .
	  				" VALUES ('$activityId', '$inventoryId', '20', 0, $scheduledDate, '$weedId', '$materialCost', '$completed', '$laborId', '$status', $completedDate, '$dependsOn', '$ticket', '$laborCost');<br>";		
	}	
	
	if($row['CUT'] != "")
	{
		++$activityId;
		
		$weedId = 0;
		$weeksToAdd = 0;			
		$weekCut = $row['CUT'];
		$weekCut = ($weekCut != '' ? $weekCut : 0);
		
		$scheduledDate = "DATE_SUB(now(), INTERVAL $actualWeek - $weekCut WEEK)";
		$materialCost = 0;
		$completed = 1;		
		$status = 'Closed';
		$completedDate = $scheduledDate;
		$dependsOn = '0';
		$ticket = '0';
		
		//3=Herbicide
		$laborCost = 0;
		$laborId = 0;
			
	  	$html .= "INSERT INTO inventory_activity (id, inventory_id, job_id, employee_id, schedule_date, ref_id, material_cost, completed, labor_id, status, completed_date, depends_on, ticket, labor_cost) " .
	  				" VALUES ('$activityId', '$inventoryId', '5', 0, $scheduledDate, '$cutId', '$materialCost', '$completed', '$laborId', '$status', $completedDate, '$dependsOn', '$ticket', '$laborCost');<br>";
	}*/
  }
  
  echo $html;
  
  function getLabor($connection, $jobId, $size)
  {
  	$query = "SELECT id, cost FROM labor WHERE name LIKE '%$size%' AND job_id = '$jobId' LIMIT 1";
  	$row = $connection->get_row($query);
  	
  	return $row;
  }
?>