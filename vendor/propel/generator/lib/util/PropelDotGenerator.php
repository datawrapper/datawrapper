<?php

/**
 * This file is part of the Propel package.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @license    MIT License
 */

/**
 * A generator for DOT graph information.
 *
 * @author     Mark Kimsal
 * @author     Toni Uebernickel <tuebernickel@gmail.com>
 * @version    $Revision$
 * @package    propel.generator.task
 */
class PropelDotGenerator
{
    /**
     * Create the DOT syntax for a given databases.
     *
     * @param $database Database
     *
     * @return string The DOT syntax created.
     */
    public static function create(Database $database)
    {
        $dotSyntax = '';

        // table nodes
        foreach ($database->getTables() as $table) {
            $columnsSyntax = '';
            foreach ($table->getColumns() as $column) {
                $attributes = '';

                if (count($column->getForeignKeys()) > 0) {
                    $attributes .= ' [FK]';
                }

                if ($column->isPrimaryKey()) {
                    $attributes .= ' [PK]';
                }

                $columnsSyntax .= sprintf('%s (%s)%s\l', $column->getName(), $column->getType(), $attributes);
            }

            $nodeSyntax = sprintf('"%s" [label="{<table>%s|<cols>%s}", shape=record];', $table->getName(), $table->getName(), $columnsSyntax);
            $dotSyntax .= "$nodeSyntax\n";
        }

        // relation nodes
        foreach ($database->getTables() as $table) {
            foreach ($table->getColumns() as $column) {
                foreach ($column->getForeignKeys() as $fk) {
                    $relationSyntax = sprintf('"%s":cols -> "%s":table [label="%s=%s"];', $table->getName(), $fk->getForeignTableName(), $column->getName(), implode(',', $fk->getForeignColumns()));
                    $dotSyntax .= "$relationSyntax\n";
                }
            }
        }

        return sprintf("digraph G {\n%s}\n", $dotSyntax);
    }
}
