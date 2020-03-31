<?php

function chart_publish_directory() {
    $dir = ROOT_PATH.'charts';

    if (isset($GLOBALS['dw_config']['publish_directory'])) {
        $dir = $GLOBALS['dw_config']['publish_directory'];
    }

    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0755, true)) {
            throw new RuntimeException('Could not create chart publish directory "'.$dir.'". Please create it manually and make sure PHP can write to it.');
        }
    }

    return rtrim(realpath($dir), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
}

function publish_get_embed_templates($org) {
    $templates = [];

    // responsive iframe
    $templates[] = [
        "id" => "responsive",
        "title" => __("publish / embed / responsive"),
        "text" => __("publish / embed / responsive / text"),
        "template" => '<iframe title="%chart_title%" aria-label="%chart_type%" id="datawrapper-chart-%chart_id%" src="%chart_url%" scrolling="no" frameborder="0" style="width: 0; min-width: 100% !important; border: none;" height="%chart_height%"></iframe><script type="text/javascript">'
                . file_get_contents(ROOT_PATH . 'templates/chart/embed.js') .
            '</script>',
    ];

    // standard iframe
    $templates[] = [
        "id" => "iframe",
        "title" => __("publish / embed / iframe"),
        "text" => __("publish / embed / iframe / text"),
        "template" => '<iframe title="%chart_title%" aria-label="%chart_type%" src="%chart_url%" scrolling="no" frameborder="0" style="border: none;" width="%chart_width%" height="%chart_height%"></iframe>',
    ];

    if (!empty($org)) {
        $embed = $org->getSettings('embed');

        if (!empty($embed["preferred_embed"]) && $embed["preferred_embed"] == "custom") {
            $embed['custom_embed']['id'] = 'custom';
            $templates[] = $embed['custom_embed'];
        }
    }
    return $templates;
}

/*
 * returns the id of the embed type that is
 * pre-selected on load of the publish step
 */
function publish_get_preferred_embed_type($org) {
    $user = Session::getUser();
    if (!empty($org)) {
        $embed = $org->getSettings('embed');
        if (isset($embed["preferred_embed"])) {
            // for members of teams with custom embed,
            // the custom type is always the preferred type
            return $embed['preferred_embed'];
        }
    }
    // for other users it's whatever they selected last
    if (!empty($user->getUserData()['embed_type'])) {
        return $user->getUserData()['embed_type'];
    }
    // or responsive
    return 'responsive';
}

/*
 * returns the id of the shareurl type that
 * is pre-selected on load of the publishs step
 */
function publish_get_preferred_shareurl_type() {
    $user = Session::getUser();
    // whatever the user selected last
    if (!empty($user->getUserData()['shareurl_type'])) {
        return $user->getUserData()['shareurl_type'];
    }
    // or standalone
    return 'default';
}

/*
 * plugins may provide alternative shareurls for published
 * charts via a hook. this function collects the shareurls
 * and returns them for use in the new publish UI
 */
function publish_get_plugin_shareurls() {
    if (!Hooks::hookRegistered(Hooks::CHART_ADD_SHARE_URL)) return [];
    return Hooks::execute(Hooks::CHART_ADD_SHARE_URL);
}
