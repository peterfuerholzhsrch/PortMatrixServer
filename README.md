# PortMatrixServer []()

This is the server project of the PortMatrix web application. See under the PortMatrix sibling project about a general overview.

## File Overview
 
Following files are needed for the Heroku deployment only:
* .env
* deployApp.sh
Unfortunately the settings within .env do not work in the cloud. (When using 'heroku local web' is OK.)

/data
This project uses NeDB as database. Since the database was not the main issue we sticked to this simple solution. A change to 
MongoDB should be possible with ease.



