(function () {

  /* Literate Kal
     ------------

     This file translates Literate Kal files to regular Kal files for the compiler. Literate Kal files are [Markdown](daringfireball.net/projects/markdown/) files with embedded code blocks that contain Kal code. All code blocks (denoted by four leading spaces) are treated as source code while all other Markdown is translated to comments.
      */
  function translate(literate_code) {
    var regular_kal_lines, last_line, in_code_block, line, ki$1, kobj$1;
    var multicomment;
    /*
       This function reads the Literate code line by line, building a new array of non-Literate (illiterate?) code.
        */
    regular_kal_lines = [];
    last_line = '';
    in_code_block = false;
    inx=0;
    /*
       if the source comes from a <textarea> (or windows) the lines will end with \r\n. Let's remove the \r before split \n
        */
    kobj$1 = literate_code.replace(/\r/g, '').split('\n');
    for (ki$1 = 0; ki$1 < kobj$1.length; ki$1++) {
      line = kobj$1[ki$1];
      line = line.replace(/\s+$/,''); //remove trailing WS

      if (line==='/*' || line==='/!' || /^\s+(compile|compiler)\b/.test(line) ){ //multicomment
          multicomment = true;
          regular_kal_lines.push('# ' + line);
          continue;
      }
      if (line==='*/' || line==='!/' || /^\s+(end compile|end compiler)\b/.test(line) ){ // end multicomment
          regular_kal_lines.push('# ' + line);
          multicomment = false;
          continue;
      }
      if (multicomment)  {
          regular_kal_lines.push('# ' + line);
          continue;
      }

      /*
         If the line starts with four spaces and the previous line was blank or code, we keep the line but remove the spaces. Otherwise, we prepend a `# ` comment marker to make it a comment.
      */

      var com=" ";
      if (/^    /.test(line) && ( in_code_block || last_line.length===0)) {
        in_code_block = true;

        //Remove 'var', 'public', 'helper'
        line=line.replace(/\b(var|public|helper) \b/,"");

        regular_kal_lines.push(line.slice(4));
      } else {
        in_code_block = false;
        if (line) {
          regular_kal_lines.push('# ' + line);
          com=" #";
        }
        else regular_kal_lines.push(line);
      }
      //console.log(++inx + com + line);
      last_line = line;
    }
    /*
       The translated code is standard Kal.
        */
    return regular_kal_lines.join('\n');
  }

  /*  */
  exports.translate = translate;
})()