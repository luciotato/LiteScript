#PMREX, poor's man RegEx

whileRanges, advance from start, while the char is in the ranges specified. 
will return index of first char not in range.
e.g.: whileRanges("123ABC",0,"0-9J-Z") will return 3, string[3] is "A"

### public function whileRanges(chunk:string, start, rangesStr:string)
        var ranges = []

        //parse ranges in array [[from,to],[from,to]...]
        var ch:string, range:array
        var inx=0
        while inx<rangesStr.length
            ch = rangesStr.charAt(inx)
            range=[ch]
            if rangesStr.charAt(inx+1) is '-' 
                inx++
                range.push rangesStr.charAt(inx+1)
            else
                range.push ch
            ranges.push range
            inx++

        //advance while in any of the ranges
        inx=start
        do while inx<chunk.length
            ch = chunk.charAt(inx)
            var isIn=false
            //check all ranges
            for r=0 to ranges.length-1
                if ch>=ranges[r][0] and ch<=ranges[r][1]
                    isIn=true
                    break
            end for
            if not isIn, return inx
            inx++
        loop

        return inx

### public function whileUnescaped(chunk:string,start,endChar)

        //advance until unescaped endChar
        var pos = start
        do
            var inx = chunk.indexOf(endChar,pos)
            if inx is -1, return -1
            if inx>0 and chunk.charAt(inx-1) is '\\' #escaped
                var countEscape=1
                while inx>countEscape and chunk.charAt(inx-1-countEscape) is '\\' #escaped-escape
                    countEscape++
                if countEscape % 2 is 0 //even, means escaped-escape, i.e: not escaped
                    return inx+1    // so found is final
                else
                    pos=inx+1 //odd means escaped quote, so it's not final
            else
                return inx+1
        loop

### public function findMatchingQuote(chunk:string, start)

Note: chunk[start] MUST be the openinig quote

        return whileUnescaped(chunk,start+1,chunk.charAt(start))
