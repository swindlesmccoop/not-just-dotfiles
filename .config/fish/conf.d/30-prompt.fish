set -g pure_symbol_prompt '$'
set -g pure_begin_prompt_with_current_directory true

# user@host defaults to pure_color_mute (brblack), which is nearly invisible
# against a dark wallust background. Use warning (yellow/gold) instead - it's
# the one base color not already used by the dir (primary/blue) or $ (success/danger).
# username and hostname share this color; @ uses green - a genuinely
# different accent slot, plain weight, no dim/bold tricks.
set -g pure_color_hostname pure_color_warning
set -g pure_color_username_normal pure_color_warning
set -g pure_color_at_sign green

# The [] wrapping user@host is custom (functions/_pure_prompt_symbol.fish),
# not stock pure. Was pure_color_mute (near-invisible); red is safe now that
# wallust.toml has check_contrast = true.
set -g pure_color_user_host_bracket pure_color_danger
