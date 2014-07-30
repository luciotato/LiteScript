IF statement Tests
-------------------

    var Tests = 

      'support a block style':

        code: function
          
          var result=[]

          var a = 4
          if a is 4
            result.push('block')

          if a is 3
            result.push('should not')
          end if

          return result

        expected: ['block']



      'if-then: one line if statement':

        code:function

          var result=[]

          var a = 4, b = 5
          
          if a is 4 then result.push(1)
          
          if a isnt 3 then result.push(2)

          if b>3, result.push(3)

          return result

        expected: [1,2,3]



      'else-block: support a block style':

        code: function

          var result=[]

          var a = 4, x

          if a is 4
            result.push(1)
            x = 4
          else
            result.push('else should not bi executed')
          
          if a is 3
            result.push('if-true should not be executed')
          else
            result.push(2)
            x = 3
          end if

          result.push(x)

          return result

        expected:[1,2,3]


      'else-if: support if - else if':

        code: function

          var result=[]

          var a = 4
          var x

          if a is 'moo'
            result.push('the cow')
          else if a is 3
            result.push('if-true should not be executed')
          else if no x
            result.push(1)
          else
            result.push('last-else')
          end if

          if a is 'no'
            result.push('no')
          else if a isnt 4
            result.push('if-true should not be executed')
          else if x
            result.push('neither')
          else
            result.push(2) 
          end if

          return result

        expected:[1,2]


