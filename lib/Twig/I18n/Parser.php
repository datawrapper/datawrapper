<?php

class Twig_I18n_Parser extends Twig_Extensions_TokenParser_Trans {
    public function parse(Twig_Token $token) {
        $lineno = $token->getLine();
        $stream = $this->parser->getStream();
        $count  = null;
        $plural = null;

        if (!$stream->test(Twig_Token::BLOCK_END_TYPE)) {
            $body = $this->parser->getExpressionParser()->parseExpression();
        }
        else {
            $stream->expect(Twig_Token::BLOCK_END_TYPE);
            $body = $this->parser->subparse(array($this, 'decideForFork'));

            if ('plural' === $stream->next()->getValue()) {
                $count = $this->parser->getExpressionParser()->parseExpression();
                $stream->expect(Twig_Token::BLOCK_END_TYPE);
                $plural = $this->parser->subparse(array($this, 'decideForEnd'), true);
            }
        }

        $stream->expect(Twig_Token::BLOCK_END_TYPE);

        $this->checkTransString($body, $lineno);

        return new Twig_I18n_Node($body, $plural, $count, $lineno, $this->getTag());
    }
}
