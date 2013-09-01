var fs=require('fs');
var path=require('path');

// LiteScript Processor

var sourcePath=path.resolve(__dirname,'src');

var destPath=path.resolve(__dirname,'out');
if not fs.existsSync(destPath) then fs.mkdirSync(destpath);

var source =
    lines:[]
	,lineNumber:-1
	,ident:0
	,lastIdent:0

var result=[]

var States
	INITIAL:0
	,INSIDE_IF:1
	,INSIDE_CASE:2
	,INSIDE_CASE_BOOLEAN:3
	,EOF:4


// -----------------
// ---Start --
// -----------------
function Start()
{
    console.log('Reading Files...');
    fs.readdir(sourcePath, ProcessFiles);
}

// -----------------
// ---ProcessFiles--
// -----------------
function ProcessFiles(err,files) {

    if err throw new Error(err);

    for(var i=0;i<files.length;i++){

        var fname=files[i];

        if fname.indexOf('.ls') // extension '.ls'

            console.log('  + ',fname);

            fname=path.resolve(sourcePath,fname);
            var sourceText=fs.readFileSync(fname,'utf8');
            source.lines=sourceText.split("\n");
			source.lineNumber=0;
			source.indent=-1;
            processBlock();

			var destFname=path.resolve(destPath,path.basename(fname,'.ls')+'.js');
            console.log('  -> ',destFname);
			fs.writeFileSync(destFname,result.toString());

        end if



//----------------------------
function readNextLine_indent()

    var line;
	Source.lastIdent = Source.ident;

	while(true)

		lineNumber++;
		if lineNumber>=Source.lines
			Source.ident=-1;
			return null;


		line=Source.lines[Source.lineNumber].rTrim();

		var identLeido=countLeadingSpaces(line);

		line=substr(line,n+1); // corto identacion

		if line.length=0 then // linea vacia
			out("");
		else if linea.isComment()
			out(line);
			// salteo lineas de comentario
		else
			// la linea contiene algo
			break; //break while

    loop // sigo en el for, salteando lineas vacias

	//aqui la linea contiene código
	Source.ident = indentLeido;

	//identation leads to insert "{"
	//un-indent inserts "}"
	if Source.indent>Source.lastIndent
		out("{"); // se mete en un bloque

	return line;

 end function


//-----------------------------------------
//------ SPLIT & REPLACE ------------------
//-----------------------------------------

function processBlock( state, endWord, callback)

	var thisBlockIndent = Source.indent;

	if not state

		//llamado inicial, sin params

		state=States.INITIAL;
		endWord = null;
		callback = null;

	else

		//valores default
		if not endWord then endWord="end";
		if not callback then callback = DefaultCallback_EndBlock;

	}

	// para cada linea
	while(true)

		var line = readNextLine_indent();
		if not line //EOF
			if (callback) callback(); //callback end of indent (EOF)
			break; // fin de bloque


		var words=SplitJSLine(line);

		if endword and words[0]=endWord
			if (callback) callback(line); //callback por hallado de la palabra clave
			break; // fin de bloque
		}

		if Source.indent < thisBlockIndent
			if (callback) callback(); //callback end of indent (EOF)
			Source.lineNumber--; //recupero linea
			break; // fin de bloque
		}

		// proceso la linea de acuerdo al estado (tipo de bloque)
		case state

			when States.INITIAL, States.INSIDE_IF
				processWords(words);

			when States.INSIDE_CASE, States.INSIDE_CASE_BOOLEAN
				processInsideCase(state,words);

        end case

	loop // para cada linea del bloque

end function


