<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * Allows translation of text columns through transparent one-to-many relationship.
 * Modifier for the query builder.
 *
 * @author     François Zaninotto
 * @version    $Revision$
 * @package    propel.generator.behavior.i18n
 */
class I18nBehaviorQueryBuilderModifier
{
    protected $behavior, $table, $builder;

    public function __construct($behavior)
    {
        $this->behavior = $behavior;
        $this->table = $behavior->getTable();
    }

    public function queryMethods($builder)
    {
        $this->builder = $builder;
        $script = '';
        $script .= $this->addJoinI18n();
        $script .= $this->addJoinWithI18n();
        $script .= $this->addUseI18nQuery();

        return $script;
    }

    protected function addJoinI18n()
    {
        $fk = $this->behavior->getI18nForeignKey();

        return $this->behavior->renderTemplate('queryJoinI18n', array(
            'queryClass'       => $this->builder->getStubQueryBuilder()->getClassname(),
            'defaultLocale'    => $this->behavior->getDefaultLocale(),
            'i18nRelationName' => $this->builder->getRefFKPhpNameAffix($fk),
            'localeColumn'     => $this->behavior->getLocaleColumn()->getPhpName(),
        ));
    }

    protected function addJoinWithI18n()
    {
        $fk = $this->behavior->getI18nForeignKey();

        return $this->behavior->renderTemplate('queryJoinWithI18n', array(
            'queryClass'       => $this->builder->getStubQueryBuilder()->getClassname(),
            'defaultLocale'    => $this->behavior->getDefaultLocale(),
            'i18nRelationName' => $this->builder->getRefFKPhpNameAffix($fk),
        ));
    }

    protected function addUseI18nQuery()
    {
        $i18nTable = $this->behavior->getI18nTable();
        $fk = $this->behavior->getI18nForeignKey();

        return $this->behavior->renderTemplate('queryUseI18nQuery', array(
            'queryClass'           => $this->builder->getNewStubQueryBuilder($i18nTable)->getClassname(),
            'namespacedQueryClass' => $this->builder->getNewStubQueryBuilder($i18nTable)->getFullyQualifiedClassname(),
            'defaultLocale'        => $this->behavior->getDefaultLocale(),
            'i18nRelationName'     => $this->builder->getRefFKPhpNameAffix($fk),
            'localeColumn'         => $this->behavior->getLocaleColumn()->getPhpName(),
        ));
    }

}
