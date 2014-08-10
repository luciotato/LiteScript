#PMREX, poor's man RegEx


### public function whileRanges(chunk:string, rangesStr:string) returns string

whileRanges, advance from start, while the char is in the ranges specified. 
will return string upto first char not in range, or chunk string if all chars in range
e.g.: whileRanges("123ABC",0,"0-9J-Z") will return "123"
e.g.: whileRanges("123ABC",0,"0-9A-Z") will return "123ABC" because all chars are in range

        var len = chunk.length

        //parse ranges into an array [[from,to],[from,to]...]
        var ranges = parseRanges(rangesStr)

        //advance while in any of the ranges
        var inx=0
        do while inx<len
            var ch = chunk.charAt(inx)
            var isIn=false
            //check all ranges
            for r=0 to ranges.length-1, r+=2
                if ch>=ranges.charAt(r) and ch<=ranges.charAt(r+1)
                    isIn=true
                    break
            end for
            if not isIn, break 
            inx++
        loop

        return chunk.slice(0,inx)


### public function untilRanges(chunk:string, rangesStr:string) returns string

findRanges: advance from start, *until* a char in one of the specified ranges is found.
will return index of first char *in range* or searched string length if no match
e.g.: findRanges("123ABC",0,"A-Z") will return 3, string[3] is "A"
e.g.: findRanges("123ABC",0,"D-Z") will return 6 => length of "123ABC" => not found

        var len = chunk.length

        //parse ranges into an array [[from,to],[from,to]...]
        var ranges = parseRanges(rangesStr)

        //advance until match
        var inx=0
        do while inx<len
            var ch = chunk.charAt(inx)
            //check all ranges
            for r=0 to ranges.length-1, r+=2
                if ch>=ranges.charAt(r) and ch<=ranges.charAt(r+1)
                    return chunk.slice(0,inx)
            end for
            inx++
        loop

        return chunk.slice(0,inx)

### helper function parseRanges(rangesStr:string) returns string

        var result = ""

        //parse ranges in array [[from,to],[from,to]...]
        var ch:string
        var inx=0
        while inx<rangesStr.length
            ch = rangesStr.charAt(inx)
            result &= ch
            if rangesStr.charAt(inx+1) is '-' 
                inx++
                result &= rangesStr.charAt(inx+1)
            else
                result &= ch
            inx++

        return result


### public function whileUnescaped(chunk:string,endChar:string) returns string

        //advance until unescaped endChar
        var pos = 0
        do
            var inx = chunk.indexOf(endChar,pos)
            
            if inx is -1, fail with 'missing closing quote-char: #{endChar} ' // closer not found
            
            if inx>0 and chunk.charAt(inx-1) is '\\' #escaped
                
                var countEscape=1
                while inx>countEscape and chunk.charAt(inx-1-countEscape) is '\\' #escaped-escape
                        countEscape++

                if countEscape % 2 is 0 //even, means escaped-escape, means: not escaped
                    break    //we found an unescaped quote
                else
                    pos=inx+1 //odd means escaped quote, so it's not closing quote
            else
                //found unescaped
                break
        loop
        return chunk.slice(0,inx)

### public function quotedContent(chunk:string) returns string

Note: chunk[0] MUST be the openinig quote
        
        if no chunk.charAt(0) in '/"\'', throw "chunk.charAt(0) MUST be the openinig quote-char"
        return whileUnescaped(chunk.slice(1),chunk.charAt(0))
