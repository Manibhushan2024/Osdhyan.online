# Review log: questions_lower.json (Q1-Q100)

Independent review on 2026-10-22. I solved every question before checking its key. Every numerical was recomputed with a Python script: mesh links and ports, propagation delay, throughput, bandwidth-delay product, header overhead, period, wavelength, baud rate, Nyquist, Shannon, dB, TDM, bit stuffing, Hamming distance, Hamming r, CRC, GBN/SR windows, Stop-and-Wait utilisation, ALOHA, CSMA/CD minimum frame, Ethernet frame sizes and the MAC multicast bit. Facts were checked against Forouzan, Tanenbaum and IEEE 802.

Result: all 100 answer keys are correct, so no answer_index was changed. No question has two correct options except Q65, and there are no duplicates. No question in this file asks for "the layer that sends a bit stream", so the wrong 2023 key does not apply here. Q27 and Q29 both teach correctly that the physical layer handles the bit stream. Answer positions are still 25/25/25/25.

| Q | Problem | Fix |
|---|---|---|
| 65 | Distractor "RG-11" can also be defended as correct. Forouzan's table lists RG-11 for thick Ethernet, but real RG-11 is a 75-ohm cable that is also used in cable TV. | Replaced RG-11 with RG-62 (93 ohm, ARCnet). Rewrote the explanation, with a note on why RG-11 is not offered. Key unchanged (RG-59). |
| 19 | The explanation said 1.8 and 18 Mbps came from "dividing by the wrong time unit", which is inaccurate. | Explanation now says these come from misplacing the power of ten instead of dividing the bits per minute by 60. Key unchanged (3 Mbps). |
| 83 | The CRC working jumped from 0001 to 1000 without showing the two steps where the quotient bit is 0. | Added the steps (0010, 0100, then 1000) and noted that 10110101 divides by 1101 with remainder 0. Key unchanged. |

JSON validated: 100 items.
