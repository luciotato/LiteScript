Core2

    public function inRange(min:int, value:int, max:int) returns int
        return case 
                when value<min then min
                when value>max then max
                else value
               end

    public class TestClass

        properties
            value
            myArr:string array

        constructor new TestClass(initValue:Object)
            .value = initValue
            
        method indexOf(searched:string, fromIndex:int=0) returns int

            for n=fromIndex while n<.myArr.length
                if .myArr[n] is searched, return n;
            return -1
            
        method sliceJoin(start:int, endPos:int=-1) returns string

            var len:int = .myArr.length

            start = inRange( 0, start<0?len+start:start , len)

            endPos = inRange( 0, endPos<0?len+endPos:endPos , len)

            if start>=endPos, return ''

            var result:string
            for n=start to endPos 
                result += .myArr[n] + ' '

            return result


