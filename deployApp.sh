#! /bin/sh
#
# !!! for Linux and OS X !!!
#

#
# Following script can be used when PortMatrix shall be run on the HEROKU cloud.
# You need a free Heroku account on www.heroku.com.
#



# BE CAREFUL RUNNING THIS FILE!! (Execute one command after the other!!)

cd ~/Documents/HSR/

# DO ONLY ONCE:
mkdir PortMatrixDeploy
# END: DO ONLY ONCE:


cd PortMatrixDeploy
rm -r *


# DO ONLY ONCE:
heroku create
# END: DO ONLY ONCE:


cp -r ~/WebstormProjects/PortMatrixServer/* .
cp -r ~/WebstormProjects/PortMatrixServer/.env .

# FILL IN PASSWORD IN FILE '.env' !!!

pushd ~/WebstormProjects/PortMatrix
$(npm bin)/ng build
popd

cp -r ~/WebstormProjects/PortMatrix/dist/ ./public/


# TEST LOCALLY:
heroku local web
# open browser on 'localhost:5000'


# DO ONLY ONCE:
git init
# END: DO ONLY ONCE:


git add .
git commit -m "YOUR COMMENT"

use 'git push --force ...' to completely overwrite previous deployment:
git push heroku master

# open browser
heroku open

# show logs
heroku logs --tail

# browse content
heroku run bash