#options
export EDITOR=vim
export BROWSER=firefox
export TERMINAL=st

#make programs respect xdg
export ZDOTDIR=$HOME/.config/zsh
export VIMINIT="set nocp | source ${XDG_CONFIG_HOME:-$HOME/.config}/vim/vimrc"

#history stuff
HISTFILE=$HOME/.config/zsh/.zsh_history
HISTSIZE=HISTSIZE
SAVEHIST=10000000
setopt appendhistory

#path
PATH="$PATH:$VITASDK/bin:/$HOME/.local/bin"

#colors and icons
autoload -U colors && colors
alias ls="ls -A"
source "$HOME/.config/zsh/aliases.zsh"
export LESS_TERMCAP_mb=$'\e[1;32m'
export LESS_TERMCAP_md=$'\e[1;32m'
export LESS_TERMCAP_me=$'\e[0m'
export LESS_TERMCAP_se=$'\e[0m'
export LESS_TERMCAP_so=$'\e[01;33m'
export LESS_TERMCAP_ue=$'\e[0m'
export LESS_TERMCAP_us=$'\e[1;4;31m'
export LC=en_US.UTF-8
export LC_ALL=$LC
[ "$(id -u)" = 0 ] && PS1ICON="#" || PS1ICON='%'
PS1="%B%{$fg[red]%}[%{$fg[yellow]%}%n%{$fg[green]%}@%{$fg[blue]%}%M %{$fg[magenta]%}%~%{$fg[red]%}]%{$reset_color%}%$PS1ICON "

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
       [[ $1 = 'steady beam' ]]; then
    echo -ne '\e[6 q'
  fi
}
zle -N zle-keymap-select
zle-line-init() {
    zle -K viins #initiate "vi insert" as keymap
    echo -ne "\e[6 q"
}
zle -N zle-line-init
echo -ne '\e[6 q' #use steady beam on startup
preexec() { echo -ne '\e[2 q' }

#ctrl+e edits current line in vim
autoload edit-command-line; zle -N edit-command-line
bindkey '^e' edit-command-line

#source autocompletion from man pages
zstyle ':completion:*:manuals'    separate-sections true
zstyle ':completion:*:manuals.*'  insert-sections   true
zstyle ':completion:*:man:*'      menu yes select

#syntax highlighting
plugin () { source "$HOME/.local/share/zsh/plugins/"$1"" 2>/dev/null }
plugin zsh-autosuggestions/zsh-autosuggestions.plugin.zsh
plugin zsh-syntax-highlighting/zsh-syntax-highlighting.plugin.zsh
plugin zsh-completions/zsh-completions.plugin.zsh
plugin zsh-history-substring-search/zsh-history-substring-search.plugin.zsh
