# Review log — questions_a.json + questions_b.json (200 items)

Reviewer: independent Hindi examiner pass, 2026-10-29. The whole 155-item bank from `gen/hindi.json` was read item by item before re-keying; the 45 new items were written and checked against standard grammar references (कामताप्रसाद गुरु, वासुदेवनंदन प्रसाद, NCERT). Then a seeded random sample of 60 (Python `random.Random(60)`) was answered blind and compared with the key.

## Result
- Items: 200 = 155 re-keyed from `gen/hindi.json` + 45 new (questions_a: hin_vyakaran 54, hin_shuddhi 46; questions_b: hin_shabd 53, hin_sahitya 47)
- Random 60 re-checked: **60/60 keys correct — keys changed: 0**
- Whole-bank pass: no wrong keys found; **13 items fixed** for ambiguous distractors, an ambiguous stem or a copied PYQ (table below)
- Answer balance: each file A 25 / B 25 / C 25 / D 25; new items placed to fill gaps, and 2 existing items had the correct option moved to another position (explanations never cite option numbers, so nothing else changed)
- Validation: valid UTF-8 JSON; every item has exactly 4 distinct options with `en` = `hi` (Hindi text), `question_en` = `question_hi`, non-empty `explanation_hi` and `explanation_en`; no duplicate stems; no stem copied from the 80 Hindi PYQs; 6 गद्यांश sets (3 old, 3 new × 5) with the passage after the prefix "गद्यांश:"
- Format: fields as `ga/questions_static_a.json` + `question_hi`, `options[{en, hi}]`, `explanation_hi`; the old `expected` flag was replaced by `pyq_concept` (153 items test a concept asked in 2023–24)

## Fixes to the existing bank (gen/hindi.json index → change → reason)
| gen # | Topic | Change |
|---|---|---|
| 12 | समास | stem ''पीतांबर' शब्द में कौन-सा समास है?' -> ''पीतांबर' (पीत है अंबर जिसका — अर्थात् श्रीकृष्ण) में कौन-सा समास है?' (without the vigraha, 'peela vastra' makes it karmadharaya as well) |
| 23 | समास | stem ''नरोत्तम' शब्द में कौन-सा समास है?' -> ''वनवास' शब्द में कौन-सा समास है?' ('narottam' is keyed variously as adhikaran/sambandh/karmadharaya in standard books; replaced with an unambiguous adhikaran tatpurush example) |
| 25 | उपसर्ग–प्रत्यय | options अभि / अभ्य / अ / आ -> अभि / अभ्य / अ / अप |
| 26 | उपसर्ग–प्रत्यय | options न / नि / निर् / निः -> न / नि / निर् / नी |
| 50 | विलोम | options अकृतज्ञ / विज्ञ / अज्ञ / कृतघ्न -> कृतार्थ / विज्ञ / अज्ञ / कृतघ्न |
| 56 | विलोम | options गतिशील / अस्थिर / चल / जंगम -> स्थूल / स्थायी / जड़ / जंगम |
| 58 | विलोम | options प्रतिलोम / अलोम / सुलोम / विलोम -> प्रतिलोम / अलोम / सुलोम / अवलोम |
| 59 | विलोम | options सरल / वक्र / कुटिल / तिर्यक -> सरल / वक्र / सुगम / मृदु |
| 62 | अनेक शब्दों के लिए एक शब्द | options अद्भुत / अनुपम / उपमेय / अतुल -> अद्भुत / अनुपम / उपमेय / अनुरूप |
| 69 | अनेक शब्दों के लिए एक शब्द | options आलोचक / निंदक / दोषदर्शी / छिद्रान्वेषी -> आलोचक / निंदक / परोपकारी / छिद्रान्वेषी |
| 70 | अनेक शब्दों के लिए एक शब्द | options अभूतपूर्व / अपूर्व / अनोखा / भूतपूर्व -> अभूतपूर्व / अनादि / अनोखा / भूतपूर्व |
| 71 | अनेक शब्दों के लिए एक शब्द | options आशातीत / अप्रत्याशित / अनपेक्षित / निराश -> आशातीत / अप्रत्याशित / आशावादी / निराश |
| 73 | अलंकार | stem ''पीपर पात सरिस मन डोला' — इस पंक्ति में कौन-सा अलंकार है?' -> ''हरि पद कोमल कमल से' — इस पंक्ति में कौन-सा अलंकार है?' (old stem 'पीपर पात सरिस मन डोला' was a verbatim copy of a 2023 PYQ) |

Reasons for the option fixes: 25 अभ्यागत = अभि + आ + गत, so "आ" was a second correct prefix; 26 निः and निर् are the same prefix; 50 अकृतज्ञ is also an antonym of कृतज्ञ; 56 गतिशील/अस्थिर/चल are all opposites of स्थावर; 58 विलोम also means reverse (अनुलोम-विलोम); 59 कुटिल and तिर्यक are listed opposites of ऋजु; 62 अतुल ≈ अनुपम; 69 दोषदर्शी also fits; 70 अपूर्व also means unprecedented; 71 अनपेक्षित also means unexpected.

## Answer positions moved (balance only)
- gen#93: correct option moved from B to C
- gen#124: correct option moved from B to D

