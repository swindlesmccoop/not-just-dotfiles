#one-liners
vimcurl () {curl -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36" -sL "$1" | vim -}
search () {filehandler "$(du -a "$PWD/" --exclude="*/.cache/*" --exclude="*/.git/*"| awk '{print $2}' | fzf --layout=reverse --height 40%)"}
scripts () {filehandler "$(du -a $HOME/.local/bin/ | awk '{print $2}' | fzf --layout=reverse --height 40%)"}
downloads () {filehandler "$(du -a $HOME/downloads/ | awk '{print $2}' | fzf --layout=reverse --height 40%)"}

#general aliases
alias enc="gpg -c --cipher-algo AES256"
alias ":q"="exit"
alias c="clear"
alias flac-mp3="flac2mp3 -b 320 *.flac"
alias pms="paru -S"
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
alias ="clear"

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
