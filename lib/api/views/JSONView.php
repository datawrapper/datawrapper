<?php

class JSONView extends Slim_View {

    public function render( $template ) {
        // $env = $this->getEnvironment();
        // $template = $env->loadTemplate($template);
        unset($this->data['flash']);
        //$obj = (object) array('status'=> $this->status, 'data'=>$this->data);
        //return json_encode($obj);

        // extract($this->data);
        $templatePath = $this->getTemplatesDirectory() . '/' . ltrim($template, '/');
        if ( !file_exists($templatePath) ) {
            throw new RuntimeException('View cannot render template `' . $templatePath . '`. Template does not exist.');
        }
        ob_start();
        require $templatePath;
        return ob_get_clean();
    }

}