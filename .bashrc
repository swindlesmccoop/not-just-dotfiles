source $HOME/.config/shell/aliases
source $HOME/.config/shell/exports
set -o vi
PATH=$PATH:$HOME/.local/bin:$HOME/.local/share/cargo/bin
export PS1="\[\033[38;5;1m\][\[$(tput sgr0)\]\[\033[38;5;3m\]\u\[$(tput sgr0)\]\[\033[38;5;2m\]@\[$(tput sgr0)\]\[\033[38;5;4m\]\H\[$(tput sgr0)\] \[$(tput sgr0)\]\[\033[38;5;5m\]\w\[$(tput sgr0)\]\[\033[38;5;1m\]]\[$(tput sgr0)\]\\$ \[$(tput sgr0)\]"
