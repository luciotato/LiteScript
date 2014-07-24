#ifndef VALIDATE_C__H
#define VALIDATE_C__H
#include "_dispatcher.h"
//-------------------------
//Module Validate
//-------------------------
extern void Validate__moduleInit(void);
extern any Validate_validate(DEFAULT_ARGUMENTS);
extern any Validate_walkAllNodesCalling(DEFAULT_ARGUMENTS);
extern any Validate_initialize(DEFAULT_ARGUMENTS);
      

//--------------
      // Names_ConvertResult
      any Names_ConvertResult; //Class Names_ConvertResult
      typedef struct Names_ConvertResult_s * Names_ConvertResult_ptr;
      typedef struct Names_ConvertResult_s {
          //ConvertResult
          any converted;
          any failures;
      
      } Names_ConvertResult_s;
      
      extern void Names_ConvertResult__init(DEFAULT_ARGUMENTS);
      extern any Names_ConvertResult_newFromObject(DEFAULT_ARGUMENTS);
#endif
