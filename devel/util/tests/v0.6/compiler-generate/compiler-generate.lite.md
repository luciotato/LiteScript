
    print """
        this code is static
        but the next statements are generated on the fly 
        by using 'compiler generate'
    """

build date, updated at compile-time

    var buildDate

    compiler generate(lines:string array)
        lines.push "buildDate = '#{new Date}'"

    print "this code was compiled on #{buildDate}"

silly

    compiler generate(lines:string array)
        for n=1 to 10
            lines.push "print #{n}"
