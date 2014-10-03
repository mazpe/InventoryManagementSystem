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
 				$query = "INSERT INTO employees VALUES (0, '".$row->full_name."', '".$row->hire_date."', '".$row->title."', ".$row->salary.") ";
 			else
 				if($row->delete)
 				{ 					
 					$query = "SELECT COUNT(id) AS result FROM employees WHERE id = ".$row->id;
 					
 					$rs = mysql_query($query);
 					
 					if($rs !== false)
 					{
 						$auxRow = mysql_fetch_assoc($rs);
 						
 						if($auxRow['result'] == 1)
	 						$query = "DELETE FROM employees WHERE id = ".$row->id; 						
 					}	
 					else
 						$query = "";
 				} 					
 				else
					$query = "UPDATE employees SET full_name = '".$row->full_name."', hire_date = '".$row->hire_date."', title = '".$row->title."', salary = $row->salary WHERE id = ".$row->id;
				
			$success = mysql_query($query);

			if(!$success)
				++$errorCount;			
	 	}
	 	
	 	$rowCount = count($rows);
	 	
	 	$level = ($errorCount > 0)? (($errorCount == $rowCount)? 3 : 2) : 1;
	 	
	 	showStatus($level);
	}
?>