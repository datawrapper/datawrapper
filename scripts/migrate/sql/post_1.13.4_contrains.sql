ALTER TABLE `user_organization` ADD (
    CONSTRAINT `user_organization_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`),
    CONSTRAINT `user_organization_FK_2`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organization` (`id`)
);

ALTER TABLE `plugin_organization` ADD (
	CONSTRAINT `plugin_organization_FK_1`
        FOREIGN KEY (`plugin_id`)
        REFERENCES `plugin` (`id`),
    CONSTRAINT `plugin_organization_FK_2`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organization` (`id`)
)

ALTER TABLE `user_product` ADD
(
    CONSTRAINT `user_product_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`),
    CONSTRAINT `user_product_FK_2`
        FOREIGN KEY (`product_id`)
        REFERENCES `product` (`id`)
);

ALTER TABLE `organization_product` ADD
(
    CONSTRAINT `organization_product_FK_1`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organization` (`id`),
    CONSTRAINT `organization_product_FK_2`
        FOREIGN KEY (`product_id`)
        REFERENCES `product` (`id`)
);

ALTER TABLE `organization_theme` ADD
(
    CONSTRAINT `organization_theme_FK_1`
        FOREIGN KEY (`organization_id`)
        REFERENCES `organization` (`id`),
    CONSTRAINT `organization_theme_FK_2`
        FOREIGN KEY (`theme_id`)
        REFERENCES `theme` (`id`)
);

ALTER TABLE `user_theme` ADD
(
    CONSTRAINT `user_theme_FK_1`
        FOREIGN KEY (`user_id`)
        REFERENCES `user` (`id`),
    CONSTRAINT `user_theme_FK_2`
        FOREIGN KEY (`theme_id`)
        REFERENCES `theme` (`id`)
);
