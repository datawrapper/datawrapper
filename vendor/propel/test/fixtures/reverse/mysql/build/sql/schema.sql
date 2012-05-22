DROP TABLE book;
DROP VIEW view_book_titles;

CREATE TABLE book
(
    id INTEGER NOT NULL AUTO_INCREMENT COMMENT 'Book Id',
    title VARCHAR(255) NOT NULL COMMENT 'Book Title',
    isbn VARCHAR(24) NOT NULL COMMENT 'ISBN Number',
    price FLOAT COMMENT 'Price of the book.',
    PRIMARY KEY (id)
) ENGINE=InnoDB COMMENT='Book Table';

CREATE VIEW view_book_titles AS SELECT title FROM book;
