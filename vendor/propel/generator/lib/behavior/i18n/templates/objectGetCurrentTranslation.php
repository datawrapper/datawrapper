
/**
 * Returns the current translation
 *
 * @param     PropelPDO $con an optional connection object
 *
 * @return <?php echo $i18nTablePhpName ?>
 */
public function getCurrentTranslation(PropelPDO $con = null)
{
    return $this->getTranslation($this->getLocale(), $con);
}
