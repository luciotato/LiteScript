Try/Catch/Throw Statements
--------------------------

    var Tests = 

      'accept try catch blocks and catch throw errors':
    
        code: function

            var 
              x,y,z = 3
              caught = false
              outerE ='nada'

            try
              x = 1
              y = 2
              throw 'err'
              z = -1
        
            catch e
              #e.should.equal 'err'
              outerE = e
              caught = true

            end try
        
            return [x,y,z,outerE,caught]

        expected: [1,2,3,'err',true]


      'exception block':
    
        code: function

            var 
              x,y,z = 3
              caught = false
              e='nada'

            x = 1
            y = 2
            throw 'err'
            z = -1

            return 'not caught'
      
            exception err

                caught = true
                return [x,y,z,err,caught]

            return 'afer block, should not be'

        expected: [1,2,3,'err',true]


      'fail with msg, should throw new Error(msg)':
    
        code: function

            var 
              x,y,z=3
              caught = false
              e='nada'

            x = 1
            y = 2
            fail with 'I did it on purpose'
            z = -1

            return 'not caught'
      
            exception err

                caught = true

                #e should be instance of Error

                return [x,y,z,err.message,caught]

            return 'afer block, should not be'

        expected: [1,2,3,'I did it on purpose',true]


      'finally':
    
        code: function

            var 
              x,y,z=3
              caught = false
              last='nada'

            x = 1
            y = 2
            fail with 'I did it on purpose'
            z = -1

            return 'not caught'
      
            exception err
                caught = true

            finally
                return [caught,"finally"]

        expected: [true,'finally']
