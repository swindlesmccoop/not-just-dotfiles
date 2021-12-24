#options
setopt autocd
setopt interactive_comments
EDITOR=vim
BROWSER=chromium

#have vim respect xdg
export ZDOTDIR=$HOME/.config/zsh
export VIMINIT='let $MYVIMRC="$HOME/.config/vim/vimrc" | source $MYVIMRC'

#history stuff
HISTFILE=$HOME/.config/zsh/.zsh_history
HISTSIZE=HISTSIZE
SAVEHIST=10000000
setopt appendhistory

#vitasdk
VITASDK=/usr/local/vitasdk

#path
PATH=$VITASDK/bin:$PATH:/home/swindles/.local/bin:/home/swindles/scripts:/home/swindles/scripts/bin:/home/swindles/scripts/swindlesmccoop

#colors and stuff
autoload -U colors && colors
PS1="%B%{$fg[red]%}[%{$fg[yellow]%}%n%{$fg[green]%}@%{$fg[blue]%}%M %{$fg[magenta]%}%~%{$fg[red]%}]%{$reset_color%}$%b "
LS_COLORS='rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arc=01;31:*.arj=01;31:*.taz=01;31:*.lha=01;31:*.lz4=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.tzo=01;31:*.t7z=01;31:*.zip=01;31:*.z=01;31:*.Z=01;31:*.dz=01;31:*.gz=01;31:*.lrz=01;31:*.lz=01;31:*.lzo=01;31:*.xz=01;31:*.zst=01;31:*.tzst=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.alz=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.cab=01;31:*.wim=01;31:*.swm=01;31:*.dwm=01;31:*.esd=01;31:*.jpg=01;35:*.jpeg=01;35:*.mjpg=01;35:*.mjpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.m4a=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.oga=00;36:*.opus=00;36:*.spx=00;36:*.xspf=00;36:';
export LS_COLORS
alias ls="ls --color"
WALL=$HOME/.config/wall.jpg
wal -i $WALL > /dev/null 2>&1

###############ALIASES###############

#expands aliases
function expand-alias() {
        zle _expand_alias
        zle self-insert
}

#expands aliases when pressing enter
expand-alias-and-accept-line() {
    expand-alias
    zle .backward-delete-char
    zle .accept-line
}

zle -N accept-line expand-alias-and-accept-line
zle -N expand-alias
bindkey -M main ' ' expand-alias

#general aliases
alias vi=vim
alias yay=paru
alias flac-mp3="flac2mp3 -b 320 *.flac"
alias sentra="cp *.mp3 /run/media/swindles/SENTRA/"
alias home="cd ~"
alias enc="gpg -c --no-symkey-cache --cipher-algo AES256"
alias pms="paru -S"
alias p="paru -S"
alias install="paru -S"
alias syyu="sudo pacman -Syyu"
alias ":q"="exit"
alias timeset="date -s '[DAY] [MONTH] [YEAR] [HOURS]:[MINUTES]:[SECONDS]'"
alias cmatrix="neo --fps=60 --screensaver"
alias sitedl="wget --recursive --domains swindlesmccoop.xyz --page-requisites swindlesmccoop.xyz"
alias vi="vim"
alias c="clear"
alias py="python"
alias py3="python3"
alias 4ch="python3 ~/scripts/4chan-downloader/inb4404.py"

#petscii type aliases
alias mK="mkdir"
alias pM="pacman"
alias cL="clear"
alias eC="echo"

#edit configurations
alias vimrc="vim ~/.vimrc"
alias bashrc="vim ~/.bashrc"
alias sudoers="sudo vim /etc/sudoers"
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
alias m4a="youtube-dl --audio-format best -k"

#####################################

#tab completion
autoload -U compinit
zstyle ':completion:*' menu select
zmodload zsh/complist
compinit
_comp_options+=(globdots)

#vi mode
bindkey -v
export KEYTIMEOUT=1
bindkey "^?" backward-delete-char

#vi keys in tab complete menu
bindkey -M menuselect 'h' vi-backward-char
bindkey -M menuselect 'k' vi-up-line-or-history
bindkey -M menuselect 'l' vi-forward-char
bindkey -M menuselect 'j' vi-down-line-or-history

#flashing block for insert mode, steady for normal
function zle-keymap-select {
  if [[ ${KEYMAP} == vicmd ]] ||
     [[ $1 = 'steady block' ]]; then
    echo -ne '\e[2 q'
  elif [[ ${KEYMAP} == main ]] ||
       [[ ${KEYMAP} == viins ]] ||
       [[ ${KEYMAP} = '' ]] ||
       [[ $1 = 'blinking block' ]]; then
    echo -ne '\e[1 q'
  fi
}
zle -N zle-keymap-select
zle-line-init() {
    zle -K viins #initiate "vi insert" as keymap
    echo -ne "\e[1 q"
}
zle -N zle-line-init
echo -ne '\e[1 q' #use blinking block on startup
preexec() { echo -ne '\e[1 q' ;} #use blinking block on new prompt

#ctrl+e edits current line in vim
autoload edit-command-line; zle -N edit-command-line
bindkey '^e' edit-command-line

#have to have this function twice so aliases expand when pressing enter AND space
function expand-alias() {
        zle _expand_alias
        zle self-insert
}
zle -N expand-alias
bindkey -M main ' ' expand-alias

eval $(thefuck --alias)

#syntax highlighting
source /usr/share/zsh/plugins/fast-syntax-highlighting/fast-syntax-highlighting.plugin.zsh 2>/dev/null
