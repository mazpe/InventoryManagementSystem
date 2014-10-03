<?php
	//Inicio de la session
	session_start();
	
	if(!isset($_SESSION['username']))
		echo '<script languaje="Javascript">location.href="login.php"</script>';
	else
		echo '<script languaje="Javascript">location.href="/plants/add_plant.php"</script>';	
?>