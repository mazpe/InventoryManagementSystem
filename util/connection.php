<?php


/*
 * This class is for the conecction to database
 */

include($_SERVER['DOCUMENT_ROOT']."/configuration.php");
include($_SERVER['DOCUMENT_ROOT']."/jsonwrapper.php");

function showStatus($level, $message = "")
{
	if($level == 1)			
		echo "{success:true, level:$level}\n"; 
	else
	{
		if($message == "")
		{
			if($level == 2)			
				$message = "There were some errors.";
			else
				$message = "Your changes were not saved.";
		}
		 
		die("{errors:[{id:'pass', msg:''}], message:'$message', level:$level}");
	}
}	

class Connection
{
	var $user;
	var $host;
	var $password;
	var $conn;

	/*
	 * @params optional associative array whith the configuration
	 * 		user	:	the database user
	 * 		ip		:	The ip
	 * 		password:	The password of the user in the database.
	 * 		db_name	:	The database name to connect with.
	 */

	public function __construct()
	{
		global $db_user;
		global $db_ip;
		global $db_pass;
		global $db_name;

		$argv = func_get_args();

		if(count($argv) >= 1)
		{
			$conf = $argv[0];
		}

		$config['user'] = $conf['user'] != "" ? $conf['user'] : $db_user;
		$config['ip'] = $conf['ip'] != "" ? $conf['ip'] : $db_ip;
		$config['password'] = $conf['password'] != "" ? $conf['password'] : $db_pass;
		$config['db_name'] = $conf['db_name'] != "" ? $conf['db_name'] : $db_name;


		$this->user = $config["user"];
		$this->host = $config["ip"];
		$this->password = $config["password"];
		$this->db_name = $config["db_name"];

		//echo $this->db_name;

		$this->conn = mysql_connect($this->host,$this->user,$this->password);
		$select_result = mysql_select_db($this->db_name, $this->conn);

	}
	
	function getJsonRows($sql , $id,$reader_root = "data",$reader_id = "id",$totalProperty = "totalCount")
	{	 
		$rows = array();
		$results = $this->exec_query($sql);
				
		$cont = 0;
		
		while($row = mysql_fetch_assoc($results))
		{
			$cont++;
			$rows[] = $row;
		}
		
		 $json = array();
		 $json[$reader_root] = $rows;//utf8_encode($rows);
		 $json[$reader_id] = $id;
		 $json[$totalProperty] = $cont;
		
		 return "".json_encode($json)."";
	}

	function getResultSet($query)
 	{
 		if($query == "")
 		{
 			$this->error = "You don't specify a query.'";
 			return 0;
 		}
		
		return mysql_query($query);		 		
 	}
 	
	public function exec_query($sql)
	{
			
		$result = @mysql_query($sql);
		
		if(mysql_error())
		{
			echo mysql_error()."<br>";
			echo $sql;
			return null;
		} 
		
		return $result;
		
	}

	public function get_row($sql, $type = "assoc")
	{
		$row = null;

		$result = mysql_query($sql);
		
		if(mysql_error())
		{
			echo mysql_error()."<br>";
			echo $sql;
		}
		
		while($row = mysql_fetch_assoc($result))
		{
			return $row;
		}
						
		return null;
	}

	public function get_value($sql)
	{
		$row = $this->get_row($sql);
		
		return $row[0];
	}

	public function getConnection()
	{
		return $this->conn;
	}
}
?>
