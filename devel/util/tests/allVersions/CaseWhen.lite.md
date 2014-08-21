case Statement Test
-----------------------

    declare var expect:function

    var Tests = 

      'basic': 
        code:function
          
          var a = 4, ais:string
          case a 
              when 4: 
                ais = 'is 4'
              when 5:
                ais = 'is 5'
              else
                ais='other'

          expect ais, 'is 4'
          
          a=5
          case a 
              when 4: 
                ais = 'is 4'
              when 5:
                ais = 'is 5'
              else
                ais='other'

          expect ais, 'is 5'

          a=1
          case a 
              when 4: 
                ais = 'is 4'
              when 5:
                ais = 'is 5'
              else
                ais='other'

          expect ais, 'other'



      'composed': 
        code:function

          helper function check(a)
            
            var result

            case a 
                when 'a','b','c': 
                  result = 'is abc'

                when 'l','m','t':
                  result = 'is lmt'

                else
                  result='other'

            return result
          
          end helper function

          expect check('b'),'is abc'
          expect check('a'),'is abc'
          expect check('c'),'is abc'
          
          expect check('l'),'is lmt'
          expect check('m'),'is lmt'

          expect check('x'),'other'
          expect check(12),'other'
          expect check(12.4),'other'
          expect check({}),'other'


      'true-expression': 
        code:function

          helper function check(a)

            var result
            case 
                when a in 'abc' or a in 'ABC': 
                  result = 'is abc'

                when a in 'lmt' or a in 'LMT':
                  result = 'is lmt'

                when a>1 and a<10 or a is 42:
                  result = 'between 1 and 10, or 42'

                else
                  result='other'

            return result

          end helper function

          expect check('b'),'is abc'
          expect check('a'),'is abc'
          expect check('c'),'is abc'
          
          expect check('l'),'is lmt'
          expect check('m'),'is lmt'

          expect check('x'),'other'
          expect check(12),'other'
          expect check(5),'between 1 and 10, or 42'
          expect check(42),'between 1 and 10, or 42'
          expect check({}),'other'

    