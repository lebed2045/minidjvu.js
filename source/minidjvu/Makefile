.PHONY: clean install

SHELL:=/bin/bash
LIBRARY_VERSION:=0:8

prefix:=/usr/local
exec_prefix:=${prefix}
libdir:=${exec_prefix}/lib
datarootdir:=${prefix}/share
srcdir:=.
top_builddir:=..
LOCALEDIR:=${datarootdir}/locale

CC:=/home/lebed/djvu/emscripten/emcc
CXX:=/home/lebed/djvu/emscripten/em++
LIBTOOL:=$(SHELL) $(top_builddir)/libtool
INSTALL:=/usr/bin/install -c
INSTALL_LIB:=${INSTALL} -m 644

INCS:= -I${top_builddir} -I${srcdir}
OPTS:=-Wmissing-prototypes -Wstrict-prototypes -Wmissing-declarations
DEFS:=-DHAVE_CONFIG_H
FLAGS:=-g -pipe -Wall -Wshadow -pedantic-errors -Wpointer-arith -Waggregate-return -Wlong-long -Winline -Wredundant-decls -Wcast-qual -Wcast-align
CFLAGS:=${FLAGS} ${OPTS} ${INCS} ${DEFS}
CXXFLAGS:=${FLAGS} ${INCS} ${DEFS}

LDFLAGS:=
LIBS:=
DLLFLAGS:=

OBJDIR:=obj
SUBDIRS:=$(srcdir) \
         base \
         alg \
         alg/patterns \
         jb2 \
         formats

THISFILE:=Makefile

CSOURCES:=$(wildcard $(addsuffix /*.c,$(SUBDIRS)))
CPPSOURCES:=$(wildcard $(addsuffix /*.cpp,$(SUBDIRS)))
HEADERS:=$(wildcard $(addsuffix /*.h,$(top_builddir) $(SUBDIRS)))
COBJECTS:=$(addprefix $(OBJDIR)/,$(CSOURCES:.c=.o))
CPPOBJECTS:=$(addprefix $(OBJDIR)/,$(CPPSOURCES:.cpp=.o))
CLOBJECTS:=$(addprefix $(OBJDIR)/,$(CSOURCES:.c=.lo))
CPPLOBJECTS:=$(addprefix $(OBJDIR)/,$(CPPSOURCES:.cpp=.lo))
OBJECTS:=$(COBJECTS) $(CPPOBJECTS)
LOBJECTS:=$(CLOBJECTS) $(CPPLOBJECTS)

LIBNAME:=libminidjvu.la
LIBPATH:=${top_builddir}/bin/${LIBNAME}

#all: build-static

all: build-shared

build-static: $(OBJECTS)
	mkdir -p $(dir $(LIBPATH))
	ar cru $(LIBPATH) $^
	ranlib $(LIBPATH)

build-shared: $(LOBJECTS)
	mkdir -p $(dir $(LIBPATH))
	$(LIBTOOL) --mode=link $(CXX) $(CXXFLAGS) -c -no-undefined \
		 -rpath ${libdir} -version-info ${LIBRARY_VERSION} $(DLLFLAGS) \
		 ${OBJS} ${LDFLAGS} $^ -o $(LIBPATH) ${LIBS}

#clean: clean-static

clean: clean-shared

clean-static:
	$(LIBTOOL) --mode=clean $(RM) $(OBJECTS)
	$(RM) -r $(OBJDIR)

clean-shared:
	$(RM) $(OBJECTS)
	$(RM) -r $(OBJDIR)

distclean: clean
	-find . -name Makefile -exec ${RM} {} \;

#install:

install: install-shared

install-shared:
	$(LIBTOOL) --mode=install $(INSTALL_LIB) $(LIBPATH) $(DESTDIR)$(libdir)

$(OBJDIR)/%.o: %.c $(HEADERS) $(THISFILE)
	mkdir -p $(dir $@)
	$(CC) $(CFLAGS) -c $< -o $@

$(OBJDIR)/%.o: %.cpp $(HEADERS) $(THISFILE)
	mkdir -p $(dir $@)
	$(CXX) $(CXXFLAGS) -c $< -o $@

$(OBJDIR)/%.lo: %.c $(HEADERS) $(THISFILE)
	mkdir -p $(dir $@)
	$(LIBTOOL) --mode=compile $(CC) $(CFLAGS) -c $< -o $@

$(OBJDIR)/%.lo: %.cpp $(HEADERS) $(THISFILE)
	mkdir -p $(dir $@)
	$(LIBTOOL) --mode=compile $(CXX) $(CXXFLAGS) -c $< -o $@

#uninstall:

uninstall: uninstall-shared

uninstall-shared:
	${LIBTOOL} --mode=uninstall $(RM) ${DESTDIR}$(libdir)/$(LIBNAME)

