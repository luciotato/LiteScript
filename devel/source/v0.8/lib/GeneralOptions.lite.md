
### class GeneralOptions

      properties
            verboseLevel = 1
            warningLevel = 1
            comments = 1
            #ifdef PROD_C
            target ="c"
            #else
            target ="js"
            #end if
            debugEnabled = undefined
            perf=0 // performace counters 0..2
            skip = undefined
            nomap = undefined
            single = undefined
            compileIfNewer = undefined //compile only if source is newer
            browser =undefined //compile js for browser environment (instead of node.js env.)
            defines: array of string = []
            es6: boolean //compile to js-EcmaScript6

            projectDir:string 
            mainModuleName:string = 'unnamed'
            outDir = './out'

            storeMessages: boolean = false
            literalMap: string // produce "new Class().fromObject({})" on "{}"" instead of a js object
            // activate with: 'lexer options object literal is Foo'. A class is required to produce C-code 

            version: string

            now: Date = new Date()

      method toString
            return """
                outDir:#{.outDir}
                verbose:#{.verboseLevel}
                defines:#{.defines.join()}
                """

