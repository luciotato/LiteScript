
### class GeneralOptions

      properties
            verboseLevel = 1
            warningLevel = 1
            comments = 1
            target = DEFAULT_TARGET
            debugEnabled = undefined
            skip = undefined
            nomap = undefined
            single = undefined
            compileIfNewer = undefined
            browser =undefined
            extraComments =1
            defines: array of string = []

            projectDir:string 
            mainModuleName:string = 'unnamed'
            outDir = './out'

            storeMessages: boolean = false
            literalMap: boolean // produce "new Map()" on "{}"" instead of a js object
            // activated with: 'lexer options literal map', required to make C-production of ls-code

            version: string

            now: Date = new Date()

      method toString
            return """
                outDir:#{.outDir}
                verbose:#{.verboseLevel}
                defines:#{.defines.join()}
                """

module vars

    #ifdef PROD_C
    var DEFAULT_TARGET="c"
    #else
    var DEFAULT_TARGET="js"
    #end if

