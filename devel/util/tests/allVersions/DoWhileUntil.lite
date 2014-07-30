while|until loops
-----------------

    lexer options string interpolation char is $

    var Tests = {

      'while':

        code: function

          var 
            i = 0
            iterable = ['this','is'
                          ,'a','test']
            out_s = ''
            sum=0

          while i<iterable.length
            out_s += "${iterable[i]}-"
            sum += i
            i++

          return [out_s,sum,i]

        expected: ["this-is-a-test-", 1+2+3, 4 ]


      'until':

        code: function

          var 
            i = 0, sum = 0
            iterable = ['this','is','a','test']
            out_s = ''

          until i is iterable.length
            out_s += "${iterable[i]}-"
            sum += i
            i++
          end loop

          return [out_s,sum]

        expected: ["this-is-a-test-", 1+2+3 ]


      'do while':

        code: function

          var 
            i = 0
            iterable = ['this','is',
                        'a','test']
            out_s = ''
            sum = 0

          do while i < iterable.length
            out_s += "${iterable[i]}-"
            sum += i
            i++
          loop

          return [out_s,sum,i]

        expected: ["this-is-a-test-", 1+2+3, 4 ]

      'do until':

        code: function

          var 
            i = 0
            iterable = ['this','is','a','test']
            out_s = ''
            sum = 0

          do until i is iterable.length
            out_s += "${iterable[i]}-"
            sum += i
            i++
          loop

          return [out_s,sum]

        expected: ["this-is-a-test-", 1+2+3 ]

      'when condition, break':

        code: function

          var 
            i = 0
            iterable = [
              {text:'this', value:15}
              {text:'is', value:30}
              {text:'a', value:40}
              {text:'test', value:"set"}
            ]
            out_s = ''
            sum = 0

          do while i<iterable.length
            
            out_s += "${iterable[i].text}."
            
            when iterable[i].value is "set", break
            
            sum += iterable[i].value

            i++

          loop 

          return [out_s,sum,i]

        expected: ["this.is.a.test.", 85, 3 ]


      'do... loop until.. continue':

        code: function

          var 
            i = 0
            s = ''

          do 
            i++
            s += i
            if i>=5, continue
            s += '-'
          loop until i is 7

          return s

        expected: "1-2-3-4-567"

    }
