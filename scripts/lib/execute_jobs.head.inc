<?php

/*
 * This is a daemon that runs permamently on the Datawrapper server.
 * It's purpose is to execute queued jobs one after another.
 */

define('LOCKFILE', dirname(__FILE__) . '/../execute_jobs.lock');

if (!isset($argv[1]) || !in_array($argv[1], array('start', 'stop', 'restart'))) {
    print "Usage: ".basename($argv[0])." start|stop|restart\n";
    exit();
}

if (file_exists(LOCKFILE)) {
    if ($argv[1] == 'stop' || $argv[1] == 'restart') {
        $pid = file_get_contents(LOCKFILE);
        posix_kill($pid, 1);
        print "stopped. $pid \n";
        unlink(LOCKFILE);
        if ($argv[1] == 'stop') exit();
    } else {
        print "Job execution already running as [" . file_get_contents(LOCKFILE). "]\n";
        exit();
    }
} else {
    if ($argv[1] == 'stop') {
        print "No running process found\n";
        exit();
    }
}

print "Started job execution daemon...\n";

// Daemonize
$pid = pcntl_fork(); // parent gets the child PID, child gets 0

if($pid){
    // store PID in lockfile
    file_put_contents(LOCKFILE, $pid);
    exit();
}

$pid = getmypid();

