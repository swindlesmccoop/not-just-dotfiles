source "$HOME/.config/shell/exports"
source "$HOME/.config/shell/aliases"
export HISTFILE="$HOME/.cache/bash/history"
set -o vi
PS1="\[\033[38;5;1m\][\[$(tput sgr0)\]\[\033[38;5;3m\]\u\[$(tput sgr0)\]\[\033[38;5;156m\]@\[$(tput sgr0)\]\[\033[38;5;4m\]\h\[$(tput sgr0)\] \[$(tput sgr0)\]\[\033[38;5;5m\]\w\[$(tput sgr0)\]\[\033[38;5;1m\]]\[$(tput sgr0)\]\\$ \[$(tput sgr0)\]"
