<?php

  // get post name
  $postName = $_GET['postName'];

  // get associated files
  $postData = [];
  foreach(glob("../_posts/*.$postName.*") as $path) {

    // read and parse metadata
    $fileString = file_get_contents($path);
    if(strpos($path, '.yaml') == strlen($path) - 5) {
      $metadata = explode("\n", $fileString);
      foreach($metadata as $datum) {
        if(preg_match('/^([a-z]+):([^#]*)(#|$)/', $datum, $matches)) {
          $postData['metadata'][$matches[1]] = trim($matches[2]);
        }
      }
    } else {
      // read file data, add to data object
      $postData['body'] = $fileString;
    }
  }

  // return as object
  echo json_encode($postData);

?>
