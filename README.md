 Lite Script is Not a Language

***DISCLAIMER***: *All characters and events in the following histories are entirely fictional. All facts
were twisted to fit the needs of the plot. Celebrity voices are impersonated (poorly). So, even if
semantical, grammatical, and sintactic corrections from grammar... (let's not say grammar-nazis
because the text surely has one error every ten unicode characters, so, if you're a native speaker,
you don't have to be a grammar-nazi to be horrorized and compelled to send corrections... then, let's
say that: even if corrections and complete rewrites are gladly accepted from kind persons and
grammar-social-engineers, don't bother fact-checking. This in inteded to be an amusing reading,
not a documentary. -Se non e vero, e ben trovato-*


Introduction:
=============

<table border=0>
<tr>
<td width=40%></td>
<td>
<i>"I always promise during my talks that if anyone in the audience
says during the next 12 months, 'But we've always done it that way,
I will immediately materialize beside him and haunt him for the
next 24 hours and see if I could get him to take a second look."</i>
<br>-- Grace Murray Hopper
</td>
</tr>
</table>

<p style="width:100px">
"I always promise during my talks that if anyone in the audience
says during the next 12 months, 'But we've always done it that way,
I will immediately materialize beside him and haunt him for the
next 24 hours and see if I could get him to take a second look."<br>
-- Grace Murray Hopper
</p>


<p style="width:100px">
"I always promise during my talks that if anyone in the audience
says during the next 12 months, 'But we've always done it that way,
I will immediately materialize beside him and haunt him for the
next 24 hours and see if I could get him to take a second look."<br>
-- Grace Murray Hopper
</p>
The Space Shuttle and two horse's rear end
--
http://www.astrodigital.org/space/stshorse.html

  Like trains and horses, modern js is modeled after the "C" languaje, and carries all it's heritage,
  the good and the bad. "C" was designed at the end of the 60's, and most of the engineering decisions
  made at that time have survived all theese years and are still alive an well in js.

  To semicolon or not to semicolon, a engineering decision:
  --

  Either you choose to: 1) consider line endings (EOL) as statement's end, or...
  2) define a "terminator" char, and get a free-format mode where the EOL chars are
  considered whithespace, and a statement continues in multiple lines until the terminator
  char is found.

  K&R choose the free-format and the semicolon as the statement terminator, since then,
  you're seeing a lot of semicolons.

  Back in the days, the 80-col punchcard constraint was important in order to make the free-form preferable
  over the EOL as terminator. Also, 80-col lines make the "indent is a block" idea not so good.

  Today, w/o punchcards, there are more advantages into using indentation as block separator
  and EOL as statement separator.

  With indentation as block separator, you're forced to properly indentate. -that's good-; you're
  doing it anyhow in js (if you're not insane).
  Using EOL as statement separator, you'll stop worrying about semicolons, -that's good too-.

  Lite uses EOL as statement separator and identation as block separator,
  but "Lite is not a language" so, what we do?... we do simple things:
      1. We insert a "{" when the code indents and a "}" when it's de-indented.
      2. Inside a block, we insert a semicolon at every EOL (except for lines ending in ' _')

Block end cues for the casual reader
--

 There is another problem with curly braces and structured programming,
 I call it: "The closing braces wtf problem".

 Picture the following "screen" in C (and js, java, etc)

        +-------------------------------------------
        |987|                   inx++;
        |988|               }
        |989|               importantVar=false;
        |990|            }
        |991|        }
        |992|    }
        |993|};
        |994|
        |995|
        |996|function theSecond(){
        |997|

 Let's say you were following the 500-line code of the function "theFirst", and you get distracted
 by a telephone call. Now, you're back at the screen , and you see a well-indented cascade of
 closing curly braces... and you ask yourself... wtf are each one of them closing?
 Now, you depend on some crazy jumping courtesy of your favorite editor's "find matching brace" function
 (if you're lucky enough to be using your editor, and not, let's say, "reading code on the web").

 In this case, you gain nothing by using indent as block separator (picture the same, but w/o the curlys)
 It's even worst, you can't be sure of how many blocks are closing.

 So, to ease code reading, it's good to have (optional) end block statements, as in...

        +------------------------------
        |987|                  inx++;
        |988|               end if // if anotherVar was 3
        |989|               importantVar=false;
        |990|           end if
        |991|
        |992|       end loop (cols)
        |993|    end loop (rows)
        |994|end function theFirst
        |995|
        |996|function theSecond(){
        |997|

 That's more clear, and easier to read.
 
 
 The patch-assembled fast switch
 --

  Javascript uses curly braces for blocks. Curly braces are important for language purists. There are even heated
  discussion on where the curly braces should be, if at the end of the line, if in the next line, indented, unindented...
  but there is a statement in js laughing at all this: 'switch'.

  Have you asked why 'switch' shi... has a complete disregard for curly braces and blocks?

  Who modeled C's was thinking in assembler. (That's one of the reasons why C is fast). If you're thinking
  in assembler, you'll want to easily translate to assembler and also be able to take advantage of really fast
  assembly constructions. In assembly, a 'switch' on an integer, with fallthrough on every case, is the more compact
  and fast kind of switch (it uses a jump table, and no jmp is needed at the end of every case). So, given that
  it was the best assembly construction, it is the "C" default. If you want another thing, add 'break' at the
  end of every case. If you want to switch on 'strings', go find yourself another language, you clock-cycles-waster!

  The question is... why js, a duck-typed script language designed to be interpreted, still forces you to use switch,
  and forces you having to remember to type 'break;' at the end of every case?  (hint: the answer is in the link, at
  the introduction).

  Lite provides some sintax sugar for case evaluation, so you can avoid the odd-shaped, assembly-constrained
  nature of 'switch' and it's companions, 'case' & 'break'

  Lite provides a 'case' construction, modeled after SQL ANSI's 'CASE' with some extra-sugar, wich are translated
  to js if-else constructions. It's like 'switch', but whitout the constraints.


LitesScript Laws:
=================

 * LiteScript is not a language.

 * If you can avoid it, do no harm.

Corollaries:
------------

  * if your LiteScript is harder to read than pure-js, you're doing it wrong.

