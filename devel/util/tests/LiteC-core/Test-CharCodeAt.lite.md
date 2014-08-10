
    //var list="01234ABCDabcd \0xC1\0x80 \0xC2\0x80   \0xE1\0x80\0x80 \0xE2\0x80\0x8A  \0xF2\0x80\0x80\0x80 \0xF2\0x80\0x8A\0x80"

    var list="01234ABCDabcd \u0200\u041a\u043b\u0443\u0431\u0F31"

    print "--------------------"
    print "---charCodeAt(inx)--"
    print "--------------------"

    for inx=0 to list.length-1
        print list.charCodeAt(inx)

    print "------------------"
    print "---for each item--"
    print "------------------"

    for each item:string in list
        print item.charCodeAt(0)
