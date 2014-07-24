#compile lite-cli (command line interface) w/o comments or mapsource

if lite -c lite-cli -o ../liteCompiler-v0.7 -noval -nomap -comments 0; then 
    echo compiled lite-cli v0.7
    #echo copy to [home]/lib
    #cp -u ../liteCompiler-v0.7/lite-cli.js ../../lib/
    #cp -u ../liteCompiler-v0.7/Args.js ../../lib/
    #echo copy to ../../devel/util/out/lib
    #cp -u ../liteCompiler-v0.7/lite-cli.js ../../devel/util/out/lib
    #cp -u ../liteCompiler-v0.7/Args.js ../../devel/util/out/lib
fi
