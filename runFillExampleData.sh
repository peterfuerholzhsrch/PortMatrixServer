#! /bin/sh
#
# !!! for Linux and OS X !!!
#

# --matchall : execute files not ending with '-spec' as well
# We don't want ending '-spec' since fllExampleData.js should not be executed when running tests!

$(npm bin)/jasmine-node --matchall ./test/fillExampleData.js
