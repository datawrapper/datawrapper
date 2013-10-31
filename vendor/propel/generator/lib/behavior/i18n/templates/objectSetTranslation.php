
/**
 * Sets the translation for a given locale
 *
 * @param     <?php echo $i18nTablePhpName ?> $translation The translation object
 * @param     string $locale Locale to use for the translation, e.g. 'fr_FR'
 *
 * @return    <?php echo $objectClassname ?> The current object (for fluent API support)
 */
public function setTranslation($translation, $locale = '<?php echo $defaultLocale ?>')
{
    $translation->set<?php echo $localeColumnName ?>($locale);
    $this->add<?php echo $i18nTablePhpName ?>($translation);
    $this->currentTranslations[$locale] = $translation;

    return $this;
}
