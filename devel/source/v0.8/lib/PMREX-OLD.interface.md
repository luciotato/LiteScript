#PMREX, poor's man RegEx

### public function whileRanges(chunk:string, start, rangesStr:string)

whileRanges, advance from start, while the char is in the ranges specified. 
will return index of first char not in range, or searched string length all chars in range
e.g.: whileRanges("123ABC",0,"0-9J-Z") will return 3, string[3] is "A"
e.g.: whileRanges("123ABC",0,"0-9A-Z") will return 6, string length because all chars are in range

### public function findRanges(chunk:string, start, rangesStr:string)

findRanges: advance from start, *until* a char in one of the specified ranges is found.
will return index of first char *in range* or searched string length if no match
e.g.: findRanges("123ABC",0,"A-Z") will return 3, string[3] is "A"
e.g.: findRanges("123ABC",0,"D-Z") will return 6 => length of "123ABC" => not found

### helper function parseRanges(rangesStr:string) returns string

### public function whileUnescaped(chunk:string,start,endChar)

### public function findMatchingQuote(chunk:string, start)

Note: chunk[start] MUST be the openinig quote

