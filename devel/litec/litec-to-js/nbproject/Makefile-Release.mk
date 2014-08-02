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
CND_CONF=Release
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


# C Compiler Flags
CFLAGS=

# CC Compiler Flags
CCFLAGS=
CXXFLAGS=

# Fortran Compiler Flags
FFLAGS=

# Assembler Flags
ASFLAGS=

# Link Libraries and Options
LDLIBSOPTIONS=../include/libgc.so

# Build Targets
.build-conf: ${BUILD_SUBPROJECTS}
	"${MAKE}"  -f nbproject/Makefile-${CND_CONF}.mk ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/litec-to-js

${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/litec-to-js: ../include/libgc.so

${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/litec-to-js: ${OBJECTFILES}
	${MKDIR} -p ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}
	${LINK.c} -o ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/litec-to-js ${OBJECTFILES} ${LDLIBSOPTIONS}

${OBJECTDIR}/_ext/761097586/ImmutArray.o: ../core/ImmutArray.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/ImmutArray.o ../core/ImmutArray.c

${OBJECTDIR}/_ext/761097586/LiteC-core.o: ../core/LiteC-core.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/LiteC-core.o ../core/LiteC-core.c

${OBJECTDIR}/_ext/761097586/PMREX-native.o: ../core/PMREX-native.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/PMREX-native.o ../core/PMREX-native.c

${OBJECTDIR}/_ext/761097586/any.o: ../core/any.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/any.o ../core/any.c

${OBJECTDIR}/_ext/761097586/exceptions.o: ../core/exceptions.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/exceptions.o ../core/exceptions.c

${OBJECTDIR}/_ext/761097586/fs-native.o: ../core/fs-native.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/fs-native.o ../core/fs-native.c

${OBJECTDIR}/_ext/761097586/utf8strings.o: ../core/utf8strings.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/utf8strings.o ../core/utf8strings.c

${OBJECTDIR}/_ext/761097586/util.o: ../core/util.c 
	${MKDIR} -p ${OBJECTDIR}/_ext/761097586
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/_ext/761097586/util.o ../core/util.c

${OBJECTDIR}/generated-c/ASTBase.o: generated-c/ASTBase.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/ASTBase.o generated-c/ASTBase.c

${OBJECTDIR}/generated-c/Compiler.o: generated-c/Compiler.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Compiler.o generated-c/Compiler.c

${OBJECTDIR}/generated-c/Grammar.o: generated-c/Grammar.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Grammar.o generated-c/Grammar.c

${OBJECTDIR}/generated-c/Names.o: generated-c/Names.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Names.o generated-c/Names.c

${OBJECTDIR}/generated-c/Parser.o: generated-c/Parser.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Parser.o generated-c/Parser.c

${OBJECTDIR}/generated-c/Producer_js.o: generated-c/Producer_js.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Producer_js.o generated-c/Producer_js.c

${OBJECTDIR}/generated-c/Project.o: generated-c/Project.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Project.o generated-c/Project.c

${OBJECTDIR}/generated-c/Validate.o: generated-c/Validate.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/Validate.o generated-c/Validate.c

${OBJECTDIR}/generated-c/_dispatcher.o: generated-c/_dispatcher.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/_dispatcher.o generated-c/_dispatcher.c

${OBJECTDIR}/generated-c/c_lite.o: generated-c/c_lite.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/c_lite.o generated-c/c_lite.c

${OBJECTDIR}/generated-c/interfaces/C_standalone/fs.o: generated-c/interfaces/C_standalone/fs.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/interfaces/C_standalone
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/interfaces/C_standalone/fs.o generated-c/interfaces/C_standalone/fs.c

${OBJECTDIR}/generated-c/interfaces/C_standalone/path.o: generated-c/interfaces/C_standalone/path.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/interfaces/C_standalone
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/interfaces/C_standalone/path.o generated-c/interfaces/C_standalone/path.c

${OBJECTDIR}/generated-c/lib/ControlledError.o: generated-c/lib/ControlledError.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/ControlledError.o generated-c/lib/ControlledError.c

${OBJECTDIR}/generated-c/lib/Environment.o: generated-c/lib/Environment.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/Environment.o generated-c/lib/Environment.c

${OBJECTDIR}/generated-c/lib/GeneralOptions.o: generated-c/lib/GeneralOptions.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/GeneralOptions.o generated-c/lib/GeneralOptions.c

${OBJECTDIR}/generated-c/lib/OptionsParser.o: generated-c/lib/OptionsParser.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/OptionsParser.o generated-c/lib/OptionsParser.c

${OBJECTDIR}/generated-c/lib/SourceMap.o: generated-c/lib/SourceMap.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/SourceMap.o generated-c/lib/SourceMap.c

${OBJECTDIR}/generated-c/lib/UniqueID.o: generated-c/lib/UniqueID.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/UniqueID.o generated-c/lib/UniqueID.c

${OBJECTDIR}/generated-c/lib/color.o: generated-c/lib/color.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/color.o generated-c/lib/color.c

${OBJECTDIR}/generated-c/lib/logger.o: generated-c/lib/logger.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/logger.o generated-c/lib/logger.c

${OBJECTDIR}/generated-c/lib/mkPath.o: generated-c/lib/mkPath.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/mkPath.o generated-c/lib/mkPath.c

${OBJECTDIR}/generated-c/lib/shims.o: generated-c/lib/shims.c 
	${MKDIR} -p ${OBJECTDIR}/generated-c/lib
	${RM} "$@.d"
	$(COMPILE.c) -O3 -DNDEBUG -I../core -I../include -Igenerated-c/interfaces -Igenerated-c/interfaces/C_standalone -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated-c/lib/shims.o generated-c/lib/shims.c

# Subprojects
.build-subprojects:

# Clean Targets
.clean-conf: ${CLEAN_SUBPROJECTS}
	${RM} -r ${CND_BUILDDIR}/${CND_CONF}
	${RM} ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/litec-to-js

# Subprojects
.clean-subprojects:

# Enable dependency checking
.dep.inc: .depcheck-impl

include .dep.inc
