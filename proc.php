<?php include "helper.php";
session_start();


if (isset($_POST['path'])) {
    $defaultPath = urldecode($_POST['path']);
    $defaultPath = str_replace('\\', '/', $defaultPath);
} else {
    $defaultPath = './Strife';
}

$_SESSION['previous_path'] = $defaultPath;

if (isset($_POST['prev'])) {
    $defaultPath = $_SESSION['previous_path'];
}

$directoryIterator = new DirectoryIterator($defaultPath);
$json = ['default_path' => urlencode($defaultPath)];


foreach ($directoryIterator as $file) {
    if ($file->isDot()) continue;
    if ($file->isDir()) {
        $json['directories']['names'][] = $file->getFilename();
        $json['directories']['paths'][] = urlencode($file->getPathname());
    }
    if ($file->isFile()) {
        $json['files']['names'][] = $file->getFilename();
        $json['files']['paths'][] = $file->getPathname();
        $json['files']['types'][] = $file->getExtension();
        $json['files']['sizes'][] = $file->getSize();
    }
}

print json_encode($json);

?>