<?php
/*
 * Created on Jun 20, 2007
 *
 * To change the template for this generated file go to
 * Window - Preferences - PHPeclipse - PHP - Code Templates
 */
  	include("../../util/connection.php");
  
	$connection = new Connection();

	process();
		
	function process()
 	{
		$reader_root = "data";

		$data = $_REQUEST[$reader_root];
		 
		$rows = Array();
		  
		$rows = json_decode($data);
		 
		$query = "";	

		$errorCount = 0;
		
 		foreach($rows as $i => $row)
 		{
 			if($row->insert)
 			{
 				$defaultGrams50lbs = 0;
					
				$query = "SELECT default_grams_50lbs FROM preferences LIMIT 1";
				$rs = mysql_query($query);
				
				if($rs !== false)
				{
					$auxRow = mysql_fetch_assoc($rs);
					$defaultGrams50lbs = $auxRow[0];
				}	
				else
					$query = "";
				
				$bagCost = $row->bag_cost != "" ? $row->bag_cost : 0;
				$gramsPerPot = $row->grams_per_pot!= "" ? $row->bag_cost : 0;
				$cost = $defaultGrams50lbs > 0 ? ($bagCost / $defaultGrams50lbs) * $gramsPerPot : 0;
 					
 				$query = "INSERT INTO fertilizers VALUES (0, '".$row->name."', ".$row->vendor_id.", ".$row->days.", ".$cost.", ".$row->next.", '$bagCost', '$gramsPerPot', now()) ";	
 			}
 			else
 				if($row->delete)
 				{
 					$query = "SELECT COUNT(ref_id) AS result FROM inventory_activity WHERE job_id = (SELECT job_id FROM jobs WHERE ref = 'fertilizers') AND ref_id = $row->id";
 					
 					$rs = mysql_query($query);
 					
 					if($rs !== false)
 					{
 						$auxRow = mysql_fetch_assoc($rs);
 						
 						if($auxRow['result'] == 0)
	 						$query = "DELETE FROM fertilizers WHERE id = ".$row->id; 						
 					}	
 					else
 						$query = "";
 				}				
				else
				{
					$defaultGrams50lbs = 0;
					
					$query = "SELECT default_grams_50lbs FROM preferences LIMIT 1";
					$rs = mysql_query($query);
 					
 					if($rs !== false)
 					{
 						$auxRow = mysql_fetch_assoc($rs);
 						$defaultGrams50lbs = $auxRow['default_grams_50lbs'];
 					}	
 					else
 						$query = "";
 					
 					$bagCost = $row->bag_cost != "" ? $row->bag_cost : 0;
 					$gramsPerPot = $row->grams_per_pot!= "" ? $row->grams_per_pot : 0; 					
 					$cost = $defaultGrams50lbs > 0 ? ($bagCost / $defaultGrams50lbs) * $gramsPerPot : 0;
 					
					$query = "UPDATE fertilizers SET name = '".$row->name."', `vendor_id` = ".$row->vendor_id.", days = ".$row->days.", cost = '$cost', `next` = '".$row->next."', 
							  bag_cost = '$bagCost', grams_per_pot = '$gramsPerPot' WHERE id = ".$row->id;											
				}
									
			$success = mysql_query($query);

			if(!$success)
				++$errorCount;			
	 	}
	 	
	 	$rowCount = count($rows);
	 	
	 	$level = ($errorCount > 0)? (($errorCount == $rowCount)? 3 : 2) : 1;
	 	
	 	showStatus($level);
	}
?>