## The 60 re-checked items (file + 0-based index, key) — all confirmed
| item | subtopic | key |
|---|---|---|
| a2 | संधि | D — इति + आदि — यण संधि |
| a5 | संधि | C — विसर्ग संधि |
| a10 | संधि | D — अयादि संधि |
| a11 | संधि | B — उत् + लेख |
| a12 | संधि | A — निः + रस |
| a16 | समास | B — कर्मधारय |
| a22 | समास | D — अव्ययीभाव |
| a23 | समास | A — कर्म तत्पुरुष |
| a24 | समास | D — अधिकरण तत्पुरुष |
| a27 | उपसर्ग–प्रत्यय | A — अभि |
| a31 | उपसर्ग–प्रत्यय | A — आवट |
| a32 | उपसर्ग–प्रत्यय | D — आलु |
| a33 | उपसर्ग–प्रत्यय | D — तद्धित प्रत्यय |
| a38 | लिंग–वचन–कारक | D — चाय |
| a39 | लिंग–वचन–कारक | B — विदुषी |
| a42 | लिंग–वचन–कारक | A — नदियाँ |
| a47 | लिंग–वचन–कारक | D — करण |
| a50 | संज्ञा–सर्वनाम–विशेषण–क्रिया | D — भाववाचक संज्ञा |
| a52 | संज्ञा–सर्वनाम–विशेषण–क्रिया | C — परिमाणवाचक विशेषण |
| a56 | वर्तनी | C — अत्यधिक |
| a58 | वर्तनी | D — सौंदर्य |
| a61 | वर्तनी | B — अनधिकार |
| a65 | वर्तनी | C — अंत्याक्षरी |
| a67 | वाक्य शुद्धि | B — मुझे घर जाना है। |
| a70 | वाक्य शुद्धि | C — मेरा दही खट्टा है। |
| a72 | वाक्य शुद्धि | A — प्रत्येक व्यक्ति को अपना कर्तव्य निभाना चाहिए। |
| a75 | वाक्य शुद्धि | A — राम श्याम से अधिक बुद्धिमान है। |
| a77 | वाक्य शुद्धि | B — आप कल आइएगा। |
| a78 | वाक्य शुद्धि | B — देश में अनेक समस्याएँ हैं। |
| a81 | वाक्य-विन्यास (पदक्रम) | A — हर रविवार को मेरे पिताजी बाज़ार से ताज़ी सब्ज़ियाँ लाते हैं। |
| a85 | तत्सम–तद्भव | B — हस्त |
| a93 | तत्सम–तद्भव | C — ओष्ठ |
| a96 | तत्सम–तद्भव | C — आम्र |
| a99 | देशज–विदेशज | A — मेज़ |
| b5 | पर्यायवाची | C — कानन |
| b19 | विलोम | D — लिखित |
| b23 | विलोम | B — वक्र |
| b26 | अनेक शब्दों के लिए एक शब्द | B — अनुपम |
| b28 | अनेक शब्दों के लिए एक शब्द | A — अतिथि |
| b31 | अनेक शब्दों के लिए एक शब्द | B — अजातशत्रु |
| b34 | अनेक शब्दों के लिए एक शब्द | A — अभूतपूर्व |
| b39 | मुहावरे–लोकोक्तियाँ | D — आवश्यकता से बहुत कम वस्तु मिलना |
| b42 | मुहावरे–लोकोक्तियाँ | C — मूर्खों के बीच थोड़ा जानने वाला भी श्रेष्ठ माना जाता है |
| b44 | मुहावरे–लोकोक्तियाँ | A — कठिन कार्य |
| b45 | मुहावरे–लोकोक्तियाँ | B — गागर में सागर भरना – व्यर्थ परिश्रम करना |
| b47 | मुहावरे–लोकोक्तियाँ | D — अपनी अयोग्यता का दोष दूसरों पर डालना |
| b48 | मुहावरे–लोकोक्तियाँ | D — जल में रहकर मगर से बैर |
| b50 | अनेकार्थी शब्द | D — आकाश और वस्त्र |
| b52 | रिक्त स्थान (शब्द चयन) | C — नियमित |
| b53 | अलंकार | A — अनुप्रास |
| b59 | अलंकार | C — अतिशयोक्ति |
| b60 | अलंकार | C — मानो |
| b63 | अलंकार | C — यमक |
| b70 | छंद | A — सोरठा |
| b72 | गद्यांश | B — पुस्तकों का महत्त्व बना हुआ है, केवल रूप बदला है |
| b73 | गद्यांश | C — विपन्न |
| b75 | गद्यांश | A — पुस्तकें: हमारी सच्ची मित्र |
| b83 | गद्यांश | D — परि |
| b96 | गद्यांश | A — उसमें भरी देशभक्ति की भावना के कारण |
| b99 | गद्यांश | B — प्रेमचंद: गाँव के यथार्थ के कथाकार |

## Notes for the owner
- PYQ qid 630680256592 (1929 passage, 25 Jun 2023 S2): the official key is option 2, but the passage supports option 4 ("जनता की आर्थिक स्थिति सुदृढ़ हुई"); it is flagged `key_doubt` in `done_lang.json` and left as the official answer in `hindi_pyq_analysis.json`.
- `hindi/hindi_pyq_analysis.json` is a copy made with the same logic as `scripts/content/make-section-a-pyq.py`; the builder reads `dsssb/hindi_pyq_analysis.json`, so run that script (it writes outside this folder) before `build-subject-pack.py hindi`. With the pack rules the 80 PYQs map 15 / 15 / 25 / 25 to hin_vyakaran / hin_shuddhi / hin_shabd / hin_sahitya.
