# PortMatrixServer []()

This is the server project of the [PortMatrix](https://github.com/peterfuerholzhsrch/PortMatrix) web application. See under the PortMatrix sibling project about a general overview.

## File Overview
 
Following files are needed for the Heroku deployment only:

* `.env`
* `deployApp.sh`
Unfortunately the settings within `.env` did not work in the cloud in my case. (When using `heroku local web` ìt is OK.)
So I configured these settings via Heroku's dashboard (Settings, Config Variables).

## Directory `/data`
This project uses NeDB as database engine. Since the database was not the main issue we sticked to this simple solution. A change to MongoDB is easily possible.



