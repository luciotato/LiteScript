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
	${OBJECTDIR}/core/LiteC-core.o \
	${OBJECTDIR}/core/any.o \
	${OBJECTDIR}/core/exceptions.o \
	${OBJECTDIR}/core/fs-native.o \
	${OBJECTDIR}/core/util.o \
	${OBJECTDIR}/generated/ASTBase.o \
	${OBJECTDIR}/generated/C_global_import/fs.o \
	${OBJECTDIR}/generated/C_global_import/path.o \
	${OBJECTDIR}/generated/Compiler.o \
	${OBJECTDIR}/generated/Grammar.o \
	${OBJECTDIR}/generated/Names.o \
	${OBJECTDIR}/generated/Parser.o \
	${OBJECTDIR}/generated/Producer_c.o \
	${OBJECTDIR}/generated/Project.o \
	${OBJECTDIR}/generated/Validate.o \
	${OBJECTDIR}/generated/_dispatcher.o \
	${OBJECTDIR}/generated/lib/ControlledError.o \
	${OBJECTDIR}/generated/lib/Environment.o \
	${OBJECTDIR}/generated/lib/GeneralOptions.o \
	${OBJECTDIR}/generated/lib/OptionsParser.o \
	${OBJECTDIR}/generated/lib/PMREX.o \
	${OBJECTDIR}/generated/lib/Strings.o \
	${OBJECTDIR}/generated/lib/UniqueID.o \
	${OBJECTDIR}/generated/lib/color.o \
	${OBJECTDIR}/generated/lib/logger.o \
	${OBJECTDIR}/generated/lib/mkPath.o \
	${OBJECTDIR}/generated/litec.o


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
LDLIBSOPTIONS=-Llib -lgc

# Build Targets
.build-conf: ${BUILD_SUBPROJECTS}
	"${MAKE}"  -f nbproject/Makefile-${CND_CONF}.mk ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/ctest

${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/ctest: ${OBJECTFILES}
	${MKDIR} -p ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}
	${LINK.c} -o ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/ctest ${OBJECTFILES} ${LDLIBSOPTIONS}

${OBJECTDIR}/core/LiteC-core.o: core/LiteC-core.c 
	${MKDIR} -p ${OBJECTDIR}/core
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/core/LiteC-core.o core/LiteC-core.c

${OBJECTDIR}/core/any.o: core/any.c 
	${MKDIR} -p ${OBJECTDIR}/core
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/core/any.o core/any.c

${OBJECTDIR}/core/exceptions.o: core/exceptions.c 
	${MKDIR} -p ${OBJECTDIR}/core
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/core/exceptions.o core/exceptions.c

${OBJECTDIR}/core/fs-native.o: core/fs-native.c 
	${MKDIR} -p ${OBJECTDIR}/core
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/core/fs-native.o core/fs-native.c

${OBJECTDIR}/core/util.o: core/util.c 
	${MKDIR} -p ${OBJECTDIR}/core
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/core/util.o core/util.c

${OBJECTDIR}/generated/ASTBase.o: generated/ASTBase.c 
	${MKDIR} -p ${OBJECTDIR}/generated
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/ASTBase.o generated/ASTBase.c

${OBJECTDIR}/generated/C_global_import/fs.o: generated/C_global_import/fs.c 
	${MKDIR} -p ${OBJECTDIR}/generated/C_global_import
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/C_global_import/fs.o generated/C_global_import/fs.c

${OBJECTDIR}/generated/C_global_import/path.o: generated/C_global_import/path.c 
	${MKDIR} -p ${OBJECTDIR}/generated/C_global_import
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/C_global_import/path.o generated/C_global_import/path.c

${OBJECTDIR}/generated/Compiler.o: generated/Compiler.c 
	${MKDIR} -p ${OBJECTDIR}/generated
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/Compiler.o generated/Compiler.c

