<?php
	session_start();

	include_once("util/connection.php");
	include_once("general.php");
	
    $connection = new Connection();
    
	if(isset($_REQUEST['username']) && isset($_REQUEST['password']))
	{		
		function getAcces($username, $password)
		{
			$connection = new Connection();
			
			$query = "SELECT COUNT(id) AS record_count " .
					 "FROM users " .
					 "WHERE password = md5('$password') AND username = '$username'";
			
			//echo $query;
			
			$row = $connection->get_row($query);			
			
			return ($row['record_count'] != '0');
		}	
		
		if(getAcces($_REQUEST['username'], $_REQUEST['password']))
		{
			$query = "SELECT username, name FROM users WHERE username = '".$_REQUEST['username']."'";
			
			//echo $query;
							
			$user = $connection->get_row($query);
			
			$_SESSION['username'] = $user['username'];			
			$_SESSION['name'] = $user['name'];
			
			$returnURL = $_REQUEST['return_url'];
 
			if($returnURL != "")
				header ("location: $returnURL");
			else
				header ("location: index.php");
		}
		else
			$mensaje="Your credentials are invalid.";
	}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<title>Plant Brothers</title>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
		<style type="text/css">
			.mensaje
			{	
				color:red;
				font-size:13px
			}
			
			body
			{
				background:GRAY;
				background-image:url("images/background.png");
				background-repeat:no-repeat;
				background-position: 50% 0%;
			}
			
			.Estilo1 
			{
				color:WHITE;
				font-size: 14px;
				font-family: Arial;
				font-weight: bold;
			}
			
			.login-table
			{
				margin: 13em 0 0 0;
			}
		</style>

		<link rel="stylesheet" type="text/css" href="/ext22/resources/css/ext-all.css" />
		
		<script type="text/javascript" src="js/general.php"></script>
		<script type="text/javascript" src="/ext22/adapter/ext/ext-base.js"></script>
		<script type="text/javascript" src="/ext22/ext-all.js"></script>
   	    
		<script language="javascript" type="text/javascript">
			Ext.onReady(function()
			{
					Ext.QuickTips.init();
					
			 		var username = new Ext.form.TextField(
			 		{
			 			id:'username',
						width:200,					
						allowBlank:false
					});
					
					var password = new Ext.form.TextField(
					{
						id:'password',
						inputType:'password',
						width:200,
						allowBlank:false
					});	
			});
		
		</script>
	</head>
<body>

	<form action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST"  name="register" id="register" class="x-form">
		<table class="login-table" width="100%" style="height:'100%'" border="0">
  			<tr>
    			<td>
	     			<table border="0" align="center">
      					<tr>
        					<td align="right"><label class="Estilo1">Username:</label>
          					</td>
        					<td><input type="text" name="username" id="username"></td>
      					</tr>
      					<tr>
        					<td align="right"><label class="Estilo1">Password:</label>
          					</td>
        					<td><input type="password" name="password" id="password"></td>
        					<td><input type="hidden" name="return_url" id="return_url" value="<? echo $_REQUEST['return_url'];?>"></td>
      					</tr>
						<tr>		
        					<td colspan=2 align="right"><input type="submit" name="Submit" value="Submit" align="center"></td>
      					</tr>
    				</table>
    			</td>
  			</tr>
		</table>
	</form>
</body>
</html>