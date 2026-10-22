# Linux / Unix Commands & Shell

**In 30 seconds**
- **13 of 33** DSSSB OS questions were Linux: grep, chmod, rm, rmdir, permissions, shells, prompt, /etc, /usr, ext4. This chapter is pure marks.
- **grep** ⭐ searches files for lines matching a pattern and prints them. **rm** ⭐ deletes files; **rm -r** deletes directories with contents; **rmdir** ⭐ deletes only **empty** directories.
- **chmod** ⭐ takes two arguments: **the permission change and the file name(s)** — `chmod 755 file` or `chmod u+x file`.
- Default permissions ⭐: new file **666**, new directory **777**, minus **umask 022** → file **644 (rw-r--r--)**, directory **755 (rwxr-xr-x)**.
- Shells ⭐: sh (Bourne), bash, csh (C shell), tcsh, ksh (Korn), zsh, fish, dash. Prompt ⭐: **$** normal user, **#** root, **%** C shell.
- **/etc** ⭐ = configuration files; **/tmp** = temporary files; **/usr** = user programs and libraries; **/dev** = device files; **/bin** = essential commands.
- Wildcards ⭐: `*` any string, `?` one character, `[ ]` one of a set. **`rm doc*`** deletes every file whose name **begins with "doc"**.
- Default Linux file system ⭐ = **ext4**.

---

## 1. Unix and Linux: history and architecture
- **UNIX**: written in 1969 at **AT&T Bell Labs** by **Ken Thompson and Dennis Ritchie**; rewritten in **C** in 1973 (so it became portable). Branches: AT&T System V and **BSD** (Berkeley). **POSIX** standardises the Unix interface.
- **GNU project** (1983, **Richard Stallman**): free Unix-like tools — bash, gcc, coreutils. Licence: **GPL**.
- **Linux kernel**: started in 1991 by **Linus Torvalds** (Finland); released under GPL v2. Strictly, "Linux" is only the **kernel**; the full system is **GNU/Linux**.
- Linux is **open source, multi-user, multitasking, portable**, with a **monolithic kernel** that can load **modules** at run time.

### Architecture (layers)
| Layer | Role |
|---|---|
| **Hardware** | CPU, memory, disks, devices |
| **Kernel** | Core of the OS: process management, memory management, file system, device drivers, system calls |
| **Shell** | **Command interpreter** — the interface between the user and the kernel; reads commands and runs them |
| **Utilities / applications** | Commands (ls, cp, grep…), editors, compilers, user programs |

- **File system**: one single tree starting at the root `/`; devices are attached by mounting.
- **"Everything is a file"**: regular files, directories, devices (`/dev/sda`), pipes, sockets and even process information (`/proc`) appear as files.
- File types shown by the first character of `ls -l`: `-` regular, `d` directory, `l` symbolic link, `c` character device, `b` block device, `p` named pipe (FIFO), `s` socket.

### Distributions
A **distribution (distro)** = Linux kernel + GNU tools + package manager + installer + desktop.
| Family | Distros | Package format / tool |
|---|---|---|
| Debian | Debian, **Ubuntu**, Linux Mint, Kali | `.deb` — `dpkg`, `apt` |
| Red Hat | **RHEL**, Fedora, CentOS, Rocky, AlmaLinux | `.rpm` — `rpm`, `yum`, `dnf` |
| Others | Arch (`pacman`), openSUSE (`zypper`), Android (Linux kernel) | — |

Desktop environments: **KDE**, **GNOME**, Xfce. A **terminal emulator** (Konsole in KDE, GNOME Terminal) runs the shell.

## 2. Directory hierarchy ⭐ Asked in DSSSB
Defined by the **Filesystem Hierarchy Standard (FHS)**.

| Directory | Contents |
|---|---|
| `/` | **Root** of the whole tree (not the same as `/root`) |
| `/bin` | **Essential user command binaries** (ls, cp, cat, rm) — executable files for the commands |
| `/sbin` | **System binaries** for administration (fdisk, mkfs, reboot, ifconfig) — mainly for root |
| `/boot` | **Boot loader files**: kernel image (vmlinuz), initrd/initramfs, GRUB |
| `/dev` | **Device files** (sda, tty, null, usb) — interfaces to the device drivers that control peripherals |
| `/etc` ⭐ | **System-wide configuration files**: passwd, shadow, group, fstab, hosts, hostname, sudoers, crontab |
| `/home` | **Home directories of normal users** (/home/ravi) |
| `/root` | Home directory of the **root (super) user** |
| `/lib` | **Shared libraries** and kernel modules needed by /bin and /sbin |
| `/media` | Mount points for **removable media** (USB, CD) — mounted automatically |
| `/mnt` | Mount point for **temporarily mounted** file systems (by the admin) |
| `/opt` | **Optional / add-on** third-party software (/opt/google/chrome) |
| `/proc` | **Virtual file system** with process and kernel information (/proc/cpuinfo, /proc/meminfo, /proc/PID) |
| `/sys` | Virtual file system for devices and drivers (sysfs) |
| `/tmp` | **Temporary files** — often cleared at reboot; sticky bit set |
| `/usr` | **User programs, libraries, documentation** — /usr/bin, /usr/lib, /usr/share, /usr/local (a read-only "secondary hierarchy") |
| `/var` | **Variable data** that grows: logs (/var/log), mail, spool (print queue), caches, /var/www |
| `/run` | Run-time data since last boot (PID files) |

