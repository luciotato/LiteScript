Test

    public function inRange(min:int, value:int, max:int) returns int
        return case 
                when value<min then min
                when value>max then max
                else value
               end

    public class TestClass

        properties
            myArr: string array

        constructor new TestClass(initValue:array)
            .myArr = initValue
            
        method indexOf(searched:string, fromIndex:int=0) returns int

            for n=fromIndex while n<.myArr.length
                if .myArr[n] is searched, return n;
            return -1
            
        method sliceJoin(start, endPos) returns string

            var len = .myArr.length

            default endPos = len+1

            start = inRange( 0, start<0?len+start:start , len-1)

            endPos = inRange( 0, endPos<0?len+endPos:endPos , len-1)

            if start>=endPos, return ''

            var result:string = ""
            for n=start to endPos 
                result = "#{result}#{.myArr[n]} ";

            return result


