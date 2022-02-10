#general aliases
alias vi=nvim
alias vim=nvim
alias yay=paru
alias flac-mp3="flac2mp3 -b 320 *.flac"
alias sentra="cp *.mp3 /run/media/swindles/SENTRA/"
alias home="cd ~"
alias enc="gpg -c --no-symkey-cache --cipher-algo AES256"
alias pms="paru -S"
alias p="paru -S"
alias install="paru -S"
alias syyu="pacman -Syyu"
alias gdl="gdrive download"
alias ":q"="exit"
alias timeset="date -s '[DAY] [MONTH] [YEAR] [HOURS]:[MINUTES]:[SECONDS]'"
alias sitedl="wget --recursive --domains swindlesmccoop.xyz --page-requisites swindlesmccoop.xyz"
alias vi="vim"
alias c="clear"
alias py="python"
alias py3="python3"
alias scrape="python3 ~/scripts/4chan-downloader/inb4404.py"

#petscii type aliases
alias mK="mkdir"
alias pM="pacman"
alias cL="clear"
alias eC="echo"

#edit configurations
alias vimrc="vim ~/.config/nvim/init.vim"
alias zshrc="vim ~/.config/zsh/.zshrc"
alias sudoers="visudo"
alias pacman.conf="sudo vim /etc/pacman.conf"
alias sddm.conf="sudo vim /etc/sddm.conf"
alias preview="sddm-greeter --test-mode --theme"

#git aliases
alias gacap="git add . && git commit -a && git push"
alias gc="git clone"

#spellign mistaeks
alias cleae="clear"
alias claer="clear"
alias clera="clear"
alias clare="clear"
alias claer="clear"
alias cd..="cd .."

#youtube-dl
alias ytdl="youtube-dl"
alias mp3="youtube-dl --audio-format mp3 -k"
alias yta="yt -x -f bestaudio/best"

#replace root-only commands with sudo [command]
for command in mount umount sv visudo pacman updatedb su shutdown poweroff reboot ; do
	alias $command="sudo $command"
done; unset command

