#include "_dispatcher.h"
// methods
static str _ADD_VERBS[] = { //string name for each distinct method name
    "isDirectory"
,     "isFile"
,     "option"
,     "valueFor"
,     "getPos"
,     "search"
,     "compile"
,     "compileFile"
,     "compileFileOnModule"
,     "parseOnModule"
,     "createNewModule"
,     "produceModule"
,     "importDependencies"
,     "importModule"
,     "getInterface"
,     "compilerVar"
,     "setCompilerVar"
,     "redirectOutput"
,     "lock"
,     "getParent"
,     "positionText"
,     "sayErr"
,     "warn"
,     "throwError"
,     "throwParseFailed"
,     "parse"
,     "produce"
,     "parseDirect"
,     "opt"
,     "req"
,     "reqOneOf"
,     "optList"
,     "optSeparatedList"
,     "optFreeFormList"
,     "reqSeparatedList"
,     "listArgs"
,     "out"
,     "outSourceLineAsComment"
,     "outSourceLinesAsComment"
,     "getEOLComment"
,     "addSourceMap"
,     "levelIndent"
,     "parseAccessors"
,     "addAccessor"
,     "hasAdjective"
,     "parseType"
,     "declareName"
,     "addMemberTo"
,     "tryGetMember"
,     "getScopeNode"
,     "findInScope"
,     "tryGetFromScope"
,     "addToScope"
,     "addToSpecificScope"
,     "createScope"
,     "tryGetOwnerNameDecl"
,     "callOnSubTree"
,     "assignIfUndefined"
,     "reset"
,     "initSource"
,     "preParseSource"
,     "checkTitleCode"
,     "tokenize"
,     "preprocessor"
,     "process"
,     "nextSourceLine"
,     "replaceSourceLine"
,     "parseTripleQuotes"
,     "checkMultilineComment"
,     "checkConditionalCompilation"
,     "setPos"
,     "posToString"
,     "getPrevIndent"
,     "consumeToken"
,     "nextToken"
,     "returnToken"
,     "nextCODELine"
,     "say"
,     "throwErr"
,     "splitExpressions"
,     "dump"
,     "tokenizeLine"
,     "recognizeToken"
,     "start"
,     "setHeader"
,     "put"
,     "startNewLine"
,     "ensureNewLine"
,     "blankLine"
,     "getResult"
,     "close"
,     "markSourceMap"
,     "append"
,     "saveLine"
,     "startsWith"
,     "endsWith"
,     "trimRight"
,     "trimLeft"
,     "capitalized"
,     "quoted"
,     "rpad"
,     "remove"
,     "parseList"
,     "addToAllProperties"
,     "getNames"
,     "declare"
,     "evaluateAssignments"
,     "createNameDeclaration"
,     "declareInScope"
,     "getTypeFromAssignedValue"
,     "validatePropertyAccess"
,     "produceForMap"
,     "tryGetReference"
,     "getResultType"
,     "calcReference"
,     "calcReferenceArr"
,     "getTypeName"
,     "addArguments"
,     "getPrecedence"
,     "declareIntoVar"
,     "growExpressionTree"
,     "getValue"
,     "forEach"
,     "parseParametersAndBody"
,     "addMethodToOwnerNameDecl"
,     "createReturnType"
,     "produceFunctionBody"
,     "processAppendToExtends"
,     "produceHeader"
,     "outClassTitleComment"
,     "produceStaticListMethodsAndProps"
,     "produceClassRegistration"
,     "produceCallNamespaceInit"
,     "getRefFilename"
,     "setTypes"
,     "setSubType"
,     "processItems"
,     "produceInstanceOfLoop"
,     "isDeclaration"
,     "isExecutableStatement"
,     "validate"
,     "produceDeclaredExternProps"
,     "produceSustance"
,     "produceMainFunctionBody"
,     "producePropertiesInitialValueAssignments"
,     "produceLooseExecutableStatements"
,     "getCompiledLines"
,     "getCompiledText"
,     "addToExport"
,     "confirmExports"
,     "produceDispatcher"
,     "normalize"
,     "setMember"
,     "findOwnMember"
,     "ownMember"
,     "getMemberCount"
,     "replaceForward"
,     "makePointTo"
,     "originalDeclarationPosition"
,     "caseMismatch"
,     "addMember"
,     "composedName"
,     "info"
,     "findMember"
,     "hasProto"
,     "getMembersFromObjProperties"
,     "isInParents"
,     "processConvertTypes"
,     "convertType"
,     "assignTypeFromValue"
,     "assignTypebyNameAffinity"
,     "checkSuperChainProperties"
,     "outSuperChainProps"
,     "getComposedName"
,     "addToAllMethodNames"
,     "outWithExtension"
,     "searchModule"
};
// propery names
static str _ADD_THINGS[] = { //string name for each distinct property name
    "mtime"
,     "mode"
,     "soft"
,     "lastIndex"
,     "items"
,     "verboseLevel"
,     "warningLevel"
,     "comments"
,     "target"
,     "debugEnabled"
,     "skip"
,     "nomap"
,     "single"
,     "compileIfNewer"
,     "browser"
,     "defines"
,     "es6"
,     "projectDir"
,     "mainModuleName"
,     "outDir"
,     "storeMessages"
,     "literalMap"
,     "version"
,     "now"
,     "options"
,     "moduleCache"
,     "rootModule"
,     "compilerVars"
,     "main"
,     "Producer"
,     "recurseLevel"
,     "parent"
,     "keyword"
,     "type"
,     "keyType"
,     "itemType"
,     "lexer"
,     "lineInx"
,     "sourceLineNum"
,     "column"
,     "indent"
,     "locked"
,     "extraInfo"
,     "accessors"
,     "executes"
,     "hasSideEffects"
,     "isMap"
,     "scope"
,     "skipSemiColon"
,     "project"
,     "filename"
,     "lines"
,     "infoLines"
,     "line"
,     "infoLine"
,     "token"
,     "index"
,     "interfaceMode"
,     "stringInterpolationChar"
,     "last"
,     "maxSourceLineNum"
,     "hardError"
,     "softError"
,     "outCode"
,     "text"
,     "tokens"
,     "pre"
,     "section"
,     "post"
,     "postIndent"
,     "lineNum"
,     "currLine"
,     "header"
,     "fileMode"
,     "filenames"
,     "fileIsOpen"
,     "fHandles"
,     "lastOriginalCodeComment"
,     "lastOutCommentLine"
,     "sourceMap"
,     "exportNamespace"
,     "orTempVarCount"
,     "used"
,     "buf"
,     "col"
,     "lin"
,     "args"
,     "list"
,     "aliasVarRef"
,     "assignedValue"
,     "nameDecl"
,     "declared"
,     "varRef"
,     "body"
,     "exceptionBlock"
,     "catchVar"
,     "finallyBody"
,     "specifier"
,     "expr"
,     "conditional"
,     "elseStatement"
,     "nextIf"
,     "preWhileUntilExpression"
,     "postWhileUntilExpression"
,     "control"
,     "variant"
,     "indexVar"
,     "mainVar"
,     "iterable"
,     "where"
,     "conditionPrefix"
,     "endExpression"
,     "increment"
,     "filterExpression"
,     "lvalue"
,     "rvalue"
,     "preIncDec"
,     "postIncDec"
,     "produceType"
,     "calcType"
,     "expression"
,     "negated"
,     "left"
,     "right"
,     "pushed"
,     "precedence"
,     "intoVar"
,     "operandCount"
,     "root"
,     "ternaryCount"
,     "paramsDeclarations"
,     "definePropItems"
,     "hasExceptionBlock"
,     "EndFnLineNum"
,     "varRefSuper"
,     "toNamespace"
,     "kind"
,     "endLineInx"
,     "global"
,     "importParameter"
,     "importedModule"
,     "names"
,     "globVar"
,     "assignment"
,     "references"
,     "fnCall"
,     "arrExpression"
,     "isInstanceof"
,     "cases"
,     "elseBody"
,     "expressions"
,     "adjectives"
,     "specific"
,     "preParsedVarRef"
,     "intoVars"
,     "lastSourceLineNum"
,     "statements"
,     "isMain"
,     "exportDefault"
,     "fileInfo"
,     "exports"
,     "exportsReplaced"
,     "requireCallNodes"
,     "referenceCount"
,     "members"
,     "nodeDeclared"
,     "normalizeModeKeepFirstCase"
,     "isScope"
,     "nodeClass"
,     "isPublicVar"
,     "isForward"
,     "isDummy"
,     "superDecl"
,     "pointsTo"
,     "returnType"
,     "informError"
,     "converted"
,     "failures"
,     "importInfo"
,     "dir"
,     "extension"
,     "base"
,     "sourcename"
,     "hasPath"
,     "isCore"
,     "isLite"
,     "isInterface"
,     "relPath"
,     "relFilename"
,     "outFilename"
,     "outRelFilename"
,     "outExtension"
,     "outFileIsNewer"
,     "interfaceFile"
,     "interfaceFileExists"
,     "externalCacheExists"
,     "source"
,     "isGlobalDeclare"
,     "globalImport"
,     "createFile"
};



