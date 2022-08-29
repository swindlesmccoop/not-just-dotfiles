PREFIX = ${HOME}/.local
CONF = ${HOME}/.config

deps:
	@command -v curl > /dev/null || printf "\033[31m:Due to the high amount of dependencies, it's nearly impossible to check for them across all systems. Check pkglist.txt to see if you filfill the requirements. Alternatively, try using the scripts and configurations, and individually fix anything broken.\n"

configs:
	mkdir -p ${DESTDIR}${CONF}
	cp -r .config ${DESTDIR}${PREFIX}/bin/

scripts:
	mkdir -p ${DESTDIR}${PREFIX}/bin/
	cp -r .local/bin/* ${DESTDIR}${PREFIX}/bin/

dwm:
	git clone https://git.cbps.xyz/swindlesmccoop/dwm
	git clone https://git.cbps.xyz/swindlesmccoop/dwmblocks


i3:


bspwm:


.PHONY: deps configs scripts dwm i3 bspwm