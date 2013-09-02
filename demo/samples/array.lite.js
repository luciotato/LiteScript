
    var words=['this','is','a','test']
    var result

    function isSmall(s:string)
        bool return s.length<=3

    function isAFourLetterWord(s:string)
        bool return s.length is 4

    result = filter words where isSmall(item)
    console.log("small words: $(result.join())")

    filter words //default is: var data = xxx.filter
        where isAFourLetterWord(item) and item contains 't';
    console.log("four letter words containing 't': $(data.join())")

    var converted = map words
            function(tem,index)
                return "$item ($item.length)"

    console.log("words length: $(converted.join())")
