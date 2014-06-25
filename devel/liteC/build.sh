#if node  lite-js -compile Core2 -o Ctest -nomap; then 
#    echo compiled 1 OK
    #echo 1:$1 2:$2 3:$3
    if node lite-js -v 2 -D PROD_C -compile test-Core2 -o Ctest ; then
        echo compiled 2 OK
    fi
#fi

