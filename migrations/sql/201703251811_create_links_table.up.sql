CREATE TABLE IF NOT EXISTS links (
  id bigint(20) NOT NULL AUTO_INCREMENT,
  creationDate datetime DEFAULT NULL,
  updateDate datetime DEFAULT NULL,
  url varchar(255) DEFAULT NULL,
  title varchar(255) DEFAULT NULL,
  votes int(11) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY idxUrl (url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
