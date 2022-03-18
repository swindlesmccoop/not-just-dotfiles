#general aliases
alias ":q"="exit"
alias c="clear"
alias enc="gpg -c --no-symkey-cache --cipher-algo AES256"
alias flac-mp3="flac2mp3 -b 320 *.flac"
alias gdl="gdrive download"
alias home="cd ~"
alias install="paru -S"
alias p="paru -S"
alias pms="paru -S"
alias py3="python3"
alias py="python"
alias scrape="python3 ~/scripts/4chan-downloader/inb4404.py"
alias sentra="cp *.mp3 /run/media/swindles/SENTRA/"
alias sitedl="wget --recursive --domains swindlesmccoop.xyz --page-requisites swindlesmccoop.xyz"
alias syyu="pacman -Syyu"
alias timeset="sudo date -s '[DAY] [MONTH] [YEAR] [HOURS]:[MINUTES]:[SECONDS]'"
alias vi="vim"
alias nvim="vim"
alias yay=paru

#petscii type aliases
alias cL="clear"
alias eC="echo"
alias mK="mkdir"
alias pM="pacman"

#edit configurations
alias pacman.conf="sudo vim /etc/pacman.conf"
alias preview="sddm-greeter --test-mode --theme"
alias sddm.conf="sudo vim /etc/sddm.conf"
alias sudoers="visudo"
alias vimrc="vim ~/.config/vim/vimrc"
alias zshrc="vim ~/.config/zsh/.zshrc"

#git aliases
alias gacap="git add . && git commit -a && git push"
alias gc="git clone"

#spellign mistaeks
alias cd..="cd .."
alias claer="clear"
alias claer="clear"
alias clare="clear"
alias cleae="clear"
alias clera="clear"

#youtube-dl
alias mp3="youtube-dl --audio-format mp3 -k"
alias yta="yt -x -f bestaudio/best"
alias ytdl="youtube-dl"

#replace root-only commands with sudo [command]
if [ -f /bin/sudo ]; then
	for command in mount umount sv visudo pacman updatedb su shutdown poweroff reboot ; do
		alias $command="sudo $command"
	done; unset command
fi