${OBJECTDIR}/generated/Grammar.o: generated/Grammar.c 
	${MKDIR} -p ${OBJECTDIR}/generated
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/Grammar.o generated/Grammar.c

${OBJECTDIR}/generated/Names.o: generated/Names.c 
	${MKDIR} -p ${OBJECTDIR}/generated
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/Names.o generated/Names.c

${OBJECTDIR}/generated/Parser.o: generated/Parser.c 
	${MKDIR} -p ${OBJECTDIR}/generated
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/Parser.o generated/Parser.c

${OBJECTDIR}/generated/Producer_c.o: generated/Producer_c.c 
	${MKDIR} -p ${OBJECTDIR}/generated
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/Producer_c.o generated/Producer_c.c

${OBJECTDIR}/generated/Project.o: generated/Project.c 
	${MKDIR} -p ${OBJECTDIR}/generated
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/Project.o generated/Project.c

${OBJECTDIR}/generated/Validate.o: generated/Validate.c 
	${MKDIR} -p ${OBJECTDIR}/generated
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/Validate.o generated/Validate.c

${OBJECTDIR}/generated/_dispatcher.o: generated/_dispatcher.c 
	${MKDIR} -p ${OBJECTDIR}/generated
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/_dispatcher.o generated/_dispatcher.c

${OBJECTDIR}/generated/lib/ControlledError.o: generated/lib/ControlledError.c 
	${MKDIR} -p ${OBJECTDIR}/generated/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/lib/ControlledError.o generated/lib/ControlledError.c

${OBJECTDIR}/generated/lib/Environment.o: generated/lib/Environment.c 
	${MKDIR} -p ${OBJECTDIR}/generated/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/lib/Environment.o generated/lib/Environment.c

${OBJECTDIR}/generated/lib/GeneralOptions.o: generated/lib/GeneralOptions.c 
	${MKDIR} -p ${OBJECTDIR}/generated/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/lib/GeneralOptions.o generated/lib/GeneralOptions.c

${OBJECTDIR}/generated/lib/OptionsParser.o: generated/lib/OptionsParser.c 
	${MKDIR} -p ${OBJECTDIR}/generated/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/lib/OptionsParser.o generated/lib/OptionsParser.c

${OBJECTDIR}/generated/lib/PMREX.o: generated/lib/PMREX.c 
	${MKDIR} -p ${OBJECTDIR}/generated/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/lib/PMREX.o generated/lib/PMREX.c

${OBJECTDIR}/generated/lib/Strings.o: generated/lib/Strings.c 
	${MKDIR} -p ${OBJECTDIR}/generated/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/lib/Strings.o generated/lib/Strings.c

${OBJECTDIR}/generated/lib/UniqueID.o: generated/lib/UniqueID.c 
	${MKDIR} -p ${OBJECTDIR}/generated/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/lib/UniqueID.o generated/lib/UniqueID.c

${OBJECTDIR}/generated/lib/color.o: generated/lib/color.c 
	${MKDIR} -p ${OBJECTDIR}/generated/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/lib/color.o generated/lib/color.c

${OBJECTDIR}/generated/lib/logger.o: generated/lib/logger.c 
	${MKDIR} -p ${OBJECTDIR}/generated/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/lib/logger.o generated/lib/logger.c

${OBJECTDIR}/generated/lib/mkPath.o: generated/lib/mkPath.c 
	${MKDIR} -p ${OBJECTDIR}/generated/lib
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/lib/mkPath.o generated/lib/mkPath.c

${OBJECTDIR}/generated/litec.o: generated/litec.c 
	${MKDIR} -p ${OBJECTDIR}/generated
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/generated/litec.o generated/litec.c

# Subprojects
.build-subprojects:

# Clean Targets
.clean-conf: ${CLEAN_SUBPROJECTS}
	${RM} -r ${CND_BUILDDIR}/${CND_CONF}
	${RM} ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/ctest

# Subprojects
.clean-subprojects:

# Enable dependency checking
.dep.inc: .depcheck-impl

include .dep.inc
