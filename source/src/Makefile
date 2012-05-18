.PHONY: clean install

prefix:=/usr/local
exec_prefix:=${prefix}
libdir:=${exec_prefix}/lib
datarootdir:=${prefix}/share
srcdir:=.
top_builddir:=..
LOCALEDIR:=${datarootdir}/locale

INCS:= -I${top_builddir} -I${srcdir}
OPTS:=-Wmissing-prototypes -Wstrict-prototypes -Wmissing-declarations
DEFS:=-DHAVE_CONFIG_H -DLOCALEDIR=\"${LOCALEDIR}\"
CFLAGS:=-g -pipe -Wall -Wshadow -pedantic-errors -Wpointer-arith -Waggregate-return -Wlong-long -Winline -Wredundant-decls -Wcast-qual -Wcast-align

LDFLAGS:=
LIBS:=
DLLFLAGS:=

OBJDIR:=obj

CSOURCES:=$(wildcard $(addsuffix /*.c,$(srcdir)))
HEADERS:=$(wildcard $(addsuffix /*.h,$(top_builddir) $(srcdir)))
COBJECTS:=$(addprefix $(OBJDIR)/,$(CSOURCES:.c=.o))
OBJECTS:=$(COBJECTS)

CC:=/home/lebed/djvu/emscripten/emcc
CXX:=/home/lebed/djvu/emscripten/em++
LIBTOOL:=$(SHELL) $(top_builddir)/libtool
INSTALL:=/usr/bin/install -c
INSTALL_PROGRAM:=${INSTALL}
INSTALL_DATA:=${INSTALL} -m 644

THISFILE:=Makefile
APPNAME:=minidjvu
APPPATH:=${top_builddir}/bin/${APPNAME}
LIBNAME:=libminidjvu.la
LIBPATH:=${top_builddir}/bin/${LIBNAME}

#all: build-static

all: build-shared

build-static: $(OBJECTS)
	mkdir -p $(dir $(APPPATH))
	$(CXX) ${DLLFLAGS} $(LDFLAGS) $^ -o $(APPPATH) $(LIBPATH) $(LIBS)
	strip $(APPPATH)

build-shared: $(OBJECTS)
	mkdir -p $(dir $(APPPATH))
	${LIBTOOL} --mode=link $(CXX) ${DLLFLAGS} $(LDFLAGS) $^ -o $(APPPATH) $(LIBPATH) $(LIBS)

clean:
	$(RM) $(OBJECTS)
	$(RM) -r $(OBJDIR)

distclean: clean
	-find . -name Makefile -exec ${RM} {} \;

#install: install-static

install: install-shared

install-static:
	${INSTALL} -d ${DESTDIR}$(prefix)/bin
	${INSTALL_PROGRAM} $(APPPATH) ${DESTDIR}$(prefix)/bin

install-shared:
	${INSTALL} -d ${DESTDIR}$(prefix)/bin
	${LIBTOOL} --mode=install ${INSTALL_PROGRAM} $(APPPATH) ${DESTDIR}$(prefix)/bin

$(OBJDIR)/%.o: %.c $(HEADERS) $(THISFILE)
	mkdir -p $(dir $@)
	$(CC) $(CFLAGS) $(INCS) $(OPTS) $(DEFS) -c $< -o $@

uninstall:
	$(RM) ${DESTDIR}$(prefix)/bin/$(APPNAME)

