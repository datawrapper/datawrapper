<?php



/**
 * Skeleton subclass for performing query and update operations on the 'auth_token' table.
 *
 *
 *
 * You should add additional methods to this class to meet the
 * application requirements.  This class will only be generated as
 * long as it does not already exist in the output directory.
 *
 * @package    propel.generator.datawrapper
 */
class AuthTokenQuery extends BaseAuthTokenQuery {

    public function newToken($user, $comment) {
        $token = new AuthToken();
        $token->setUser($user);
        $token->setComment($comment);
        $key = $this->createRandomToken();
        // check that the token is unique
        while ($this->findOneByToken($key)) {
            $key = $this->createRandomToken();
        }
        $token->setToken($key);
        $token->setCreatedAt(time());
        $token->save();
        return $token;
    }

    private function createRandomToken() {
        return hash_hmac('sha256', random_int(0,999999).'/'.microtime(), DW_TOKEN_SALT);
    }
}
