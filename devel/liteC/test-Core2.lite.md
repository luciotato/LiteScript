test Core2

    import Core2

    import log from '../source-v0.8/log'

    var c:int=0

    print Core2.inRange(1,c,10)

    var a = "murcielago"

    print 
        a.indexOf('e')
        a.indexOf('lago')
        a.slice(3,6)

    var b = new Core2.TestClass([0,1,2,3,4,5,6])
    print '[#{b.myArr.join(", ")}]'
    print "b.sliceJoin(2,3)", b.sliceJoin(2,3)
    print "b.sliceJoin(-4)", b.sliceJoin(-4)
  
    b = new Core2.TestClass([])
    print '[#{b.myArr.join(", ")}]'
    print "b.sliceJoin(2,3)", b.sliceJoin(2,3)
    print "b.sliceJoin(-4)", b.sliceJoin(-4)

