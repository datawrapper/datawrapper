
/**
 * Sets the locale for translations
 *
 * @param     string $locale Locale to use for the translation, e.g. 'fr_FR'
 *
 * @return    <?php echo $objectClassname ?> The current object (for fluent API support)
 */
public function setLocale($locale = '<?php echo $defaultLocale ?>')
{
	$this->currentLocale = $locale;

	return $this;
}
