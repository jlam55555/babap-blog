<?php

  // if search
  $isSearch = isset($_GET['q']) && trim($_GET['q']) !== '';
  $searchTerm = $isSearch ? $_GET['q'] : null;

  // read contents (search only)
  $matchedFiles = [];
  if($isSearch) {
    foreach(glob('../_posts/*.md') as $path) {
      $matchedFiles[(integer) explode('.', explode('/', $path)[2])[0]] = strpos(file_get_contents($path), $searchTerm) !== false;
    }
  }

  // read metadata directory (always)
  $paths = [];
  foreach(glob('../_posts/*.yaml') as $path) {

    // file data
    $filename = explode('/', $path)[2];
    $metadataObject = [
      'id' => (integer) explode('.', $filename)[0],
      'path' => explode('.', $filename)[1]
    ];

    $match = $isSearch ? $matchedFiles[$metadataObject['id']] : null;

    // get path contents
    $metadata = explode("\n", file_get_contents($path));
    foreach($metadata as $datum) {
      if(preg_match('/^([a-z]+):([^#]*)(#|$)/', $datum, $matches)) {
        $metadataObject[$matches[1]] = trim($matches[2]);

        // short-circuiting match to avoid redundancy of matches
        if(!$match && strpos($matches[2], $searchTerm) !== false) {
          $match = true;
        }
      }
    }

    // add post metadata to object
    // if search must have match
    if(!$isSearch || ($isSearch && $match)) {
      $paths[] = $metadataObject;
    }
  }
  echo json_encode($paths);
?>
