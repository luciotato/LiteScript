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
        fflush(stderr);
        //raise(SIGTRAP);
        abort();
    }

str e4c_stageStr(){
    switch (e4c.frame[e4c.activeFrame].stage) {
        case e4c_beginning: return "e4c_beginning";
        case e4c_trying: return "e4c enter try{";
        case e4c_catching: return "e4c enter catch{";
        case e4c_finalizing: return "e4c enter finalize{";
        case e4c_done: return "e4c_done";
        default: return "e4c_INVALID STAGE";
    }
};

void e4c_showStatus(){
	fprintf(stderr, "E4C %s:%d:1 frame:%d %s\n"
        , e4c.frame[e4c.activeFrame].file, e4c.frame[e4c.activeFrame].line
        ,e4c.activeFrame, e4c_stageStr() );
    fflush(stderr);
}

int e4c_newFrame(str file, int line){

	if(e4c.activeFrame >= E4C_MAX_FRAMES) fatal("Too many nested `try` blocks.");
	e4c.activeFrame++;

    if (!file) file="(no file)";
	e4c.frame[e4c.activeFrame].file = file;
	e4c.frame[e4c.activeFrame].line= line;
	e4c.frame[e4c.activeFrame].stage = e4c_beginning;

    //debug
    //e4c_showStatus();

    if (e4c.activeFrame==3)
        e4c.activeFrame=e4c.activeFrame;

    return TRUE;
}


int e4c_incStage(){

    e4c.frame[e4c.activeFrame].stage++;
    if(e4c.frame[e4c.activeFrame].stage == e4c_catching && !e4c.exception.pending) {
        //if it reachs "catch" by normal "try" exit (not by throw) there will
        // be no exception pending, so we skip executing cath block
        e4c.frame[e4c.activeFrame].stage++;
    }

	if(e4c.frame[e4c.activeFrame].stage < e4c_done) {
        return 1; //continue looping - next stage; trying, catching, finally
    }

    //debug
    //e4c_showStatus();

    assert(e4c.frame[e4c.activeFrame].stage <= e4c_done);

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
        fprintf(stderr, "\n%s:%d:1 thrown object should be instanceof Error\n",file,line);
        fprintf(stderr, "object thrown is class: [%s]\n",CLASSES[error.class].name.value.str);
        if(error.class==String_inx){
            _outErr(error);
            _outErrNewLine();
        }
        fflush(stderr);
        abort();
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

                //debug log
                //fprintf(stderr,"\n\nE4C catched longjmp frame %d\n\n",e4c.activeFrame);
                //(void)fflush(stderr);

                // longjmps do not returns
                longjmp(e4c.frame[e4c.activeFrame].jump, 1);

            case e4c_catching: case e4c_finalizing:
                //throw while catch(err){} or finalize{}
                // (and throw was not insinde a new try{})
                e4c.activeFrame--; //check prev frame
                break;

            default:
                fatal("e4c INTERNAL error: throw on invalid stage");

        }

    } // loop until a trying frame is found

};


void e4c_printLastErr(void){
	fprintf(stderr
        , "\n\n%s:%d:1 exception thrown\n"
        , e4c.exception.file
        , e4c.exception.line);
    _outErr(e4c.exception.error);
    _outErrNewLine();
    fflush(stderr);
}

