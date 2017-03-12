# PortMatrixServer []()

This is the server project of the PortMatrix web application. See under the PortMatrix sibling project about a general overview.

## File Overview
 
Following files are needed for the Heroku deployment only:
* .env
* deployApp.sh

/data
This project uses NeDB as database. Since the database was not the main issue we sticked to this simple solution. A change to 
MongoDB should be possible with ease.
The checked in files contain the following:
* one user: a@a.a, password: a
* the user has one project and around 60 network switchings



