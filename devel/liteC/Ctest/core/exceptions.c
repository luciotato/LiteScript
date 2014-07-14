/*
 * exceptions4c lightweight version 1.0
 *
 * Copyright (c) 2014 Guillermo Calvo
 * Licensed under the GNU Lesser General Public License
 */

#include "exceptions.h"
#include "LiteC-core.h"

struct e4c_global e4c = {0};

void fatal(char * msg) {
        fprintf(stderr, msg);
        abort();
    }

void e4c_newFrame(void){

	if(e4c.activeFrame >= E4C_MAX_FRAMES) fatal("Too many nested `try` blocks.");
	e4c.activeFrame++;
	e4c.frame[e4c.activeFrame].stage = e4c_beginning;
}

int e4c_incStage(void){

	assert(e4c.frame[e4c.activeFrame].stage < e4c_done);

    e4c.frame[e4c.activeFrame].stage++;
    if(e4c.frame[e4c.activeFrame].stage == e4c_catching && !e4c.exception.pending) {
        //if it reachs "catch" by normal "try" exit (not by throw) there will
        // be no exception pending, so we skip executing cath block
        e4c.frame[e4c.activeFrame].stage++;
    }
	if(e4c.frame[e4c.activeFrame].stage < e4c_done) {
        return 1; //continue looping - next stage; trying, catching, finally
    }

    //else: stage is done - this frame is completed
	e4c.activeFrame--; //new active frame is prev frame
	return 0; //exit try/catch/finally loop
}

int e4c_isCatching(void){

    if (e4c.frame[e4c.activeFrame].stage==e4c_catching){
        assert(e4c.exception.pending);
        e4c.exception.pending = FALSE; //exception is pending no more
        e4c.frame[e4c.activeFrame].catchExecuteCount=1; //execute catch block once
        return TRUE; //enter catch block
    }
    return FALSE; //this frame is not catching
}

void e4c_exitTry(int howManyBlocks){  // called before return from inside a try-catch
	assert(howManyBlocks<=e4c.activeFrame);
    e4c.activeFrame-=howManyBlocks;
}

void e4c_throw( str file, int line, any error){

    e4c.exception.file = file;
	e4c.exception.line = line;
    e4c.exception.error = error;
    e4c.exception.pending = TRUE; //exception is pending

    if (!_instanceof(error,Error)) {
        fatal(_concatToNULL(file,":",_int64ToStr(line)," thrown object should be Error",NULL));
    }

    while(TRUE){ //search for a frame available to catch the exception

        if(e4c.activeFrame  <= 0) { //no more frames, uncaught exception
            e4c_printLastErr();
            exit(EXIT_FAILURE);
        }

        switch(e4c.frame[e4c.activeFrame].stage){

            case e4c_beginning:
                fatal("e4c INTERNAL error: throw while stage is beginning");

            case e4c_trying:
                // active frame is in stage "trying"
                // jmp to active frame loop
                longjmp(e4c.frame[e4c.activeFrame].jump, 1);
                // longjmp do not returns

            case e4c_catching: case e4c_finalizing:
                //exception while catch(err){} or finalize{}
                // and throw was not insinde a new try{}
                e4c.activeFrame--; //check prev frame
                break;

            default:
                fatal("e4c INTERNAL error: throw on invalid stage");

        }

    } // loop until a trying frame is found

};


void e4c_printLastErr(void){
	if(fprintf(stderr
                , "\n\n%s:%d:1 exception thrown\n%s\n"
                , e4c.exception.file
                , e4c.exception.line
                , ((Error_ptr)e4c.exception.error.value.ptr)->message.value.str
               ) > 0)
                        (void)fflush(stderr);
}

