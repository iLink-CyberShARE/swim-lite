#!/bin/bash

username=root
password=$MYSQL_ROOT_PASSWORD
dbname=swim-logs
key=$TOKEN_SECRET_KEY

mysql -D$dbname -u$username -p$password -e"INSERT INTO hush (value) VALUES ('$key');"

exit 0
