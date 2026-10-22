# Review log — questions_b.json (OS set B, 100 questions)

Reviewer: independent OS examiner / Linux administrator check, 2026-10-22.

## Method
- Every question solved independently before reading the key.
- Re-simulated by script: fit allocation (Q4–6), paging bits / frames / page-table size (Q9–11), TLB EAT (Q12), segmentation (Q13), page-fault EAT (Q18), FIFO/LRU/Optimal fault counts and hit ratio (Q19–26, Q28 Belady string), working set (Q30), inode max size (Q41), bit vector (Q42), disk access time (Q46), FCFS/SSTF/LOOK/SCAN/C-SCAN/C-LOOK head movement including the alternative figures quoted in explanations (Q47–52), permission/umask conversions using mode & ~umask (Q75–80), bash arithmetic (Q100).
- Linux items checked against GNU coreutils / bash behaviour (rmdir has no -f, mkdir has no -r/-a, grep -v/-c/-n/-i/-l, tar -xzvf, redirection, ? and * globbing, &&, $#, $?, shebang, prompts, /etc /sbin /proc /var /boot, ext4 default phrased "most distributions").
- Theory checked against Silberschatz–Galvin (VCB contents, boot control block, file attributes, tape/disk access models, acyclic-graph directories, FAT, indexed allocation, NTFS, SSTF pros/cons, RAID 5).

## Result
- All 100 answer keys are correct; no key changed.
- Exactly one defensible option in every item; no duplicates found.
- Answer positions unchanged: A 25, B 25, C 25, D 25.

## Changes

| Q | Problem | Fix |
|---|---|---|
| 79 | Explanation described umask as subtraction (666 − 022); umask is a bit mask (mode & ~umask). Result happens to agree, but the method misleads for other masks. | Explanation reworded to "mode AND NOT umask": 666 masked by 022 = 644. Key unchanged. |
| 80 | Explanation stated "666 − 027 = 640", which is arithmetically false (octal 666 − 027 = 637); the correct 640 comes only from masking. | Explanation rewritten with masking (777 & ~027 = 750, 666 & ~027 = 640 `rw-r-----`) and an explicit note that it is a bit mask, not subtraction. Key unchanged. |
| 82 | Explanation said only the file's owner or root can delete in a sticky directory; the directory's owner can too. | Added "the directory's owner". Key unchanged. |
| 88 | Explanation implied `*log` matches every name ending in `log`; `*` does not match a leading dot, so hidden files are skipped. | Added the hidden-file caveat to the explanation. Key unchanged. |
