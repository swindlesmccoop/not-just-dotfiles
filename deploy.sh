#!/bin/sh

#determine distribution
if [ -f /bin/pacman ]; then
	DISTRO=arch
else if [ -f /bin/apt ]; then
	DISTRO=ubuntu
else if [ -f /bin/emerge ]; then
	DISTRO=gentoo
	echo "Gentoo not yet supported!"
fi
fi
fi

#install packages for arch and derivatives
if [ $DISTRO = arch ]; then
	pacman -S -y --needed - < pkglist.txt
fi

#install packages for ubuntu and derivatives
if [ $DISTRO = ubuntu ]; then
	sudo apt-get install -y $(awk '{print $1'} pkglist.txt)
fi

#actually deploying dotfiles
sudo sh -c "echo 'ZDOTDIR=$HOME/.config/zsh' >> /etc/zsh/zshenv"

link zshrc "$HOME/.config/zsh/.zshrc"
link aliases.zsh "$HOME/.config/zsh/aliases.zsh"
link init.vim "$HOME/.config/neovim/init.vim"
link rc.conf "$HOME/.config/ranger/rc.conf"
link zathurarc "$HOME/.config/zathura/zathurarc"
