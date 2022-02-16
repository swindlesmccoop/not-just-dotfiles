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
if filereadable('~/.local/share/nvim/site/autoload/plug.vim')
	call plug#begin('~/.local/share/nvim/site/autoload/plug.vim')
		Plug 'vimwiki/vimwiki'
		Plug 'tpope/vim-surround'
			Plug 'ryanoasis/vim-devicons'
		Plug 'junegunn/goyo.vim'
		Plug 'vim-airline/vim-airline'
			Plug 'vim-airline/vim-airline-themes'
		Plug 'tpope/vim-commentary'
		Plug 'psliwka/vim-smoothie'
		Plug 'ThePrimeagen/vim-apm'
		Plug 'alec-gibson/nvim-tetris'
		Plug 'seandewar/nvimesweeper'
		Plug 'ThePrimeagen/vim-be-good'
			Plug 'adelarsq/vim-devicons-emoji'
			Plug 'tiagofumo/vim-nerdtree-syntax-highlight'
		Plug 'ggandor/lightspeed.nvim'
		Plug 'andweeb/presence.nvim'
		Plug 'Xuyuanp/scrollbar.nvim'
		
		"scroll bar config
		augroup ScrollbarInit
			autocmd!
			autocmd WinScrolled,VimResized,QuitPre * silent! lua require('scrollbar').show()
			autocmd WinEnter,FocusGained		   * silent! lua require('scrollbar').show()
			autocmd WinLeave,BufLeave,BufWinLeave,FocusLost			* silent! lua require('scrollbar').clear()
		augroup END
	call plug#end()
endif

"no sound
set noerrorbells visualbell t_vb=

"enable mouse
set mouse+=a

"4 space wide tab characters
set shiftwidth=0
set tabstop=4
set noexpandtab

"tab completion when typing editor commands
set wildmode=longest,list,full
set wildmenu

"dumb key - literally nobody uses it anyways
nmap Q <Nop>

"run script in shellcheck
map <leader>s :!clear && shellcheck -x %<CR>

"shift+s enables sed mode
nnoremap S :%s//g<Left><Left>

"set relative numbers while editing and absolute while not
set number
augroup numbertoggle
	autocmd!
	autocmd BufEnter,FocusGained,InsertLeave,WinEnter * if &nu && mode() != "i" | set nornu | endif
	autocmd BufLeave,FocusLost,InsertEnter,WinLeave * if &nu | set rnu | endif
augroup END

"spell check for .txt files only
au FileType * execute "setlocal dict+=/usr/share/dict/words".&filetype.'.txt'
autocmd BufNewFile,BufRead *.txt set spell

"traditional copy paste commands using device register
vnoremap <C-C> "*y :let @+=@*<CR>"
map <S-Insert> "+P"

"enforce h and l movement in normal mode
nnoremap <Left>  :echoe "Use h"<CR>
nnoremap <Right> :echoe "Use l"<CR>

"map p to P since p sucks
map p P

"syntax highlighting for various file formats
autocmd BufNewFile,BufRead *.bashrc,*.zsh*,zshrc,*.khotkeys,*.kksrc,pacman.conf set syntax=bash
autocmd BufNewFile,BufRead rc.conf,zathurarc set syntax=vim
autocmd BufRead,BufNewFile *.ms,*.me,*.mom,*.man set filetype=groff
autocmd BufRead,BufNewFile *.tex set filetype=tex
