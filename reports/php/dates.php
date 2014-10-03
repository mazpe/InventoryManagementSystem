<?php
/*
 * This is script is used to
 * get the data of the materials.
 */
 include("../../jsonwrapper.php");
 include("../../util/connection.php");

 $connection = new Connection();
 $query = "SELECT DATE_SUB(curdate(), INTERVAL 4 - 1 DAY) AS start_day, DATE_ADD(curdate(), INTERVAL 7 - 4 DAY) AS end_day, curdate() AS `to`";
 $data = $connection->get_row($query);
 
 $row = array();
 $row['id'] = 0;
 $row['label'] = 'All';
 $row['from'] = '';
 $row['to'] = '';
 
 $rows[] = $row;
 
 $row = array();
 $row['id'] = 1;
 $row['label'] = 'Past Due';
 $row['from'] = '';
 $row['to'] = $data['to'];
 
 $rows[] = $row;
 
 $row = array();
 $row['id'] = 2;
 $row['label'] = 'This Week';
 $row['from'] = $data['start_day'];
 $row['to'] = $data['end_day'];
 
 $rows[] = $row;
 
 $row = array();
 $row['id'] = 3;
 $row['label'] = 'This Year';
 $row['from'] = date("Y")."-01-01";
 $row['to'] = date("Y")."-12-31";
 
 $rows[] = $row;
 
 $row = array();
 $row['id'] = 4;
 $row['label'] = 'Month to Date';
 $row['from'] = date("Y")."-".date("m")."-01";
 $row['to'] = $data['to'];
 
 $rows[] = $row;
 
 $row = array();
 $row['id'] = 5;
 $row['label'] = 'Year to Date';
 $row['from'] = date("Y")."-01-01";
 $row['to'] = $data['to'];
 
 $rows[] = $row;
 
 $json = array();
 
 $json["data"] = $rows;
 $json["id"] = "label";
 
 echo "".json_encode($json)."";
?>