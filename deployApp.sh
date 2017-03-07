# BE CAREFUL RUNNING THIS FILE!! (Better one command after the other!!)


# Do only once:
cd ~/Documents/HSR/
mkdir PortMatrixDeploy
cd PortMatrixDeploy
heroku create


cp -r ~/WebstormProjects/PortMatrixServer/* .

pushd ~/WebstormProjects/PortMatrix
$(npm bin)/ng build
popd

cp -r ~/WebstormProjects/PortMatrixServer/dist ./public

# git add .
#
# git commit -m "Demo"
#
# git push heroku master
#
# heroku open cool