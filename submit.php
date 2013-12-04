<?php
header("Content-Type: text/html; charset=Windows-1251");
  if(count($_POST) > 0)
  {
    foreach($_POST as &$v)
      $v = iconv('UTF-8', 'WINDOWS-1251', $v);    
    print_r($_POST);
  }
 
?>
