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

