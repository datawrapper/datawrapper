
/**
 * Returns the current translation for a given locale
 *
 * @param     string $locale Locale to use for the translation, e.g. 'fr_FR'
 * @param     PropelPDO $con an optional connection object
 *
 * @return <?php echo $i18nTablePhpName ?>
 */
public function getTranslation($locale = '<?php echo $defaultLocale ?>', PropelPDO $con = null)
{
	if (!isset($this->currentTranslations[$locale])) {
		if (null !== $this-><?php echo $i18nListVariable ?>) {
			foreach ($this-><?php echo $i18nListVariable ?> as $translation) {
				if ($translation->get<?php echo $localeColumnName ?>() == $locale) {
					$this->currentTranslations[$locale] = $translation;
					return $translation;
				}
			}
		}
		if ($this->isNew()) {
			$translation = new <?php echo $i18nTablePhpName ?>();
			$translation->set<?php echo $localeColumnName ?>($locale);
		} else {
			$translation = <?php echo $i18nQueryName ?>::create()
				->filterByPrimaryKey(array($this->getPrimaryKey(), $locale))
				->findOneOrCreate($con);
			$this->currentTranslations[$locale] = $translation;
		}
		$this->add<?php echo $i18nSetterMethod ?>($translation);
	}

	return $this->currentTranslations[$locale];
}
