// SAMPLE - For Loop sugar

function padLines(src,result)

	for var n=0 to src.length-1
		if src[n] contains 'function' then
			result.push(src[n]) //add line
	end for


	for each line in src
		if line contains 'function' then
			console.log("line " + index)
			result.push(line) //add line
	end for

end function

function peekNextItem() // peek ahead next code line

    for each item in source, starting at pos.lineIndex
        if item.hasCode then return item

    return null; //no more code lines

end function

