#
# Generated Makefile - do not edit!
#
# Edit the Makefile in the project folder instead (../Makefile). Each target
# has a -pre and a -post target defined where you can add customized code.
#
# This makefile implements configuration specific macros and targets.


# Environment
MKDIR=mkdir
CP=cp
GREP=grep
NM=nm
CCADMIN=CCadmin
RANLIB=ranlib
CC=gcc
CCC=clang
CXX=clang
FC=gfortran
AS=as

# Macros
CND_PLATFORM=GNU-Linux-x86
CND_DLIB_EXT=so
CND_CONF=Debug
CND_DISTDIR=dist
CND_BUILDDIR=build

# Include project Makefile
include Makefile

# Object Directory
OBJECTDIR=${CND_BUILDDIR}/${CND_CONF}/${CND_PLATFORM}

# Object Files
OBJECTFILES= \
	${OBJECTDIR}/_ext/761097586/ImmutArray.o \
	${OBJECTDIR}/_ext/761097586/LiteC-core.o \
	${OBJECTDIR}/_ext/761097586/PMREX-native.o \
	${OBJECTDIR}/_ext/761097586/any.o \
	${OBJECTDIR}/_ext/761097586/exceptions.o \
	${OBJECTDIR}/_ext/761097586/fs-native.o \
	${OBJECTDIR}/_ext/761097586/utf8strings.o \
	${OBJECTDIR}/_ext/761097586/util.o \
	${OBJECTDIR}/generated-c/ASTBase.o \
	${OBJECTDIR}/generated-c/Compiler.o \
	${OBJECTDIR}/generated-c/Grammar.o \
	${OBJECTDIR}/generated-c/Names.o \
	${OBJECTDIR}/generated-c/Parser.o \
	${OBJECTDIR}/generated-c/Producer_js.o \
	${OBJECTDIR}/generated-c/Project.o \
	${OBJECTDIR}/generated-c/Validate.o \
	${OBJECTDIR}/generated-c/_dispatcher.o \
	${OBJECTDIR}/generated-c/c_lite.o \
	${OBJECTDIR}/generated-c/interfaces/C_standalone/fs.o \
	${OBJECTDIR}/generated-c/interfaces/C_standalone/path.o \
	${OBJECTDIR}/generated-c/lib/ControlledError.o \
	${OBJECTDIR}/generated-c/lib/Environment.o \
	${OBJECTDIR}/generated-c/lib/GeneralOptions.o \
	${OBJECTDIR}/generated-c/lib/OptionsParser.o \
	${OBJECTDIR}/generated-c/lib/SourceMap.o \
	${OBJECTDIR}/generated-c/lib/UniqueID.o \
	${OBJECTDIR}/generated-c/lib/color.o \
	${OBJECTDIR}/generated-c/lib/logger.o \
	${OBJECTDIR}/generated-c/lib/mkPath.o \
	${OBJECTDIR}/generated-c/lib/shims.o

# Test Directory
TESTDIR=${CND_BUILDDIR}/${CND_CONF}/${CND_PLATFORM}/tests

# Test Files
TESTFILES= \
	${TESTDIR}/TestFiles/f1

# C Compiler Flags
CFLAGS=-fmax-errors=10

# CC Compiler Flags
CCFLAGS=
CXXFLAGS=

# Fortran Compiler Flags
FFLAGS=

# Assembler Flags
ASFLAGS=

# Link Libraries and Options
LDLIBSOPTIONS=-lgc

# Build Targets
.build-conf: ${BUILD_SUBPROJECTS}
	"${MAKE}"  -f nbproject/Makefile-${CND_CONF}.mk ${TESTDIR}/TestFiles/f2

${TESTDIR}/TestFiles/f2: ${OBJECTFILES}
	${MKDIR} -p ${TESTDIR}/TestFiles
	${LINK.c} -o ${TESTDIR}/TestFiles/f2 ${OBJECTFILES} ${LDLIBSOPTIONS}

${OBJECTDIR}/_ext/761097586/ImmutArray.o: ../core/ImmutArray.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/ImmutArray.o ../core/ImmutArray.c

${OBJECTDIR}/_ext/761097586/LiteC-core.o: ../core/LiteC-core.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/LiteC-core.o ../core/LiteC-core.c

${OBJECTDIR}/_ext/761097586/PMREX-native.o: ../core/PMREX-native.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/PMREX-native.o ../core/PMREX-native.c

${OBJECTDIR}/_ext/761097586/any.o: ../core/any.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/any.o ../core/any.c

