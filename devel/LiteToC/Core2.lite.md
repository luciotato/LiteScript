Core2

    function inRange(min:int, value:int, max:int)
        return case 
                when value<min then min
                when value>max then max
                else value
               end

    class String extends Object

        properties
            value: str
            length: int

        method indexOf(searched:string, fromIndex:int=0) returns int
            var sl:size_t = searched.length;
            for start=fromIndex while start<.length-sl
                if memcmp(this.value[start],searched,sl) is 0
                    return start;
            return -1
            
        method slice(start:int, end:int=-1) returns str

            len = .length

            start = inRange( 0, start<0?len+start:start , len)

            end = inRange( 0, end<0?len+end:end , len)

            if start>=end, return ''

            newstr = alloc(size+1)
            memcpy(newstr, this.value[start], size)
            newstr[size]='\0'

            return newstr


