<?php

  // read directory
  $paths = [];
  foreach(glob('../_posts/*.yaml') as $path) {
    // file data
    $metadataObject = [
      'id' => (integer) explode('.', $path)[0],
      'path' => explode('.', $path)[1]
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
