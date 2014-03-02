Developing a new version of LiteScript 
======================================


The LiteScript compiler is written in LiteScript. 

As a result, a previous "stable version" of the compiler 
is required to to develop and compile a newer version. 

You can obtain the latest stable version from npm using `npm install -g litescript`

Once you have LiteScript installed globally, you can use the following scripts from 
the LiteScript-devel directory:

* `. c` - This will compile the `source` directory (this source) into the `out` directory,
creating a newer version of the LiteScript compiler.

* `. t` - Run the test suite (/test) using the compiler created in the `out` directory. 

