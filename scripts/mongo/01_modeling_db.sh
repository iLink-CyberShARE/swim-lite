#!/bin/bash

username=$MONGO_INITDB_ROOT_USERNAME
password=$MONGO_INITDB_ROOT_PASSWORD

echo 'Creating SWIM Modeling Database...'
if /usr/bin/mongorestore --username $username --password $password --authenticationDatabase admin --db modeling /downloads/dump/
then echo 'SWIM Modeling Created!'
fi
exit $?
