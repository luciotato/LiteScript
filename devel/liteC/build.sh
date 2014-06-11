#if node  lite-js -compile Core2 -o Ctest -nomap; then 
#    echo compiled 1 OK
    if node  lite-js -v 2 -compile test-Core2 -o Ctest -nomap; then
        echo compiled 2 OK
    fi
#fi