${OBJECTDIR}/_ext/761097586/exceptions.o: ../core/exceptions.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/exceptions.o ../core/exceptions.c

${OBJECTDIR}/_ext/761097586/fs-native.o: ../core/fs-native.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/fs-native.o ../core/fs-native.c

${OBJECTDIR}/_ext/761097586/utf8strings.o: ../core/utf8strings.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/utf8strings.o ../core/utf8strings.c

${OBJECTDIR}/_ext/761097586/util.o: ../core/util.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/util.o ../core/util.c

${OBJECTDIR}/generated-c/ASTBase.o: generated-c/ASTBase.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/ASTBase.o generated-c/ASTBase.c

${OBJECTDIR}/generated-c/Compiler.o: generated-c/Compiler.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Compiler.o generated-c/Compiler.c

${OBJECTDIR}/generated-c/Grammar.o: generated-c/Grammar.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Grammar.o generated-c/Grammar.c

${OBJECTDIR}/generated-c/Names.o: generated-c/Names.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Names.o generated-c/Names.c

${OBJECTDIR}/generated-c/Parser.o: generated-c/Parser.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Parser.o generated-c/Parser.c

${OBJECTDIR}/generated-c/Producer_js.o: generated-c/Producer_js.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Producer_js.o generated-c/Producer_js.c

${OBJECTDIR}/generated-c/Project.o: generated-c/Project.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Project.o generated-c/Project.c

${OBJECTDIR}/generated-c/Validate.o: generated-c/Validate.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Validate.o generated-c/Validate.c

${OBJECTDIR}/generated-c/_dispatcher.o: generated-c/_dispatcher.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/_dispatcher.o generated-c/_dispatcher.c

${OBJECTDIR}/generated-c/c_lite.o: generated-c/c_lite.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/c_lite.o generated-c/c_lite.c

${OBJECTDIR}/generated-c/interfaces/C_standalone/fs.o: generated-c/interfaces/C_standalone/fs.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/interfaces/C_standalone
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/interfaces/C_standalone/fs.o generated-c/interfaces/C_standalone/fs.c

${OBJECTDIR}/generated-c/interfaces/C_standalone/path.o: generated-c/interfaces/C_standalone/path.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/interfaces/C_standalone
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/interfaces/C_standalone/path.o generated-c/interfaces/C_standalone/path.c

${OBJECTDIR}/generated-c/lib/ControlledError.o: generated-c/lib/ControlledError.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/ControlledError.o generated-c/lib/ControlledError.c

${OBJECTDIR}/generated-c/lib/Environment.o: generated-c/lib/Environment.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/Environment.o generated-c/lib/Environment.c

${OBJECTDIR}/generated-c/lib/GeneralOptions.o: generated-c/lib/GeneralOptions.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/GeneralOptions.o generated-c/lib/GeneralOptions.c

${OBJECTDIR}/generated-c/lib/OptionsParser.o: generated-c/lib/OptionsParser.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/OptionsParser.o generated-c/lib/OptionsParser.c

${OBJECTDIR}/generated-c/lib/SourceMap.o: generated-c/lib/SourceMap.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/SourceMap.o generated-c/lib/SourceMap.c

${OBJECTDIR}/generated-c/lib/UniqueID.o: generated-c/lib/UniqueID.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/UniqueID.o generated-c/lib/UniqueID.c

${OBJECTDIR}/generated-c/lib/color.o: generated-c/lib/color.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/color.o generated-c/lib/color.c

${OBJECTDIR}/generated-c/lib/logger.o: generated-c/lib/logger.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/logger.o generated-c/lib/logger.c

${OBJECTDIR}/generated-c/lib/mkPath.o: generated-c/lib/mkPath.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/mkPath.o generated-c/lib/mkPath.c

${OBJECTDIR}/generated-c/lib/shims.o: generated-c/lib/shims.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/shims.o generated-c/lib/shims.c

# Subprojects
.build-subprojects:

# Build Test Targets
.build-tests-conf: .build-conf ${TESTFILES}
${TESTDIR}/TestFiles/f1: ${TESTDIR}/_ext/848821408/String_charCodeAt.o ${OBJECTFILES:%.o=%_nomain.o}
	${MKDIR} -p ${TESTDIR}/TestFiles
	${LINK.c}   -o ${TESTDIR}/TestFiles/f1 $^ ${LDLIBSOPTIONS} 


