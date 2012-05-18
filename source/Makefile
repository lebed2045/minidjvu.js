.PHONY: clean install

prefix:=/usr/local
exec_prefix:=${prefix}
libdir:=${exec_prefix}/lib
srcdir:=.
top_builddir:=.
manpage:=minidjvu

DOCDIR:=doc
MANDIR:=$(prefix)/share/man/man1
SUBDIRS:=src \
         minidjvu \
         po

RM:=/bin/rm -f
INSTALL:=/usr/bin/install -c
INSTALL_PROGRAM:=${INSTALL}
INSTALL_DATA:=${INSTALL} -m 644


THISFILE:=Makefile

all: build-lib

all: build-app

#all: build-po

build-lib:
	cd minidjvu && ${MAKE}

build-app:
	cd src && ${MAKE}

build-po:
	cd po && ${MAKE}

install: install-lib

install: install-app

install: install-doc

#install: install-po

install-app:
	cd src && ${MAKE} install

install-lib:
	cd minidjvu && ${MAKE} install

install-po:
	cd po && ${MAKE} install

install-doc:
	${INSTALL} -d ${DESTDIR}$(MANDIR)
	${INSTALL_DATA} $(DOCDIR)/$(manpage).1 ${DESTDIR}$(MANDIR)
	/usr/bin/gzip -nf -9 $(MANDIR)/$(manpage).1
	for dir in $(DOCDIR)/*/; do \
	  if [ -f $${dir}$(manpage).1 ]; then \
	    LOCMANDIR=${DESTDIR}$(prefix)/share/man$${dir#$(DOCDIR)}/man1 &&\
	    ${INSTALL} -d $${LOCMANDIR} &&\
	    ${INSTALL_DATA} $${dir}$(manpage).1 $${LOCMANDIR} && \
	    /usr/bin/gzip -nf -9 $${LOCMANDIR}/$(manpage).1; \
	  fi; \
	done

clean:
	for d in ${SUBDIRS}; do ( cd $$d && ${MAKE} $@ ); done

distclean:
	for d in ${SUBDIRS}; do ( cd $$d && ${MAKE} $@ ); done
	-find . -name Makefile -exec ${RM} {} \;
	-${RM} config.h config.log config.status

uninstall:
	for d in ${SUBDIRS}; do ( cd $$d && ${MAKE} $@ ); done
	${RM} ${DESTDIR}$(MANDIR)/$(manpage).1.gz
	for dir in $(DOCDIR)/*/; do \
	  if [ -f $${dir}$(manpage).1 ]; then \
	    LOCMANDIR=${DESTDIR}$(prefix)/share/man$${dir#$(DOCDIR)}/man1 &&\
	    ${RM} $${LOCMANDIR}/$(manpage).1.gz; \
	  fi; \
	done

