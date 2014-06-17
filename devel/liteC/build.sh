#if node  lite-js -compile Core2 -o Ctest -nomap; then 
#    echo compiled 1 OK
    #echo 1:$1 2:$2 3:$3
    if lite -use $2/lib -v 2 -compile test-Core2 -o Ctest -nomap; then
        echo compiled 2 OK
    fi
#fi