${TESTDIR}/_ext/848821408/String_charCodeAt.o: ../core/tests/String_charCodeAt.c 
	${MKDIR} -p ${TESTDIR}/_ext/848821408
	${RM} "$@.d"
	$(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -I. -std=c99 -MMD -MP -MF "$@.d" -o ${TESTDIR}/_ext/848821408/String_charCodeAt.o ../core/tests/String_charCodeAt.c


${OBJECTDIR}/_ext/761097586/ImmutArray_nomain.o: ${OBJECTDIR}/_ext/761097586/ImmutArray.o ../core/ImmutArray.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	@NMOUTPUT=`${NM} ${OBJECTDIR}/_ext/761097586/ImmutArray.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/ImmutArray_nomain.o ../core/ImmutArray.c;\
	else  \
	    ${CP} ${OBJECTDIR}/_ext/761097586/ImmutArray.o ${OBJECTDIR}/_ext/761097586/ImmutArray_nomain.o;\
	fi

${OBJECTDIR}/_ext/761097586/LiteC-core_nomain.o: ${OBJECTDIR}/_ext/761097586/LiteC-core.o ../core/LiteC-core.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	@NMOUTPUT=`${NM} ${OBJECTDIR}/_ext/761097586/LiteC-core.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/LiteC-core_nomain.o ../core/LiteC-core.c;\
	else  \
	    ${CP} ${OBJECTDIR}/_ext/761097586/LiteC-core.o ${OBJECTDIR}/_ext/761097586/LiteC-core_nomain.o;\
	fi

${OBJECTDIR}/_ext/761097586/PMREX-native_nomain.o: ${OBJECTDIR}/_ext/761097586/PMREX-native.o ../core/PMREX-native.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	@NMOUTPUT=`${NM} ${OBJECTDIR}/_ext/761097586/PMREX-native.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/PMREX-native_nomain.o ../core/PMREX-native.c;\
	else  \
	    ${CP} ${OBJECTDIR}/_ext/761097586/PMREX-native.o ${OBJECTDIR}/_ext/761097586/PMREX-native_nomain.o;\
	fi

${OBJECTDIR}/_ext/761097586/any_nomain.o: ${OBJECTDIR}/_ext/761097586/any.o ../core/any.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	@NMOUTPUT=`${NM} ${OBJECTDIR}/_ext/761097586/any.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/any_nomain.o ../core/any.c;\
	else  \
	    ${CP} ${OBJECTDIR}/_ext/761097586/any.o ${OBJECTDIR}/_ext/761097586/any_nomain.o;\
	fi

${OBJECTDIR}/_ext/761097586/exceptions_nomain.o: ${OBJECTDIR}/_ext/761097586/exceptions.o ../core/exceptions.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	@NMOUTPUT=`${NM} ${OBJECTDIR}/_ext/761097586/exceptions.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/exceptions_nomain.o ../core/exceptions.c;\
	else  \
	    ${CP} ${OBJECTDIR}/_ext/761097586/exceptions.o ${OBJECTDIR}/_ext/761097586/exceptions_nomain.o;\
	fi

${OBJECTDIR}/_ext/761097586/fs-native_nomain.o: ${OBJECTDIR}/_ext/761097586/fs-native.o ../core/fs-native.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	@NMOUTPUT=`${NM} ${OBJECTDIR}/_ext/761097586/fs-native.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/fs-native_nomain.o ../core/fs-native.c;\
	else  \
	    ${CP} ${OBJECTDIR}/_ext/761097586/fs-native.o ${OBJECTDIR}/_ext/761097586/fs-native_nomain.o;\
	fi

${OBJECTDIR}/_ext/761097586/utf8strings_nomain.o: ${OBJECTDIR}/_ext/761097586/utf8strings.o ../core/utf8strings.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	@NMOUTPUT=`${NM} ${OBJECTDIR}/_ext/761097586/utf8strings.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/utf8strings_nomain.o ../core/utf8strings.c;\
	else  \
	    ${CP} ${OBJECTDIR}/_ext/761097586/utf8strings.o ${OBJECTDIR}/_ext/761097586/utf8strings_nomain.o;\
	fi

${OBJECTDIR}/_ext/761097586/util_nomain.o: ${OBJECTDIR}/_ext/761097586/util.o ../core/util.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	@NMOUTPUT=`${NM} ${OBJECTDIR}/_ext/761097586/util.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/util_nomain.o ../core/util.c;\
	else  \
	    ${CP} ${OBJECTDIR}/_ext/761097586/util.o ${OBJECTDIR}/_ext/761097586/util_nomain.o;\
	fi

${OBJECTDIR}/generated-c/ASTBase_nomain.o: ${OBJECTDIR}/generated-c/ASTBase.o generated-c/ASTBase.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/ASTBase.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/ASTBase_nomain.o generated-c/ASTBase.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/ASTBase.o ${OBJECTDIR}/generated-c/ASTBase_nomain.o;\
	fi

${OBJECTDIR}/generated-c/Compiler_nomain.o: ${OBJECTDIR}/generated-c/Compiler.o generated-c/Compiler.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/Compiler.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Compiler_nomain.o generated-c/Compiler.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/Compiler.o ${OBJECTDIR}/generated-c/Compiler_nomain.o;\
	fi

${OBJECTDIR}/generated-c/Grammar_nomain.o: ${OBJECTDIR}/generated-c/Grammar.o generated-c/Grammar.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/Grammar.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Grammar_nomain.o generated-c/Grammar.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/Grammar.o ${OBJECTDIR}/generated-c/Grammar_nomain.o;\
	fi

${OBJECTDIR}/generated-c/Names_nomain.o: ${OBJECTDIR}/generated-c/Names.o generated-c/Names.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/Names.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Names_nomain.o generated-c/Names.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/Names.o ${OBJECTDIR}/generated-c/Names_nomain.o;\
	fi

${OBJECTDIR}/generated-c/Parser_nomain.o: ${OBJECTDIR}/generated-c/Parser.o generated-c/Parser.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/Parser.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Parser_nomain.o generated-c/Parser.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/Parser.o ${OBJECTDIR}/generated-c/Parser_nomain.o;\
	fi

${OBJECTDIR}/generated-c/Producer_js_nomain.o: ${OBJECTDIR}/generated-c/Producer_js.o generated-c/Producer_js.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/Producer_js.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Producer_js_nomain.o generated-c/Producer_js.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/Producer_js.o ${OBJECTDIR}/generated-c/Producer_js_nomain.o;\
	fi

${OBJECTDIR}/generated-c/Project_nomain.o: ${OBJECTDIR}/generated-c/Project.o generated-c/Project.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/Project.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Project_nomain.o generated-c/Project.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/Project.o ${OBJECTDIR}/generated-c/Project_nomain.o;\
	fi

${OBJECTDIR}/generated-c/Validate_nomain.o: ${OBJECTDIR}/generated-c/Validate.o generated-c/Validate.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/Validate.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Validate_nomain.o generated-c/Validate.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/Validate.o ${OBJECTDIR}/generated-c/Validate_nomain.o;\
	fi

${OBJECTDIR}/generated-c/_dispatcher_nomain.o: ${OBJECTDIR}/generated-c/_dispatcher.o generated-c/_dispatcher.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/_dispatcher.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/_dispatcher_nomain.o generated-c/_dispatcher.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/_dispatcher.o ${OBJECTDIR}/generated-c/_dispatcher_nomain.o;\
	fi

${OBJECTDIR}/generated-c/c_lite_nomain.o: ${OBJECTDIR}/generated-c/c_lite.o generated-c/c_lite.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/c_lite.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/c_lite_nomain.o generated-c/c_lite.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/c_lite.o ${OBJECTDIR}/generated-c/c_lite_nomain.o;\
	fi

${OBJECTDIR}/generated-c/interfaces/C_standalone/fs_nomain.o: ${OBJECTDIR}/generated-c/interfaces/C_standalone/fs.o generated-c/interfaces/C_standalone/fs.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/interfaces/C_standalone
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/interfaces/C_standalone/fs.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/interfaces/C_standalone/fs_nomain.o generated-c/interfaces/C_standalone/fs.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/interfaces/C_standalone/fs.o ${OBJECTDIR}/generated-c/interfaces/C_standalone/fs_nomain.o;\
	fi

${OBJECTDIR}/generated-c/interfaces/C_standalone/path_nomain.o: ${OBJECTDIR}/generated-c/interfaces/C_standalone/path.o generated-c/interfaces/C_standalone/path.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/interfaces/C_standalone
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/interfaces/C_standalone/path.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/interfaces/C_standalone/path_nomain.o generated-c/interfaces/C_standalone/path.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/interfaces/C_standalone/path.o ${OBJECTDIR}/generated-c/interfaces/C_standalone/path_nomain.o;\
	fi

${OBJECTDIR}/generated-c/lib/ControlledError_nomain.o: ${OBJECTDIR}/generated-c/lib/ControlledError.o generated-c/lib/ControlledError.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/lib/ControlledError.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/ControlledError_nomain.o generated-c/lib/ControlledError.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/lib/ControlledError.o ${OBJECTDIR}/generated-c/lib/ControlledError_nomain.o;\
	fi

${OBJECTDIR}/generated-c/lib/Environment_nomain.o: ${OBJECTDIR}/generated-c/lib/Environment.o generated-c/lib/Environment.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/lib/Environment.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/Environment_nomain.o generated-c/lib/Environment.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/lib/Environment.o ${OBJECTDIR}/generated-c/lib/Environment_nomain.o;\
	fi

${OBJECTDIR}/generated-c/lib/GeneralOptions_nomain.o: ${OBJECTDIR}/generated-c/lib/GeneralOptions.o generated-c/lib/GeneralOptions.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/lib/GeneralOptions.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/GeneralOptions_nomain.o generated-c/lib/GeneralOptions.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/lib/GeneralOptions.o ${OBJECTDIR}/generated-c/lib/GeneralOptions_nomain.o;\
	fi

${OBJECTDIR}/generated-c/lib/OptionsParser_nomain.o: ${OBJECTDIR}/generated-c/lib/OptionsParser.o generated-c/lib/OptionsParser.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/lib/OptionsParser.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/OptionsParser_nomain.o generated-c/lib/OptionsParser.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/lib/OptionsParser.o ${OBJECTDIR}/generated-c/lib/OptionsParser_nomain.o;\
	fi

${OBJECTDIR}/generated-c/lib/SourceMap_nomain.o: ${OBJECTDIR}/generated-c/lib/SourceMap.o generated-c/lib/SourceMap.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/lib/SourceMap.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/SourceMap_nomain.o generated-c/lib/SourceMap.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/lib/SourceMap.o ${OBJECTDIR}/generated-c/lib/SourceMap_nomain.o;\
	fi

${OBJECTDIR}/generated-c/lib/UniqueID_nomain.o: ${OBJECTDIR}/generated-c/lib/UniqueID.o generated-c/lib/UniqueID.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/lib/UniqueID.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/UniqueID_nomain.o generated-c/lib/UniqueID.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/lib/UniqueID.o ${OBJECTDIR}/generated-c/lib/UniqueID_nomain.o;\
	fi

${OBJECTDIR}/generated-c/lib/color_nomain.o: ${OBJECTDIR}/generated-c/lib/color.o generated-c/lib/color.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/lib/color.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/color_nomain.o generated-c/lib/color.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/lib/color.o ${OBJECTDIR}/generated-c/lib/color_nomain.o;\
	fi

${OBJECTDIR}/generated-c/lib/logger_nomain.o: ${OBJECTDIR}/generated-c/lib/logger.o generated-c/lib/logger.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/lib/logger.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/logger_nomain.o generated-c/lib/logger.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/lib/logger.o ${OBJECTDIR}/generated-c/lib/logger_nomain.o;\
	fi

${OBJECTDIR}/generated-c/lib/mkPath_nomain.o: ${OBJECTDIR}/generated-c/lib/mkPath.o generated-c/lib/mkPath.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/lib/mkPath.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/mkPath_nomain.o generated-c/lib/mkPath.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/lib/mkPath.o ${OBJECTDIR}/generated-c/lib/mkPath_nomain.o;\
	fi

${OBJECTDIR}/generated-c/lib/shims_nomain.o: ${OBJECTDIR}/generated-c/lib/shims.o generated-c/lib/shims.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	@NMOUTPUT=`${NM} ${OBJECTDIR}/generated-c/lib/shims.o`; \
	if (echo "$$NMOUTPUT" | ${GREP} '|main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T main$$') || \
	   (echo "$$NMOUTPUT" | ${GREP} 'T _main$$'); \
	then  \
	    ${RM} "$@.d";\
	    $(COMPILE.c) -g -I../core -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -I. -std=c99 -Dmain=__nomain -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/shims_nomain.o generated-c/lib/shims.c;\
	else  \
	    ${CP} ${OBJECTDIR}/generated-c/lib/shims.o ${OBJECTDIR}/generated-c/lib/shims_nomain.o;\
	fi

# Run Test Targets
.test-conf:
	@if [ "${TEST}" = "" ]; \
	then  \
	    ${TESTDIR}/TestFiles/f1 || true; \
	else  \
	    ./${TEST} || true; \
	fi

# Clean Targets
.clean-conf: ${CLEAN_SUBPROJECTS}
	${RM} -r ${CND_BUILDDIR}/${CND_CONF}
	${RM} ${TESTDIR}/TestFiles/f2

# Subprojects
.clean-subprojects:

# Enable dependency checking
.dep.inc: .depcheck-impl

include .dep.inc
