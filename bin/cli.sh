#!/usr/bin/env sh

# Find the directory of the script itself, resolving symlinks
# Uses standard POSIX tools: cd, dirname, pwd, ls -l, sed
script_path="$0"
# Follow links using standard tools
while [ -L "$script_path" ]; do
    script_dir="$(cd -P "$(dirname "$script_path")" >/dev/null 2>&1 && pwd)"
    # Attempt to extract link target using ls and sed (more portable than readlink)
    link_target=$(ls -ld "$script_path" | sed 's/.* -> //')
    # Handle relative links
    if [ "$(echo "$link_target" | cut -c1)" != "/" ]; then
        script_path="$script_dir/$link_target"
    else
        script_path="$link_target"
    fi
done
SCRIPT_DIR="$(cd -P "$(dirname "$script_path")" >/dev/null 2>&1 && pwd)"

# Construct the absolute path to the main JS file
JS_SCRIPT="$SCRIPT_DIR/../create-monorepo.js"

# Check if 'bun' command exists in PATH
if command -v bun >/dev/null 2>&1; then
  # If yes, run with bun, passing all arguments ($@)
  # 'exec' replaces the shell process with the bun process
  exec bun "$JS_SCRIPT" "$@"
else
  # If no, run with node, passing all arguments ($@)
  exec node "$JS_SCRIPT" "$@"
fi
