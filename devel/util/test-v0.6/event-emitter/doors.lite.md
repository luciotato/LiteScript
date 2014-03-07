    global import events

    class Door extends events.EventEmitter

      properties
        color, isOpen

      constructor new Door(color) 
        .color = color

      method open
        .isOpen = true
        .emit 'open'

      method close(force)
        .isOpen = false
        .emit 'close', force

      method show
        print 'the #{.color} door is #{.isOpen? "open" else "closed"}'


Test


    var frontDoor = new Door('brown')
     
    frontDoor.on 'open' ->
        print 'ring ring ring'

    frontDoor.on 'close' ->
        declare this:Door
        print 'the #{.color} door closes'
    
    frontDoor.on 'close' -> force
        if force>5, print 'with a slam'


    with frontDoor
        .show
        .open
        .show
        .close
        .show
        .open
        .show
        .close 7
        .show

Test 2
  
    global import http

    print 'checkip.dyndns.org'

    http.get { host: 'checkip.dyndns.org' } -> res

        var data = ''

        res.on 'data' -> chunk 
            data += chunk.toString()

        res.on 'end' -> 
            console.log data
