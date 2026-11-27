var NOVUM_BOOK_DISCOVERIES = (function () {
  'use strict';

  var archive = 'https://www.deadseascrolls.org.il/explore-the-archive';
  var judeanSites = ['Israel Antiquities Authority · Discovery sites', 'https://www.deadseascrolls.org.il/learn-about-the-scrolls/discovery-sites?locale=en_US'];
  var sinaiHistory = ['Codex Sinaiticus Project · History', 'https://www.codexsinaiticus.org/en/codex/history.aspx'];
  var sinaiDate = ['Codex Sinaiticus Project · Dating', 'https://codexsinaiticus.org/en/codex/date.aspx'];
  var judeanDates = ['Israel Antiquities Authority · Dating periods', 'https://www.deadseascrolls.org.il/learn-about-the-scrolls/historical-timeline'];
  var featuredScrolls = ['Israel Antiquities Authority · Dated scrolls', 'https://www.deadseascrolls.org.il/featured-scrolls/?locale=en_US'];
  var heverDate = ['Excavation team · Dating the Greek Twelve Prophets scroll', 'https://brill.com/view/journals/text/31/1-2/article-p159_8.pdf'];
  var gospels = ['Matthew', 'Mark', 'Luke', 'John'];
  var newTestament = gospels.concat([
    'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
    '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ]);

  // Coordinates identify sites or site groups at globe scale.
  var sites = {
    sinai: { title: "St. Catherine’s Monastery", region: 'Sinai, Egypt', lat: 28.556, lon: 33.976 },
    cairo: { title: 'Ben Ezra Synagogue', region: 'Old Cairo, Egypt', lat: 30.006, lon: 31.231 },
    oxyrhynchus: { title: 'Oxyrhynchus', region: 'El-Bahnasa, Egypt', lat: 28.532, lon: 30.653 },
    dura: { title: 'Dura-Europos', region: 'Syria', lat: 34.749, lon: 40.728 },
    qumran: { title: 'Qumran', region: 'Judean Desert', lat: 31.741, lon: 35.459 },
    murabbaat: { title: 'Wadi Murabba’at', region: 'Judean Desert', lat: 31.593, lon: 35.367 },
    hever: { title: 'Nahal Hever', region: 'Judean Desert', lat: 31.429, lon: 35.377 },
    masada: { title: 'Masada', region: 'Judean Desert', lat: 31.316, lon: 35.354 },
    enGedi: { title: 'En-Gedi ancient synagogue', region: 'Dead Sea, Israel', lat: 31.460, lon: 35.389 },
    ketef: { title: 'Ketef Hinnom', region: 'Jerusalem', lat: 31.768, lon: 35.225 }
  };

  // Periods estimate when the artifact was made. Negative years are BCE.
  var records = [
    {
      site: 'sinai', discovery: '1844', type: 'Library identification',
      title: 'Codex Sinaiticus · Leipzig leaves', period: [301, 400], age: '4th century CE',
      books: ['1 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Tobit', 'Jeremiah', 'Lamentations'],
      note: 'Monks showed Konstantin von Tischendorf part of a Greek Bible. The leaves now at Leipzig include Esther and parts of 2 Esdras, the Greek form of Ezra–Nehemiah. A 1761 visitor may have seen the same codex.',
      sources: [sinaiHistory, sinaiDate, ['British Library · Contents and provenance', 'https://searcharchives.bl.uk/catalog/032-002169711']]
    },
    {
      site: 'sinai', discovery: '1859', type: 'Library identification',
      title: 'Codex Sinaiticus · Main portion', period: [301, 400], age: '4th century CE',
      books: newTestament.concat(['Judith', '1 Maccabees', '4 Maccabees', 'Wisdom', 'Sirach']),
      note: 'Tischendorf was shown the main surviving portion at the monastery. It preserves all 27 New Testament books and substantial parts of the Greek Old Testament. The Greek codex also contains Barnabas and the Shepherd of Hermas.',
      sources: [sinaiHistory, sinaiDate, ['Codex Sinaiticus Project · Contents', 'https://codexsinaiticus.org/en/codex/content.aspx']]
    },
    {
      site: 'sinai', discovery: '1892', type: 'Library identification',
      title: 'Sinaitic Syriac palimpsest', period: [301, 500], age: '4th–5th century CE (Gospel undertext)',
      books: gospels,
      note: 'Agnes Smith Lewis and Margaret Dunlop Gibson photographed a reused parchment manuscript whose earlier writing preserves an Old Syriac translation of the four Gospels.',
      sources: [['Agnes Smith Lewis · Edition and discovery account', 'https://www.cis.rit.edu/~rlepci/StC/Lewis_1910_Syriac_Gospels_OCR.pdf'], ['Gorgias Encyclopedic Dictionary of the Syriac Heritage · Dating', 'https://dev.gedsh.bethmardutho.org/Old-Syriac-Version.html']]
    },
    {
      site: 'cairo', discovery: '1896–1897', type: 'Genizah recovery',
      title: 'Cairo Genizah biblical manuscripts', period: [901, 1200], age: '10th–12th century CE (medieval witnesses)',
      books: ['Numbers', 'Nehemiah', 'Sirach'],
      note: 'A Hebrew leaf of Sirach (Ben Sira) was identified in 1896, prompting the major recovery from the synagogue’s storeroom. The collection also includes Nehemiah and Numbers fragments as well as additional medieval witnesses to Sirach.',
      sources: [['Cambridge University Library · Discovery and objects', 'https://exhibitions.lib.cam.ac.uk/discardedhistory/case/discovery/'], ['A. Jordan Schmidt · Dates of the Hebrew Sirach manuscripts', 'https://api.pageplace.de/preview/DT0400.9783110600223_A37185475/preview-9783110600223_A37185475.pdf']]
    },
    {
      site: 'cairo', discovery: '1896–1897 recovery', type: 'Genizah recovery',
      title: 'Cairo Genizah · Greek Kings palimpsest', period: [501, 600], age: '6th century CE (Greek undertext)',
      books: ['1 Kings', '2 Kings'],
      note: 'Reused parchment from the Ben Ezra Synagogue’s storeroom preserves parts of Aquila’s Greek translation of Kings underneath a later Hebrew text.',
      sources: [['Greek Bible in Byzantine Judaism · Kings palimpsest', 'https://gbbj.org/manuscripts/manuscripts_12.html'], ['Princeton Geniza Project · T-S 20.50', 'https://geniza.princeton.edu/en/documents/42298/']]
    },
    {
      site: 'oxyrhynchus', discovery: '1897', type: 'Excavated',
      title: 'Papyrus 1 · Matthew 1', period: [201, 300], age: '3rd century CE',
      books: ['Matthew'],
      note: 'The first Oxyrhynchus excavation season yielded a Greek papyrus leaf preserving parts of Matthew 1. It is catalogued as P.Oxy. I 2 and Penn Museum E2746. This is one example from the much larger Oxyrhynchus corpus.',
      sources: [['Penn Museum · Papyrus E2746', 'https://collections.penn.museum/collections/object/254486'], ['University of Oxford · First-season excavation report', 'https://oxyrhynchus.web.ox.ac.uk/introduction']]
    },
    {
      site: 'oxyrhynchus', discovery: 'Published in 1899', type: 'Excavated',
      title: 'Papyrus 5 · John 1 and 20', period: [201, 300], age: '3rd century CE',
      books: ['John'],
      note: 'Grenfell and Hunt published P.Oxy. II 208, a Greek papyrus from Oxyrhynchus with portions of John 1 and 20.',
      sources: [['British Library · Papyrus 782', 'https://searcharchives.bl.uk/catalog/040-002105171']]
    },
    {
      discovery: '1930 acquisition', type: 'Findspot unknown',
      title: 'Chester Beatty Biblical Papyri', period: [101, 300], age: '2nd–3rd century CE (indexed papyri)',
      books: gospels.concat(['Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', 'Hebrews', 'Revelation', 'Numbers', 'Deuteronomy']),
      note: 'These Greek biblical papyri came through Egyptian dealers. The findspot and recovery date are undocumented.',
      sources: [['Chester Beatty · Biblical manuscripts', 'https://chesterbeatty.ie/assets/uploads/2018/11/The-Word-of-God-Biblical-Manuscripts.pdf'], ['Chester Beatty · Editions and catalogues', 'https://chesterbeatty.ie/collections/research-services/reference-resources/online-catalogues/']]
    },
    {
      site: 'dura', discovery: '1933', type: 'Excavated · Gospel harmony',
      title: 'Dura Parchment 24', period: [175, 256], age: 'Late 2nd to mid-3rd century CE (estimated)',
      books: gospels,
      note: 'A Greek parchment fragment excavated near the Palmyra Gate combines Gospel material about the death and burial of Jesus. Its identification with Tatian’s Diatessaron is debated.',
      sources: [['Journal of Theological Studies · Fragment and excavation context', 'https://doi.org/10.1093/jts/flab039']]
    },
    {
      site: 'qumran', discovery: '1947', type: 'Reported cave find',
      title: 'Qumran Cave 1 · First scrolls', period: [-125, -1], age: 'Late 2nd–1st century BCE (grouped finds)',
      books: ['Isaiah', 'Habakkuk'],
      note: 'The first group found by Bedouin included two Isaiah scrolls and a commentary that quotes passages from Habakkuk. Archaeologists excavated the cave in 1949.',
      sources: [judeanSites, ['Israel Museum · Dates of the Isaiah and Habakkuk scrolls', 'https://museum.imj.org.il/pdf/dss-english.pdf']]
    },
    {
      discovery: 'Early 1950s (approx.)', type: 'Findspot disputed',
      title: 'Bodmer biblical papyri', period: [175, 400], age: 'Late 2nd–4th century CE (dating debated)',
      books: ['Luke', 'John'],
      note: 'The indexed papyri P66 and P75 preserve substantial portions of Luke and John between them. Their palaeographic dates are debated. Scholars have proposed a discovery near Dishna in Upper Egypt, but the exact findspot and the group’s original extent remain uncertain.',
      sources: [['Daniel B. Sharp and Brent Nongbri · Provenance study', 'https://eprints.gla.ac.uk/274555/1/274555.pdf'], ['Brent Nongbri · Dating P75', 'https://brentnongbri.com/wp-content/uploads/2020/01/nongbri-pbodmer-xiv-xv-jbl-2016-offprint.pdf'], ['Brent Nongbri · Dating P66', 'https://www.e-periodica.ch/cntmng?bot=1&pid=mhl-001%3A2014%3A71%3A%3A139']]
    },
    {
      site: 'qumran', discovery: '1952', type: 'Reported cave find',
      title: 'Qumran Cave 2 · Torah fragments', period: [-165, 68], age: 'Late Second Temple period (grouped finds)',
      books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Jeremiah', 'Psalms'],
      note: 'Bedouin found badly damaged fragments of all five books of the Torah, as well as Jeremiah and Psalms.',
      sources: [judeanSites, judeanDates]
    },
    {
      site: 'qumran', discovery: '1952', type: 'Cave finds and excavation',
      title: 'Qumran Cave 4 · Biblical scrolls', period: [-250, 68], age: 'Mid-3rd century BCE–1st century CE (grouped finds)',
      books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
        '1 Samuel', '2 Samuel', '1 Kings', '2 Chronicles', 'Ezra', 'Job', 'Psalms', 'Proverbs',
        'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
        'Hosea', 'Malachi'],
      note: 'The largest Qumran manuscript assemblage includes fragments of the Torah, historical books, poetry and prophets. Examples include 4Q117 (Ezra), 4Q118 (2 Chronicles), 4Q79 (Hosea) and 4Q76 (which preserves parts of Malachi).',
      sources: [judeanSites, judeanDates, featuredScrolls, ['Israel Antiquities Authority · Catalogue (browse by site)', archive], ['Pieter B. Hartog · The Twelve at Qumran', 'https://www.pthu.nl/over-pthu/organisatie/medewerkers/p.b.hartog/downloads/pb-hartog-reading-and-copying-the-twelve-2.pdf']]
    },
    {
      site: 'qumran', discovery: '1952', type: 'Excavated',
      title: 'Qumran Cave 5 · Deuteronomy', period: [-165, 68], age: 'Late Second Temple period (broad estimate)',
      books: ['Deuteronomy'],
      note: 'Archaeologists discovered and excavated Cave 5. The biblical fragments include a Hebrew copy of Deuteronomy catalogued as 5Q1.',
      sources: [judeanSites, judeanDates, ['Israel Antiquities Authority · 5Q1 Deuteronomy', archive + '/manuscript/5Q1-1']]
    },
    {
      site: 'murabbaat', discovery: '1952 excavation', type: 'Excavated',
      title: 'Wadi Murabba’at · Biblical fragments', period: [1, 73], age: '1st century CE (early Roman period)',
      books: ['Deuteronomy'],
      note: 'Following Bedouin finds in 1951, archaeologists excavated four caves in 1952. The archive catalogues MUR 2 as a Hebrew Deuteronomy manuscript. A separate cave yielded the Minor Prophets scroll in 1955.',
      sources: [judeanSites, ['Israel Antiquities Authority · MUR 2', archive + '/manuscript/MUR2-1']]
    },
    {
      site: 'qumran', discovery: '1955', type: 'Excavated',
      title: 'Qumran Caves 7 and 8 · Biblical fragments', period: [-100, 68], age: '1st century BCE–1st century CE (grouped finds)',
      books: ['Exodus', 'Genesis', 'Psalms'],
      note: 'Cave 7 yielded a Greek Exodus fragment. Cave 8 yielded fragments of Genesis and Psalms.',
      sources: [judeanSites, judeanDates]
    },
    {
      site: 'murabbaat', discovery: '1955', type: 'Reported cave find',
      title: 'Wadi Murabba’at · Hebrew Twelve Prophets', period: [75, 125], age: 'Late 1st–early 2nd century CE',
      books: ['Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah'],
      note: 'A shepherd found MUR 88 in a fifth cave. The scroll preserves parts of the Hebrew Book of the Twelve.',
      sources: [judeanSites, ['Israel Antiquities Authority · MUR 88', archive + '/manuscript/MUR88-1'], ['Pieter B. Hartog · Dating the Twelve Prophets scrolls', 'https://www.pthu.nl/over-pthu/organisatie/medewerkers/p.b.hartog/downloads/pb-hartog-reading-and-copying-the-twelve-2.pdf'], ['Journal of Hebrew Scriptures · Surviving passages', 'https://jhsonline.org/index.php/jhs/article/download/5642/4695/12674']]
    },
    {
      site: 'qumran', discovery: '1956', type: 'Reported cave find',
      title: 'Qumran Cave 11 · Leviticus, Psalms and Job', period: [-50, 68], age: 'Late 1st century BCE–1st century CE (grouped finds)',
      books: ['Leviticus', 'Psalms', 'Job'],
      note: 'The cave yielded substantial parts of a Leviticus scroll in paleo-Hebrew script, a Psalms scroll and an Aramaic translation of Job.',
      sources: [judeanSites, featuredScrolls]
    },
    {
      site: 'hever', discovery: '1961 excavation', type: 'Excavated',
      title: 'Nahal Hever · Greek Twelve Prophets', period: [-50, 50], age: 'Late 1st century BCE–early 1st century CE (estimated)',
      books: ['Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Zechariah'],
      note: 'Excavations in the Cave of Horror recovered fragments of a Greek Twelve Prophets scroll. Related fragments had reached scholars through dealers in the 1950s. Further pieces were announced in 2021.',
      sources: [judeanSites, heverDate, ['Israel Antiquities Authority · 8HevXIIgr', archive + '/manuscript/8Hev1-1']]
    },
    {
      site: 'masada', discovery: '1963–1965 excavation', type: 'Excavated',
      title: 'Masada biblical scrolls', period: [-100, 73], age: '1st century BCE–1st century CE (grouped finds)',
      books: ['Genesis', 'Leviticus', 'Deuteronomy', 'Ezekiel', 'Psalms', 'Sirach'],
      note: 'Scrolls from the fortress include pieces of Genesis, Leviticus, Deuteronomy, Ezekiel and Psalms, and a Hebrew witness to Sirach.',
      sources: [judeanSites, judeanDates]
    },
    {
      site: 'enGedi', discovery: '1970', type: 'Excavated',
      title: 'En-Gedi Leviticus scroll', period: [201, 400], age: '3rd–4th century CE (radiocarbon)',
      books: ['Leviticus'],
      note: 'A charred scroll was excavated from the ancient synagogue. Virtual unwrapping revealed the opening of Leviticus. The timeline uses the radiocarbon estimate. An estimate based on handwriting puts the scroll in the 1st or 2nd century CE.',
      sources: [['University of Kentucky · Excavation and virtual unwrapping', 'https://www2.cs.uky.edu/dri/the-scroll-from-en-gedi/'], ['Seales and colleagues · Reading and dating the scroll', 'https://doi.org/10.1126/sciadv.1601247']]
    },
    {
      site: 'sinai', discovery: '1975', type: 'Monastery recovery',
      title: 'Codex Sinaiticus · New Finds', period: [301, 400], age: '4th century CE',
      books: ['Genesis', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', '1 Chronicles'],
      note: 'Additional leaves and fragments were found at the monastery, including parts of biblical books missing from the portions known in the nineteenth century.',
      sources: [sinaiHistory, sinaiDate, ['Codex Sinaiticus Project · Reconstruction of the New Finds', 'https://www.codexsinaiticus.org/en/project/transcription_reconstructing.aspx']]
    },
    {
      site: 'ketef', discovery: '1979', type: 'Excavated · Inscription',
      title: 'Ketef Hinnom silver amulets', period: [-650, -575], age: 'Late 7th–early 6th century BCE',
      books: ['Numbers'],
      note: 'Two rolled silver amulets from a burial cave preserve wording close to the priestly blessing in Numbers 6:24–26.',
      sources: [['Excavator’s edition and evaluation · BASOR', 'https://www.journals.uchicago.edu/doi/10.2307/4150106']]
    },
    {
      site: 'hever', discovery: '2021 announcement', type: 'Excavated',
      title: 'Cave of Horror · Additional Greek fragments', period: [-50, 50], age: 'Late 1st century BCE–early 1st century CE (estimated)',
      books: ['Nahum', 'Zechariah'],
      note: 'The Israel Antiquities Authority announced additional Greek parchment fragments preserving lines from Nahum and Zechariah. The pieces belong to the Twelve Prophets scroll from Nahal Hever.',
      sources: [heverDate, ['Excavation team · New Zechariah fragment in Textus', 'https://doi.org/10.1163/2589255X-bja10019'], ['Israel Antiquities Authority · Discovery announcement', 'https://www.youtube.com/watch?v=y1Aty1O-j_A']]
    }
  ];

  return { sites: sites, records: records };
})();

var data = { countries: [], connections: {} };
