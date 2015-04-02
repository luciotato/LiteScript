#PMREX - Tokenizer helper
PMREX is composed of three functions 
which are simple but enough to tokenize a stream of chars (unicode)

By using this functions we can avoid Regex Patterns to tokenize

### public function whileRanges(chunk:string, rangesStr:string) returns string

whileRanges, advance while the char is in the ranges specified. 
will return string up to first char not in range, or entire string if all chars are in ranges
e.g.: whileRanges("123ABC","0-9") will return "123"
e.g.: whileRanges("123ABC","0-9A-Z") will return "123ABC" because all chars are in range

        var len = chunk.length

        //normalize ranges 
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

untilRanges: advance from start, *until* a char is in one of the specified ranges.
will return string up to first char *in range* or entire string if there's no match
e.g.: findRanges("123ABC","A-Z") will return "123"
e.g.: findRanges("123ABC","C-FJ-L") will return "123AB"

        var len = chunk.length

        //normalize ranges
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

Range examples: 

* "1-9" means all chars between 1 and 9 (inclusive)
* "1-9J-Z" means all chars between 1 and 9 or between "J" and "Z"
* "1-9JNW" means all chars between 1 and 9, a "J" a "N" or a "W"

This function returns a normalized range string without "-"
and composed always from ranges:
/*
    "1-9" => "19"
    "1-9J-Z" => "19JZ"
    "1-9JNW" => "19JJNNWW"
*/

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

advance until unescaped endChar
return string up to endChar (excluded)

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

return the string up to the matching quote, excluding both
Note: chunk[0] MUST be the openinig quote, either single-quote or double-quote
        
        if no chunk.charAt(0) in '/"\'', throw "chunk.charAt(0) MUST be the openinig quote-char"
        return whileUnescaped(chunk.slice(1),chunk.charAt(0))
