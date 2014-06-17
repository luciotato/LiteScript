/*
 * exceptions4c lightweight version 1.0
 *
 * Copyright (c) 2014 Guillermo Calvo
 * Licensed under the GNU Lesser General Public License
 */

#include "exceptions.h"

struct e4c_context e4c = {0};

static void e4c_propagate(void){

	e4c.frame[e4c.frames].uncaught = 1;

	if(e4c.frames > 0) longjmp(e4c.jump[e4c.frames - 1], 1);

	if(fprintf(stderr
                , "\n\nUncaught exception thrown at %s:%d\n\n"
                , e4c.err.file||""
                , e4c.err.line) > 0)

                        (void)fflush(stderr);

	exit(EXIT_FAILURE);
}

int e4c_try(const char * file, int line){

	if(e4c.frames >= E4C_MAX_FRAMES) fatal("Too many nested `try` blocks.");

	e4c.frames++;

	e4c.frame[e4c.frames].stage = e4c_beginning;
	e4c.frame[e4c.frames].uncaught = 0;

	return 1;
}

int e4c_hook(){

	int uncaught = e4c.frame[e4c.frames].uncaught;

	e4c.frame[e4c.frames].stage++;
	if(e4c.frame[e4c.frames].stage == e4c_catching && !uncaught) {
            e4c.frame[e4c.frames].stage++;
    }

    //fprintf(stdout,"e4c.frames %d, e4c.frame[e4c.frames].stage %d e4c.frame[e4c.frames].uncaught %d\n"
    //        ,e4c.frames,e4c.frame[e4c.frames].stage, e4c.frame[e4c.frames].uncaught);

	if(e4c.frame[e4c.frames].stage < e4c_done) {
        return 1; //continue looping - enter try loop
    }

	e4c.frames--;

	if(uncaught) e4c_propagate();

	return 0;
}

void e4c_throw( const char * file
                , int line
                , void* errObject){

	e4c.err.file = file;
	e4c.err.line = line;

    e4c.err.object = errObject;

	e4c_propagate();
}
