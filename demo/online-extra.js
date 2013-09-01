function padLines(src,result) {

    // keep a "padded Source" to match lines on result
    // add lines to result if needed

    while (src.length < result.length) {
        src.push(""); //add line
    }

    while (result.length < src.length) {
        result.push(""); //add line
    }
}
 


