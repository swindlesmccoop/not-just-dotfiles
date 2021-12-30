"QOL stuff
syntax on
set nocompatible
set shortmess+=I
set number
set backspace=indent,eol,start
set hidden
set ignorecase
set smartcase
set incsearch

"plugin stuff
filetype plugin on
call plug#begin('~/.local/share/nivm/site/autoload/plugvim')
Plug 'vimwiki/vimwiki'
call plug#end()

"no sound
set noerrorbells visualbell t_vb=

"enable mouse
set mouse+=a

"4 space wide tab characters
set tabstop=4
set noexpandtab

"tab completion when typing editor commands
set wildmode=longest,list,full
set wildmenu

"dumb key - literally nobody uses it anyways
nmap Q <Nop>

"set relative numbers while editing and absolute while not
set number
augroup numbertoggle
	autocmd!
	autocmd BufEnter,FocusGained,InsertLeave,WinEnter * if &nu && mode() != "i" | set nornu | endif
	autocmd BufLeave,FocusLost,InsertEnter,WinLeave * if &nu | set rnu | endif
augroup END

"spell check for .txt files only
au FileType * execute 'setlocal dict+=/usr/share/dict/words'.&filetype.'.txt'
autocmd BufNewFile,BufRead *.txt set spell

"traditional copy paste commands using device register
vnoremap <C-c> "*y :let @+=@*<CR>
map <C-v> "+P"

"syntax highlighting for various configs
autocmd BufNewFile,BufRead *.bashrc set syntax=bash
autocmd BufNewFile,BufRead *.zshrc set syntax=bash
autocmd BufNewFile,BufRead *.zsh_profile set syntax=bash
autocmd BufNewFile,BufRead zshrc set syntax=bash
autocmd BufNewFile,BufRead *.khotkeys set syntax=bash
autocmd BufNewFile,BufRead pacman.conf set syntax=bash
autocmd BufNewFile,BufRead rc.conf set syntax=vim
autocmd BufNewFile,BufRead zathurarc set syntax=vim
