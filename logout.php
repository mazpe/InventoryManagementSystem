<?php
/*
 * Created on Jun 25, 2007
 *
 * To change the template for this generated file go to
 * Window - Preferences - PHPeclipse - PHP - Code Templates
 */
 session_start();
 
 session_destroy();
 
 //header('Location:login.php?return_url='.str_replace("/msoft/", "", $_REQUEST['return_url']));
 header('Location:login.php');
?>
