Core2

    global declare CoreC

    public function inRange(min:int, value:int, max:int) returns int
        return case 
                when value<min then min
                when value>max then max
                else value
               end

    public class String2 extends Object

        properties
            value: str
            length: int

        constructor new String2(initStr:str)
            .value = initStr
            .length = strlen(initStr)

        method indexOf(searched:String2, fromIndex:int=0) returns int
            var sl:size_t = searched.length;
            for start=fromIndex while start<.length-sl
                if memcmp(this.value[start],searched.value,sl) is 0
                    return start;
            return -1
            
        method slice(start:int, endPos:int=-1) returns String2

            var len = .length

            start = inRange( 0, start<0?len+start:start , len)

            endPos = inRange( 0, endPos<0?len+endPos:endPos , len)

            if start>=endPos, return ''

            var size=endPos-start;
            var newstr = alloc(size+1)
            memcpy(newstr, this.value[start], size)
            newstr[size]='\0'

            return new String2(newstr)


