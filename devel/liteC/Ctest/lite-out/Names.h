#ifndef NAMES_C__H
#define NAMES_C__H
#include "_dispatcher.h"
//-------------------------
//Module Names
//-------------------------
extern void Names__moduleInit(void);
extern var Names_allNameDeclarations;
    

//--------------
    // Names_Declaration
    any Names_Declaration; //Class Names_Declaration
    typedef struct Names_Declaration_s * Names_Declaration_ptr;
    typedef struct Names_Declaration_s {
        //Declaration
        any name;
        any members;
        any nodeDeclared;
        any parent;
        any normalizeModeKeepFirstCase;
        any type;
        any itemType;
        any value;
        any isScope;
        any isForward;
        any isDummy;
        any isProperty;
        any isMethod;
        any isNamespace;
        any superDecl;
    
    } Names_Declaration_s;
    
    extern void Names_Declaration__init(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_normalize(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_setMember(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_findOwnMember(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_ownMember(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_getMemberCount(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_replaceForward(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_makePointTo(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_positionText(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_originalDeclarationPosition(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_sayErr(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_warn(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_caseMismatch(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_addMember(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_toString(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_composedName(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_info(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_findMember(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_isInstanceof(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_getMembersFromObjProperties(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_isInParents(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_processConvertTypes(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_convertType(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_assignTypeFromValue(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_assignTypebyNameAffinity(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_checkSuperChainProperties(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_outSuperChainProps(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_addToAllProperties(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_getComposedName(DEFAULT_ARGUMENTS);
    extern any Names_Declaration_addToAllMethodNames(DEFAULT_ARGUMENTS);
    

//--------------
    // Names_NameDeclOptions
    any Names_NameDeclOptions; //Class Names_NameDeclOptions
    typedef struct Names_NameDeclOptions_s * Names_NameDeclOptions_ptr;
    typedef struct Names_NameDeclOptions_s {
        //NameDeclOptions
        any normalizeModeKeepFirstCase;
        any pointsTo;
        any type;
        any itemType;
        any returnType;
        any value;
        any isForward;
        any isDummy;
        any informError;
    
    } Names_NameDeclOptions_s;
    
    extern void Names_NameDeclOptions__init(DEFAULT_ARGUMENTS);
#endif