// -------------------------------
function processCaseLine(state,words)

	//proceso linea dentro de 'case'
	word=words[0];

	if word!='when' and word!='else' then err("'when/else' expected inside 'case' block);

	if words.length=1 or word[1].isComment() then err("Expected: "+(booleanMode?"bool expression":"value")
													", after '"+word+"'"); // si 'when' es la UNICA palabra

	var booleanMode = (state==States.INSIDE_CASE_BOOL);

	if booleanMode // case when [bool expression] then...
		words[0] = "} elseif (";
		n = replaceLast(words,1,'then',")")+1; //busco 'then' que marca el fin de la expresion

	else // modo: when [value],[value] or [value]

		var jsCase = word=='when'?'case':'default';

		words[0]=""; // elimino 'when/else'

		// veo cada palabra en esta linea de "when" (valores para js:case  / bool expression )
		for (n=1; n<words.lenght;n++)
			word=words[n];
			if word=',' or word='or'
				words[n++]=""; // ignorables|opcionales, borro y salteo
				word=words[n];

			if word='then' or word.isComment() then break; //fin de proceso de linea

            //no era comment
			words[n]=jsCase+" "+word[n]+":"; //tomo como otro 'case [value]:'
		loop
	end if

	// saco resultado
	outResult();

end function


//-----------------------------------------
function processWords(words)


	/* keyword 'if'

	if a=2 then
		say "a is 2"

	-> js:

	if(a==2){
		say("a is 2");
	}
	*/

	word = words[0];

	if word = "if"

		HandleIfBlock(words);

	else if word = "case"

		HandleCaseBlock(words);

	else

        result.push(line);

	/* keyword 'case' - implmented as in ANSI SQL

	case [var]
		when [value] then [commands]

		when [value],[value] or [value] then
			[commands]
			[commands]
			[commands]

		when [value],[value] then
			[commands]

		else
			[commands]

	end case

	-> js:
	switch([var]) {
		case [value]:
			[commands];
			break;
		case [value]: case [value]: case [value]:
			[commands];
			[commands];
			[commands];
	}


	/* keyword 'case' - mode 2 - [boolean expression] - implmented as in ANSI SQL

	case when [boolean expression] then [commands]

		when [boolean expression] then
			[commands]
			[commands]
			[commands]

		when [boolean expression] then
			[commands]

		else
			[commands]

	end case


	*/

end function


//-----------------------------------------
function DeafultCallback_EndBlock(line)
	// por baja de ident o llegada de la palabra clave de fin (end)
	out("}" + line? " // "+line : "";
end

//-----------------------------------------
//-----------------------------------------
function HandleIfBlock(words)

	words[0] = "if (";

	// inside 1st 'if' line
	for (var n=1;n<word[n].length;n++) {

		var word=words[n];
		var LastWord=word;

		switch(word)

			case "=": word="=="; break;

			case "not": word="!"; break;

			case "<>": word="!="; break;

			case "and": word="&&"; break;

			case "or": word="||"; break;

			case "then": word=")"; break;

			case "is":
				if n<1 or n=words.length-1
					err("error parsing keyword:'is'. Usage: [variable] is [type]  ->js:  typeof [variable]=='[type]'");

				word[n-1]="typeof "+word[n-1]
				word="==";
				word[n+1]="'"+word[n+1]+"'";
				n++;
				break;

			case "": break;

			case "then"
				replaceLine_and_queue(words.slice(n+1).join(' ')); // armo linea con lo que quedó
				break;

			default:
				word=OperReplace(word,"=","=="); // a=b -> a==b
				word=OperReplace(word,"<>","!="); // a<>b -> a!=b

        end switch

		words[n]=word;

    loop

	if LastWord <> "then"
		err("keyword:'then' expected as last word on 'if' line")

	outResult();

	// proceso lineas hasta "end if" o que baje el indent
	processBlock(States.INSIDE_IF);

end function

//-----------------------------------------
//-----------------------------------------
function HandleCase(words)

	// inside case

	if (words.length==1) err("expected [var]/'when' after 'case'");
	// aqui: words.length >=2

	var n;

	booleanMode=(words[1]=='when');

	if (booleanMode)  // case when [bool expression] then...
		words[0] = "if";
		words[1] = "(";
		n = replaceLast(words,2,'then',")")+1; //busco 'then' que marca el fin de la expresion

	else

		// case [var] when [value] then...
		words[0] = "switch("+words[1]+")"; //tomo [var]. nota: el "{" lo pone ya q lo que sigue es identado
		n=2;

	end if

	if n=words.length // nada mas en esta linea
		outResult();

	else
		replaceLine_and_queue(words.slice(n).join(' ')); // armo linea con lo que quedó
	end if

	// proceso lineas hasta "end case" o que baje el indent
	processBlock( booleanMode ? States.INSIDE_CASE_BOOLEAN : States.INSIDE_CASE );

end fn

// -------------------------
function replaceLine_and_queue(line)
{
	if (line.rTrim().lTrim != "") // si la linea tiene algo...

		Source.lines[Source.lineNumber--] = space(Source.indent) + line; // lo dejo como la "proxima" linea
}




// -------------
// --- UTIL ----
// -------------
function out(s)
    result+=s;

function out_slice(array, first, last)
    for (var n=first;n<=last;n++)
        result+=array[n]+" ";
    loop
end fn
}

String.prototype.replaceAt = function(index, count, replacement)
  return this.substr(0, index) + replacement + this.substr(index + count);


function countLeadingSpaces(str)
    var count=0;
    for (var i = 0; i < str.length; i++)
        if (str[i] === " " ) count++;
        else if ( str[i] === "\t") count+=4;
        else return count;
    loop
    return count


function DoubleOper(word, oper)
    //
    // = -> ==
    //
    var actualpos=-1, firstpos, secondpos=-1;

    while(true)

        firstpos = word.indexOf(oper,actualpos+1);
        if (firstpos<0) break; //exit

        secondpos = word.indexOf(oper, firstpos+1);
        if (secondpos>0 and secondpos=firstpos+1)   //Ya es un doble =
                actualpos = secondpos;
        else
            word=word.replaceAt(firstpos,1,oper+oper); secondpos++;
            word=word.replaceAt(secondpos,1,oper+oper);
            actualpos = secondpos+1;
        end if

    loop

    return word
}

function splitJSLine(s)

    var start=0;
    var previous;
    var quoteChar;
    var inQuotes = false;
    var res=[];

    for each char in s

        if (inQuotes)
            if (char==quoteChar)
                inQuotes=false;
                res.push(s.substr(start,i-1));
                res.push(char);
                start=i+1;

            else
                null //do nothing, still in quotes

        else  // not in quotes

            case char

                when '"' or "'": // start quotes
                    inQuotes=true;
                    quoteChar=char;

                when '/':
                    if previous=='/' // //-comment
                        res.push(s.substr(start));
                        start=s.length;

                when ' ' or ',': // Separators
                    res.push(s.substr(start,i-1));
                    res.push(char);
                    start=i+1;

            end switch

        end if

        previous=char;

    loop //each char in s

end fn


function replaceLast(words,position,searched,replace)

	var n=words.lastIndexOf(words,searched)
	if n<0 then err("'expected: '"+searched+"'");
	words[n]=replace;
	return n;


function space(n)
	var line="";
	for(var i=0;i<n;n++) line+=" ";


function out(s)
	result.push(space(Source.lastIdent)+s);


function outResult()
	// saco resultado
	line = words.join(' ');
	out(line);