On many modern distros `/bin`, `/sbin` and `/lib` are links to `/usr/bin`, `/usr/sbin` and `/usr/lib` ("usr merge"); exam statements follow the classic layout.

⭐ **PYQ 2023**: "NOT true?" → "**usr: contains temporary files**" is false (temporary files are in /tmp). The statements "**bin**: executable files for the UNIX commands", "**dev**: device drivers that control peripherals" and "**etc**: additional commands for system maintenance and administration" (older Unix kept admin commands in /etc) were accepted as true.
⭐ **PYQ 2023**: "Configuration files are found in?" → **/etc**.

### Paths
- **Absolute path**: starts from root `/` — `/home/ravi/notes.txt`.
- **Relative path**: starts from the current directory — `notes/os.txt`, `../data`.
- `~` = your home directory (`~ravi` = ravi's home); `.` = current directory; `..` = parent directory; `-` (with cd) = previous directory.
- Names are **case-sensitive** (`File` ≠ `file`); a name starting with `.` is **hidden** (`.bashrc`).

## 3. Shells ⭐ Asked in DSSSB
The **shell** is the command interpreter between the user and the kernel; it is also a **scripting language**.

| Shell | Program | Author / note | Default prompt |
|---|---|---|---|
| **Bourne shell** | `sh` | Stephen Bourne, Bell Labs, 1979 — the original standard shell | `$` |
| **Bash** (Bourne-Again shell) | `bash` | Brian Fox, GNU, 1989 — **default on most Linux distros** | `$` user, `#` root |
| **C shell** | `csh` | Bill Joy, BSD — C-like syntax, introduced history and aliases | `%` |
| **TENEX C shell** | `tcsh` | Enhanced csh (command-line editing, completion) | `%` / `>` |
| **Korn shell** | `ksh` | David Korn, Bell Labs, 1983 — Bourne-compatible plus csh features | `$` |
| **Z shell** | `zsh` | Paul Falstad, 1990 — **default on macOS since 2019** | `%` |
| **fish** | `fish` | "Friendly interactive shell", 2005 — autosuggestions | `>` |
| **dash** | `dash` | Debian Almquist shell — small, fast `/bin/sh` on Debian/Ubuntu | `$` |

- Non-shells used as distractors: "Alpha cell", "lsh", "gsh", "Delta shell".
- ⭐ **Prompt**: bash shows **`$` for a normal user** and **`#` for root**; `%` is the C-shell prompt. The prompt string is in variable **PS1** (continuation prompt **PS2** = `>`).
- `echo $SHELL` — your login shell; `echo $0` — the shell running now; `cat /etc/shells` — valid shells; `chsh -s /bin/zsh` — change login shell.
- **Login shell** reads `/etc/profile` and `~/.bash_profile`; interactive non-login bash reads `~/.bashrc`.
- **Shell variables**: `name=ravi` (no spaces around `=`), read with `$name`; `export name` makes it an **environment variable** passed to child processes. `env`/`printenv` list them; `set` lists shell variables too; `unset name` removes one.
- Important variables: **PATH** (colon-separated list of directories searched for commands), HOME, USER, SHELL, PWD, PS1, HISTSIZE. Add a directory: `export PATH=$PATH:/opt/bin`.
- `alias ll='ls -l'` creates a shortcut; `type cmd` shows whether a command is a builtin, alias or file.

## 4. Command tables

### Navigation
| Command | Purpose | Example |
|---|---|---|
| `pwd` | Print working (current) directory | `pwd` → /home/ravi |
| `cd dir` | Change directory | `cd /etc`; `cd ..` parent; `cd` or `cd ~` home; `cd -` previous |
| `ls` | List directory contents | `ls -l` long listing; `-a` all incl. hidden; `-h` human sizes (with -l); `-R` recursive; `-t` sort by time; `-r` reverse; `-S` by size; `-i` inode numbers; `-d` the directory itself |

### Files and directories
| Command | Purpose | Example |
|---|---|---|
| `touch` | Create an empty file, or update its timestamps | `touch a.txt` |
| `cat` | Concatenate and display files | `cat a b > c`; `cat > f` (type, Ctrl+D ends); `cat -n` numbers lines |
| `cp` | Copy | `cp a b`; `cp -r dir1 dir2` (directories); `-i` ask before overwrite; `-p` keep attributes; `-v` verbose |
| `mv` | Move **or rename** (no -r needed) | `mv old new`; `mv f /tmp/` |
| `rm` ⭐ | **Remove (delete) files** | `rm f`; `rm -i f` ask first; `rm -f f` force, no prompt; `rm -r dir` recursive (directory and contents); `rm -rf dir` |
| `rmdir` ⭐ | Remove **empty** directories only | `rmdir old`; `rmdir -p a/b/c` removes empty parents too |
| `mkdir` | Make directory | `mkdir notes`; `mkdir -p a/b/c` creates parents, no error if it exists |
| `ln` | Create **hard link** (same inode) | `ln file hard` |
| `ln -s` | Create **symbolic (soft) link** (a path) | `ln -s /etc/hosts h` |
| `file` | Determine file type by reading its content (magic number) | `file a.out` |
| `stat` | Inode details: size, blocks, permissions, access/modify/change times | `stat a.txt` |

- **Hard link**: another name for the same inode; link count rises; cannot cross file systems or link directories; data stays until the last link is removed.
- **Soft link**: a separate file holding a path; can cross file systems and point to directories; becomes **dangling** if the target is deleted.
- `rm dir` without `-r` fails ("Is a directory"); `rmdir dir` fails if dir is not empty ("Directory not empty").
- ⭐ **PYQ**: "Command to delete files?" → **rm** (not Rmdir/Delete/Rdir). "Command to remove a directory?" → **rm** (with -r) — Delete and Erase are DOS-style and do not exist in Linux.

### Viewing file contents
| Command | Purpose | Example |
|---|---|---|
| `more` | Page through a file, forward only | `more big.log` |
| `less` | Page forward **and backward**, search with `/` ("less is more") | `less big.log` |
| `head` | First **10** lines by default | `head -n 5 f` |
| `tail` | Last **10** lines by default | `tail -n 20 f`; `tail -f /var/log/syslog` follows a growing file |
| `wc` | Count **lines, words, bytes** | `wc -l f` lines; `-w` words; `-c` bytes; `-m` characters |

### Searching
| Command | Purpose | Example |
|---|---|---|
| `grep` ⭐ | **Search files for lines that match a pattern and print those lines** (global regular expression print) | `grep "error" app.log` |
| `grep -i` | Ignore case | `grep -i linux f` |
| `grep -v` | Invert: lines that do **not** match | `grep -v "^#" conf` |
| `grep -c` | Count matching lines | `grep -c main *.c` |
| `grep -n` | Show line numbers | `grep -n TODO f` |
| `grep -r` | Recursive through directories | `grep -r "port" /etc` |
| `grep -l` | List only names of files that match | `grep -l main *.c` |
| `grep -w` | Match whole words only | `grep -w is f` |
| `grep -E` / `egrep` | Extended regular expressions (`+ ? \| ( )`) | `grep -E "cat\|dog" f` |
| `grep -F` / `fgrep` | Fixed strings, no regex | `grep -F "a.b" f` |
| `find` | Search the **directory tree** for files by name, type, size, time, owner | `find /home -name "*.txt"`; `find . -type d`; `find / -size +100M`; `find . -mtime -7`; `find . -name "*.tmp" -delete` |
| `locate` | Fast name search in a database (updated by `updatedb`) | `locate passwd` |
| `which` | Path of the executable that would run (searches PATH) | `which python3` |
| `whereis` | Locations of binary, source and **man page** | `whereis ls` |

⭐ **PYQ 2023**: "grep is used to:" → **search for a specific pattern in a specified file and display the lines containing it.** Distractors: change case = `tr`; cut columns = `cut`; send output to another command = pipe `|`.

## 5. Permissions ⭐ Asked in DSSSB
Every file has an **owner (user)**, a **group** and **others**, each with **r** (read), **w** (write), **x** (execute).

| Bit | On a file | On a directory |
|---|---|---|
| r = 4 | Read contents | List names (`ls`) |
| w = 2 | Modify contents | Create, delete, rename entries |
| x = 1 | Run as a program | Enter it (`cd`) and access entries |

### Decoding `ls -l`
`-rwxr-xr-- 2 ravi staff 4096 Oct 22 10:15 run.sh`
- `-` type (regular file) · `rwx` user · `r-x` group · `r--` others · `2` hard-link count · `ravi` owner · `staff` group · `4096` size in bytes · date and time of last modification · name.

### Octal (4-2-1) conversions (script-verified)
| Octal | Symbolic | Typical use |
|---|---|---|
| 777 | rwxrwxrwx | Everyone everything (unsafe) |
| 755 | rwxr-xr-x | Programs, directories |
| 750 | rwxr-x--- | Group-shared programs |
| 711 | rwx--x--x | Run but not read |
| 700 | rwx------ | Private directory |
| 666 | rw-rw-rw- | Base for new files |
| 664 | rw-rw-r-- | Group-writable file |
| 644 | rw-r--r-- | **Default text file** ⭐ |
| 640 | rw-r----- | Config readable by group |
| 600 | rw------- | Private file (SSH keys) |
| 555 | r-xr-xr-x | Read and run only |
| 444 | r--r--r-- | Read-only for all |

Method: add the digits per class — `rw-` = 4+2+0 = 6, `r-x` = 4+0+1 = 5. Example: `rwxr-x---` = 7 5 0 = **750**.

### chmod ⭐
Syntax: **`chmod [options] MODE FILE...`** — the two arguments are **the permission change** and **the file name(s)**.
| Form | Example | Result |
|---|---|---|
| Octal | `chmod 755 script.sh` | rwxr-xr-x |
| Symbolic add | `chmod u+x f` (644 → 744) | owner may execute |
| Symbolic remove | `chmod go-r f` (644 → 600) | group/others lose read |
| Symbolic set | `chmod a=r f` → 444; `chmod u=rwx,g=rx,o= f` → 750 | exact permissions |
| Combined | `chmod g+w,o-x f` (755 → 774) | |
| Recursive | `chmod -R 755 dir` | whole tree |

Who: **u** user/owner, **g** group, **o** others, **a** all. Operator: **+** add, **-** remove, **=** set exactly. Only the **owner or root** can chmod a file.
- `chown user file`, `chown user:group file`, `chown -R` — change owner (root only).
- `chgrp group file` — change group.
- ⭐ **PYQ 2023**: "Two arguments chmod takes?" → **Permission changes and file names** (user names belong to chown).

### umask ⭐
- New files start from **666** (no execute), new directories from **777**. The **umask** bits are **removed** (bitwise AND with NOT umask).
- Default umask **022** → file **644 rw-r--r--** ⭐, directory **755 rwxr-xr-x**.
- umask 002 → 664 / 775; umask 027 → 640 / 750; umask 077 → 600 / 700.
- Trap: umask 023 → file **644**, not 643 — masking is not subtraction (directory 754).
- `umask` shows the current mask; `umask 077` sets it for the session (permanently in ~/.bashrc or /etc/profile).
- ⭐ **PYQ 2023**: "Default permission for a text file?" → **rw- r-- r--**.

### Special bits
| Bit | Octal | Shown as | Effect | Example |
|---|---|---|---|---|
| **SUID** | 4000 | `s` in the user x place | Program runs with the **owner's** privileges | `/usr/bin/passwd` `-rwsr-xr-x` (4755) |
| **SGID** | 2000 | `s` in the group x place | Runs with the group's privileges; on a directory, new files inherit the directory's group | 2755 → `rwxr-sr-x` |
| **Sticky** | 1000 | `t` in the others x place | In a directory, only a file's owner (or root) may delete/rename it | `/tmp` `drwxrwxrwt` (1777) |

A capital `S` or `T` means the special bit is set but the underlying x is not (4644 → `rwSr--r--`).

## 6. Processes
| Command | Purpose | Example |
|---|---|---|
| `ps` | Snapshot of processes | `ps`; `ps -ef`; `ps aux` |
| `top` / `htop` | Live, sorted view of processes, CPU and memory | `top` (q quits) |
| `kill PID` | Send a signal; default **SIGTERM (15)** — polite terminate | `kill 1234` |
| `kill -9 PID` | **SIGKILL** — cannot be caught or ignored | `kill -9 1234` |
| `killall` / `pkill` | Kill by name | `pkill firefox` |
| `cmd &` | Run in the **background** | `sleep 100 &` |
| `jobs` | List jobs of this shell | `jobs` |
| `bg %n` / `fg %n` | Resume job in background / bring to foreground | `fg %1` |
| `Ctrl+Z` / `Ctrl+C` | Stop (suspend, SIGTSTP) / interrupt (SIGINT) the foreground job | |
| `nohup cmd &` | Keep running after logout (ignores SIGHUP); output to nohup.out | `nohup ./backup.sh &` |
| `nice -n 10 cmd` | Start with a niceness: **−20 = highest priority, 19 = lowest**, default 0 | `nice -n 19 make` |
| `renice` | Change niceness of a running process | `renice 5 -p 1234` |
| `pgrep`, `pstree` | Find PID by name; show the process tree | `pstree` |

PID 1 is **init** (today **systemd**), the ancestor of all user processes. `kill -l` lists signals.

## 7. System information and administration
| Command | Purpose |
|---|---|
| `uname -a` | Kernel name, release, machine (`-r` release only) |
| `whoami` | Current user name |
| `who` / `w` | Logged-in users (w also shows what they run) |
| `id` | UID, GID and groups |
| `date` / `cal` | Date and time / calendar (`cal 2026`) |
| `df -h` | **Free space per file system** (disk free); `df -T` shows types |
| `du -sh dir` | **Disk usage** of files/directories |
| `free -h` | RAM and swap usage |
| `uptime` | Time since boot, users, load average |
| `history` | Previous commands; `!!` repeats last; `!n` runs number n |
| `man ls` | Manual page (sections: 1 user commands, 2 system calls, 3 library functions, 5 file formats, 8 admin); `man -k` = apropos; `ls --help` |
| `clear` | Clear the screen (Ctrl+L) |
| `sudo cmd` | Run one command as root (rules in /etc/sudoers, edit with `visudo`) |
| `su -` | Switch user (to root by default) with a login shell |
| `passwd` | Change password (stored hashed in /etc/shadow) |
| `useradd`/`adduser`, `usermod`, `userdel`, `groupadd` | Manage accounts (/etc/passwd has 7 colon-separated fields) |
| `shutdown -h now`, `reboot` | Power off / restart |
| `systemctl start/stop/status/enable nginx` | Manage services under systemd |
| `crontab -e` | Schedule repeating jobs (min hour day month weekday) |

## 8. Archives and compression
| Command | Purpose | Example |
|---|---|---|
| `tar` | Bundle files into one archive (tape archive) | `tar -cvf a.tar dir` create; `tar -xvf a.tar` extract; `tar -tvf` list |
| `tar` + gzip | Compressed archive | `tar -czvf a.tar.gz dir`; `tar -xzvf a.tar.gz -C /tmp` |
| `gzip` | Compress, **replacing** f with f.gz | `gzip f` |
| `gunzip` | Decompress (= `gzip -d`) | `gunzip f.gz` |
| `zip` / `unzip` | Windows-compatible archive | `zip -r a.zip dir` |
| `bzip2`, `xz` | Better compression (tar -j / -J) | `xz f` |

tar flags: **c** create, **x** extract, **t** list, **v** verbose, **f** archive file name, **z** gzip, **j** bzip2, **J** xz.

## 9. Networking
| Command | Purpose | Example |
|---|---|---|
| `ping` | Test reachability (ICMP echo) | `ping -c 4 google.com` |
| `ifconfig` / `ip` | Show/configure interfaces (`ifconfig` is old net-tools) | `ip addr`, `ip route` |
| `netstat` / `ss` | Sockets, listening ports | `ss -tulpn` |
| `ssh` | Secure remote login (port 22) | `ssh ravi@10.0.0.5` |
| `scp` | Secure copy over SSH | `scp f ravi@host:/tmp/` |
| `wget` | Non-interactive download | `wget https://x/file.iso` |
| `curl` | Transfer data to/from a URL (APIs) | `curl -O https://x/f` |
| `traceroute`, `nslookup`, `dig`, `hostname` | Route, DNS lookup, host name | `dig example.com` |

## 10. Package managers
| Family | Low level | High level | Examples |
|---|---|---|---|
| Debian/Ubuntu | `dpkg -i pkg.deb` | `apt` / `apt-get` | `sudo apt update`; `sudo apt install vim`; `apt remove`; `apt upgrade` |
| RHEL/Fedora/CentOS | `rpm -ivh pkg.rpm`, `rpm -qa` | `yum` (older), **`dnf`** (Fedora, RHEL 8+) | `sudo dnf install httpd` |
| Arch / openSUSE | — | `pacman -S`, `zypper in` | |

## 11. Text processing
| Command | Purpose | Example |
|---|---|---|
| `sort` | Sort lines (`-n` numeric, `-r` reverse, `-k2` by field 2, `-u` unique, `-t:` delimiter) | `sort -n marks.txt` |
| `uniq` | Remove **adjacent** duplicate lines (so sort first); `-c` count, `-d` duplicates only | `sort f \| uniq -c` |
| `cut` | Cut columns/fields | `cut -d: -f1 /etc/passwd`; `cut -c1-5 f` |
| `tr` | Translate or delete characters (reads stdin) | `tr 'a-z' 'A-Z' < f` (change case); `tr -d '0-9'` |
| `sed` | **Stream editor** — find/replace, delete lines | `sed 's/old/new/g' f`; `sed -i` in place; `sed '3d' f` |
| `awk` | Pattern scanning and field processing (Aho, Weinberger, Kernighan) | `awk -F: '{print $1}' /etc/passwd`; `awk '$3 > 50' f` |
| `diff`, `cmp`, `comm` | Compare files | `diff a b` |
| `tee` | Write to a file **and** the screen | `ls \| tee list.txt` |
| `xargs` | Build command lines from input | `find . -name "*.o" \| xargs rm` |

## 12. Redirection, pipes, wildcards, chaining
Standard streams: **0 = stdin**, **1 = stdout**, **2 = stderr**.

| Symbol | Meaning | Example |
|---|---|---|
| `>` | Redirect stdout, **overwrite** | `ls > list.txt` |
| `>>` | Redirect stdout, **append** | `date >> log.txt` |
| `<` | Take stdin from a file | `wc -l < f` |
| `2>` | Redirect **errors** | `find / -name x 2> /dev/null` |
| `2>&1` | Send stderr where stdout goes | `make > out.txt 2>&1` |
| `&>` | stdout **and** stderr (bash) | `cmd &> all.txt` |
| `<<` | Here-document | `cat << EOF` |
| `\|` | **Pipe**: stdout of left → stdin of right | `ps aux \| grep ssh` |

### Wildcards (globbing) ⭐
| Pattern | Matches | Example |
|---|---|---|
| `*` | Any string, including empty | `rm doc*` → doc, doc1, docs.txt, document |
| `?` | Exactly one character | `ls file?.txt` → file1.txt, fileA.txt |
| `[abc]` / `[a-z]` | One character from the set/range | `ls [ab]*` |
| `[!abc]` / `[^abc]` | One character **not** in the set | `ls [!0-9]*` |
| `{a,b}` | Brace expansion (not a glob, but similar use) | `mkdir {jan,feb,mar}` |

- The **shell** expands the pattern **before** the command runs; `rm` only sees the list of names.
- ⭐ **PYQ 2023**: `rm doc*` → **erases all files beginning with "doc"** in the current directory. `*doc` would match names **ending** in doc; listing would need `ls`, not `rm`.
- `*` does not match hidden names starting with `.`; `rm doc*` does not remove a directory named `docs` (needs -r). If nothing matches, bash passes `doc*` literally and rm reports "No such file or directory".

### Command chaining
| Operator | Runs the second command… | Example |
|---|---|---|
| `;` | Always, one after another | `cd /tmp; ls` |
| `&&` | Only if the first **succeeds** (exit status 0) | `mkdir d && cd d` |
| `\|\|` | Only if the first **fails** | `cd d \|\| echo "no dir"` |
| `&` | First runs in the background | `cmd1 & cmd2` |

Command substitution: `$(date)` or `` `date` ``; arithmetic: `$((5 + 3))`.

## 13. vi / vim basics
vi (Bill Joy, 1976); **vim** = "Vi IMproved" (Bram Moolenaar, 1991). Other editors: nano, emacs, ed.

| Mode | Enter with | Purpose |
|---|---|---|
| **Command (normal)** | Default at start; **Esc** | Move, delete, copy, paste |
| **Insert** | `i` (before cursor), `a` (after), `o` (new line below), `I`, `A`, `O` | Type text |
| **Ex / last-line** | `:` from command mode | Save, quit, search-replace |

| Command | Action |
|---|---|
| `:w` | Save (write) |
| `:q` | Quit (fails if unsaved changes) |
| `:wq`, `:x`, `ZZ` | Save and quit |
| `:q!` | **Quit without saving** |
| `dd`, `yy`, `p` | Delete line, copy (yank) line, paste |
| `x`, `u`, `Ctrl+R` | Delete character, undo, redo |
| `/word`, `n` | Search, next match |
| `:%s/old/new/g` | Replace in the whole file |
| `gg`, `G`, `:set nu` | First line, last line, show line numbers |

## 14. Shell scripting basics
```bash
#!/bin/bash
# greet.sh — prints arguments
name=$1
echo "Hello $name, you passed $# arguments"
if [ $# -eq 0 ]; then
    echo "No arguments"; exit 1
fi
for f in *.txt; do
    echo "File: $f"
done
echo "Last status: $?"
```
- **Shebang** `#!/bin/bash` (first line) tells the kernel which interpreter to use. Run with `chmod +x greet.sh` then `./greet.sh ravi`, or `bash greet.sh ravi`.
- `#` starts a comment; `read var` reads input; `echo` prints.
- **Special variables**: `$0` script name; `$1`…`$9` positional arguments (`${10}` beyond); **`$#`** number of arguments; `$@` / `$*` all arguments; **`$?`** exit status of the last command (**0 = success**); `$$` PID of the shell; `$!` PID of the last background job.
- Tests `[ ]`: numbers `-eq -ne -lt -le -gt -ge`; strings `= != -z (empty) -n (non-empty)`; files `-e exists, -f regular file, -d directory, -r -w -x`.
- Control: `if … then … elif … else … fi`; `for … in …; do … done`; `while …; do … done`; `case … in … esac`.
- `source file` (or `. file`) runs a script in the **current** shell.

## 15. File system type and mounting
- **Default Linux file system ⭐ = ext4** (fourth extended; journaling, extents). Others: ext2, ext3, XFS (RHEL default), Btrfs, plus vfat/FAT32, NTFS and ISO 9660 support; **swap** is a separate partition or file.
- Devices: `/dev/sda` (first SATA/SCSI disk), `/dev/sda1` (its first partition), `/dev/nvme0n1p1` (NVMe).
- `mkfs.ext4 /dev/sdb1` — create a file system; `fsck` — check and repair.
- `mount /dev/sdb1 /mnt/usb` (`-t ext4` to give the type); **`umount /mnt/usb`** (no "n").
- `/etc/fstab` — file systems mounted automatically at boot; `/proc/mounts` — currently mounted.
- `lsblk`, `blkid`, `df -T` — list block devices, UUIDs, and file-system types.

## 16. Important files in /etc ⭐
| File | Holds |
|---|---|
| `/etc/passwd` | One line per user account: name:x:UID:GID:comment:home:shell (7 fields); readable by all |
| `/etc/shadow` | **Hashed passwords** and password-ageing data; readable only by root |
| `/etc/group` | Groups and their members |
| `/etc/fstab` | File systems to mount at boot |
| `/etc/hosts` | Static host-name → IP mappings |
| `/etc/hostname` | The machine's name |
| `/etc/resolv.conf` | DNS servers |
| `/etc/sudoers` | Who may use sudo (edit with `visudo`) |
| `/etc/crontab` | System-wide scheduled jobs |
| `/etc/shells` | List of valid login shells |
| `/etc/profile`, `/etc/bash.bashrc` | System-wide shell start-up settings |
| `/etc/os-release` | Distribution name and version |

## 17. "Which command…?" — MCQ quick map
| Task asked in the question | Answer |
|---|---|
| Search a pattern inside files | `grep` ⭐ |
| Find files by name in the directory tree | `find` (fast: `locate`) |
| Delete a file | `rm` ⭐ |
| Delete an empty directory / a full directory | `rmdir` ⭐ / `rm -r` |
| Change permissions / owner / group | `chmod` ⭐ / `chown` / `chgrp` |
| Set default permissions for new files | `umask` ⭐ |
| Change lower case to upper case | `tr 'a-z' 'A-Z'` |
| Cut columns or fields | `cut` |
| Send one command's output to another | pipe `\|` |
| Count lines, words, characters | `wc` |
| Show current directory | `pwd` |
| Show current user / logged-in users | `whoami` / `who` |
| Show running processes / end one | `ps`, `top` / `kill` |
| Show disk free space / usage of a folder | `df` / `du` |
| Show memory usage | `free` |
| Show the manual of a command | `man` |
| Create an empty file | `touch` |
| Rename a file | `mv` |
| Join (concatenate) and display files | `cat` |
| Compare two files line by line | `diff` |
| Bundle files into one archive | `tar` |
| Run a command as superuser | `sudo` |
| Change your password | `passwd` |
| Print text / a variable | `echo` |
| Show the path of a command | `which` |
| Attach / detach a file system | `mount` / `umount` |

---

## Exam traps
1. `rmdir` removes only **empty** directories; to delete a directory with contents use **`rm -r`**. "Delete", "Erase", "Rdir" are not Linux commands.
2. `rm` deletes; it never lists. `rm doc*` = names **starting** with doc; `*doc` = names **ending** with doc.
3. chmod's arguments are **permission change + file names**; changing the owner is **chown**.
4. Default text file permission is **rw-r--r-- (644)**, not rwxr--r--; files never get x by default.
5. umask is **masked**, not subtracted: umask 023 gives file 644, not 643.
6. **`/etc`** = configuration; **`/tmp`** = temporary files (not /usr); **`/root`** is root's home, **`/`** is the root directory.
7. bash prompt is **`$`** for normal users; **`#`** is root; **`%`** is csh/zsh.
8. "Alpha cell", "lsh", "gsh" are not shells; tcsh, dash and fish are real.
9. grep searches **inside** files for patterns; `find` searches for **files** by name/attributes; `tr` changes case; `cut` cuts columns.
10. `kill` alone sends SIGTERM (15); only `kill -9` (SIGKILL) cannot be caught.
11. `>` overwrites, `>>` appends; `2>` redirects errors only.
12. `uniq` removes only **adjacent** duplicates; `:q!` quits vi **without** saving.

## One-liners for revision
1. UNIX: Thompson and Ritchie, Bell Labs, 1969; rewritten in C in 1973.
2. Linux kernel: Linus Torvalds, 1991, GPL.
3. Shell = command interpreter between user and kernel.
4. Everything is a file, including devices and processes (/proc).
5. `/` is the root directory; `/root` is the root user's home.
6. `/etc` holds configuration files ⭐.
7. `/bin` holds essential command binaries; `/sbin` system admin binaries.
8. `/dev` holds device files.
9. `/tmp` holds temporary files; `/var` holds logs and spools.
10. `/usr` holds user programs, libraries and documentation.
11. `/home` has users' home directories; `/boot` has the kernel and GRUB.
12. `/proc` is a virtual file system of process and kernel information.
13. `~` home, `.` current, `..` parent directory.
14. Bash = Bourne-Again shell, the default Linux shell.
15. sh Bourne, csh C shell (Bill Joy), ksh Korn, zsh macOS default.
16. Prompt: `$` user, `#` root, `%` C shell ⭐.
17. `echo $SHELL` shows the login shell.
18. PATH lists directories searched for commands.
19. `pwd` prints the current directory.
20. `ls -a` shows hidden files; `ls -l` long listing.
21. `rm` deletes files ⭐; `rm -r` deletes directories recursively.
22. `rmdir` deletes empty directories ⭐.
23. `mkdir -p a/b/c` creates parents.
24. `mv` both moves and renames.
25. `ln -s` makes a symbolic link; `ln` a hard link.
26. `head`/`tail` show 10 lines by default; `tail -f` follows.
27. `wc -l` counts lines.
28. grep prints lines matching a pattern ⭐; `-i` ignore case, `-v` invert, `-c` count.
29. `find` searches the directory tree; `locate` uses a database.
30. r = 4, w = 2, x = 1.
31. chmod takes permission change + file names ⭐.
32. `chmod u+x f` adds execute for the owner.
33. 755 = rwxr-xr-x; 644 = rw-r--r--; 700 = rwx------.
34. umask 022 → file 644, directory 755 ⭐.
35. SUID 4, SGID 2, sticky 1; /tmp is 1777.
36. `chown` changes owner; `chgrp` changes group.
37. `ps` lists processes; `top` shows them live.
38. `kill -9` force-kills a process.
39. `&` runs in background; `fg`/`bg` move jobs.
40. `df` = disk free per file system; `du` = disk usage of files.
41. `tar -czvf` creates a gzip archive; `tar -xzvf` extracts it.
42. `apt` for Debian/Ubuntu; `yum`/`dnf`/`rpm` for Red Hat family.
43. `|` pipes output to the next command ⭐.
44. `*` any string, `?` one character, `[ ]` one of a set ⭐.
45. Default Linux file system: ext4 ⭐; `umount` unmounts.

## Quick self-check
1. What does `grep -c "error" app.log` print? — **The number of lines containing "error".**
2. Command to delete an empty directory `old`? — **`rmdir old`** (`rm -r old` if it has contents).
3. What does `rm doc*` do? — **Deletes every file in the current directory whose name begins with "doc".**
4. The two arguments of chmod? — **The permission change and the file name(s).**
5. Octal of `rwxr-x---`? — **750.**
6. umask 022: permissions of a new file and new directory? — **644 (rw-r--r--) and 755 (rwxr-xr-x).**
7. umask 077: new file? — **600 (rw-------).**
8. Default bash prompt for a normal user and for root? — **`$` and `#`.**
9. Which directory holds configuration files? — **/etc.**
10. Is "Alpha cell" a Linux shell? — **No; Bourne, C, Korn, bash, zsh, tcsh, fish are.**
11. What does `chmod go-w report.txt` do? — **Removes write permission from group and others.**
12. In a script, what are `$#` and `$?`? — **Number of arguments; exit status of the last command (0 = success).**