//-------------------------------
int main(int argc, char** argv) {
    LiteC_init( 85, argc,argv);
    LiteC_addMethodSymbols( 177, _ADD_VERBS);
    LiteC_addPropSymbols( 200, _ADD_THINGS);
    LiteC_registerShim(String,startsWith_,String_startsWith);
    LiteC_registerShim(String,endsWith_,String_endsWith);
    LiteC_registerShim(String,trimRight_,String_trimRight);
    LiteC_registerShim(String,trimLeft_,String_trimLeft);
    LiteC_registerShim(String,capitalized_,String_capitalized);
    LiteC_registerShim(String,quoted_,String_quoted);
    LiteC_registerShim(String,rpad_,String_rpad);
    LiteC_registerShim(Array,remove_,Array_remove);
    fs__moduleInit();
    path__moduleInit();
    color__moduleInit();
    ControlledError__moduleInit();
    OptionsParser__moduleInit();
    GeneralOptions__moduleInit();
    Compiler__moduleInit();
    Project__moduleInit();
    ASTBase__moduleInit();
    Parser__moduleInit();
    logger__moduleInit();
    Strings__moduleInit();
    mkPath__moduleInit();
    Grammar__moduleInit();
    UniqueID__moduleInit();
    Names__moduleInit();
    Validate__moduleInit();
    Environment__moduleInit();
    Producer_c__moduleInit();


    c_lite__moduleInit();


    LiteC_finish();
} //end main
