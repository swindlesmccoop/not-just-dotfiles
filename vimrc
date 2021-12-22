" A bunch of QOL stuff
set nocompatible
set shortmess+=I
set number
set backspace=indent,eol,start
set hidden
set ignorecase
set smartcase
set incsearch

" I hate sound in my text editors
set noerrorbells visualbell t_vb=

" Sometimes I need the mouse
set mouse+=a

" Smaller tabs
set tabstop=4
set noexpandtab

" Tab completion when typing commands
set wildmode=longest,list,full
set wildmenu

" Colors
syntax on

" Dumb key - literally nobody uses it anyways
nmap Q <Nop>

" Sets relative numbers while editing and absolute while not
set number
augroup numbertoggle
	autocmd!
	autocmd BufEnter,FocusGained,InsertLeave,WinEnter * if &nu && mode() != "i" | set nornu | endif
	autocmd BufLeave,FocusLost,InsertEnter,WinLeave * if &nu | set rnu | endif
augroup END

" If file is a txt file, set spell check to on and have auto word completion
au FileType * execute 'setlocal dict+=/usr/share/dict/words'.&filetype.'.txt'
autocmd BufNewFile,BufRead *.txt set spell

" Copy and paste between vim and other programs using device register
vnoremap <C-c> "*y :let @+=@*<CR>
map <C-v> "+P"

" Config syntax highlighting
autocmd BufNewFile,BufRead *.bashrc set syntax=bash
autocmd BufNewFile,BufRead *.zshrc set syntax=bash
autocmd BufNewFile,BufRead *.zsh_profile set syntax=bash
autocmd BufNewFile,BufRead zshrc set syntax=bash
autocmd BufNewFile,BufRead *.css set tabstop=2
autocmd BufNewFile,BufRead *.css set shiftwidth=2
