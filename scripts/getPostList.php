<?php

  // read directory
  $paths = [];
  foreach(glob('../_posts/*.yaml') as $path) {
    // file data
    $filename = explode('/', $path)[2];
    $metadataObject = [
      'id' => (integer) explode('.', $filename)[0],
      'path' => explode('.', $filename)[1]
    ];

    // get path contents
    $metadata = explode("\n", file_get_contents($path));
    foreach($metadata as $datum) {
      if(preg_match('/^([a-z]+):([^#]*)(#|$)/', $datum, $matches)) {
        $metadataObject[$matches[1]] = trim($matches[2]);
      }
    }

    // get post metadata
    $paths[] = $metadataObject;
  }
  echo json_encode($paths);
?>
