
/**
 * Use the I18n relation query object
 *
 * @see       useQuery()
 *
 * @param     string $locale Locale to use for the join condition, e.g. 'fr_FR'
 * @param     string $relationAlias optional alias for the relation
 * @param     string $joinType Accepted values are null, 'left join', 'right join', 'inner join'. Defaults to left join.
 *
 * @return    <?php echo $queryClass ?> A secondary query class using the current class as primary query
 */
public function useI18nQuery($locale = '<?php echo $defaultLocale ?>', $relationAlias = null, $joinType = Criteria::LEFT_JOIN)
{
	return $this
		->joinI18n($locale, $relationAlias, $joinType)
		->useQuery($relationAlias ? $relationAlias : '<?php echo $i18nRelationName ?>', '<?php echo $namespacedQueryClass ?>');
}
