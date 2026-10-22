# Review log: questions_upper.json (Q1-Q100)

Date: 2026-10-22. I solved every question independently before checking its key. I recomputed every subnetting/addressing item (Q1-Q15, Q20, Q21, Q24) with Python `ipaddress`. I also scripted these checks: cwnd growth (Q43), the ACK number (Q44), the Caesar shifts (Q70), 3DES key sizes (Q73), key counts (Q74), the port range (Q51), MD5/SHA-1 digest sizes (Q76) and GEO/LEO propagation delays (Q98).

Result: all 100 keys are correct. No key was changed, and no stem was ambiguous. No question was duplicated, and no question had duplicate options. Each answer position (A/B/C/D) is still used 25 times.

| Q | Problem | Fix |
|---|---|---|
| 82 | Option B called ARPANET "the first packet-switched network". That is disputable, because the NPL network in the UK was built at the same time. | Option B now reads "An early packet-switched network, funded by the US DoD in 1969". The explanation adds that ARPANET was the first wide-area packet-switched network. The key (B) is unchanged. |
| 98 | The explanation called the LEO (~10 ms) and GEO (~250 ms) figures "round-trip delay". Those figures are actually the one-hop ground-to-satellite-to-ground delays: GEO about 239 ms by calculation, and a question plus its reply takes about 0.5 s. | The explanation now says "ground-to-satellite-to-ground delay" (LEO 5-10 ms, GEO about 250 ms) and adds that a question and its reply take about 0.5 s. The key is unchanged. |
| 99 | The explanation gave "a Wi-Fi router" as an example of a fixed-and-wireless device. That is not Schiller's example and could mislead students. | The example is now Schiller's: desktop PCs on a wireless LAN in a historic building where cabling is not allowed. The key is unchanged. |
