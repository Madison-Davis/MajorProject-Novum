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

var NOVUM_PAUL_MISSIONS = (function () {
  'use strict';

  function place(title, country, lat, lon, approximate) {
    return { title: title, country: country, lat: lat, lon: lon, approximate: Boolean(approximate) };
  }

  function stop(site, passage, note) {
    return { site: site, passage: 'Acts ' + passage, note: note };
  }

  // Rounded coordinates adapted from OpenBible.info Bible Geocoding (CC BY 4.0).
  var sites = {
    antioch: place('Antioch in Syria', 'Turkey', 36.202, 36.162),
    seleucia: place('Seleucia Pieria', 'Turkey', 36.111, 35.927),
    salamis: place('Salamis', 'Cyprus', 35.177, 33.908),
    paphos: place('Paphos', 'Cyprus', 34.754, 32.400),
    perga: place('Perga', 'Turkey', 37.005, 30.905),
    pisidianAntioch: place('Antioch in Pisidia', 'Turkey', 38.316, 31.179),
    iconium: place('Iconium', 'Turkey', 37.884, 32.494),
    lystra: place('Lystra', 'Turkey', 37.578, 32.453),
    derbe: place('Derbe', 'Turkey', 37.351, 33.271),
    attalia: place('Attalia', 'Turkey', 36.881, 30.695),
    cilicia: place('Cilicia', 'Turkey', 36.918, 34.892, true),
    galatia: place('Galatia', 'Turkey', 38.407, 32.376, true),
    phrygia: place('Phrygia', 'Turkey', 38.514, 30.223, true),
    troas: place('Troas', 'Turkey', 39.507, 26.081),
    samothrace: place('Samothrace', 'Greece', 40.467, 25.486),
    neapolis: place('Neapolis', 'Greece', 40.944, 24.418),
    philippi: place('Philippi', 'Greece', 41.012, 24.286),
    amphipolis: place('Amphipolis', 'Greece', 40.823, 23.839),
    apollonia: place('Apollonia', 'Greece', 40.588, 23.353, true),
    thessalonica: place('Thessalonica', 'Greece', 40.632, 22.932),
    berea: place('Berea', 'Greece', 40.517, 22.200),
    athens: place('Athens', 'Greece', 37.983, 23.733),
    corinth: place('Corinth', 'Greece', 37.906, 22.878),
    cenchreae: place('Cenchreae', 'Greece', 37.885, 22.993),
    ephesus: place('Ephesus', 'Turkey', 37.953, 27.368),
    caesarea: place('Caesarea Maritima', 'Israel', 32.500, 34.892),
    jerusalem: place('Jerusalem', 'Israel', 31.777, 35.235),
    macedonia: place('Macedonia', 'Greece', 40.803, 22.666, true),
    achaia: place('Achaia', 'Greece', 37.906, 22.878, true),
    assos: place('Assos', 'Turkey', 39.490, 26.336),
    mitylene: place('Mitylene', 'Greece', 39.100, 26.552),
    chios: place('Off Chios', 'Greece', 38.390, 26.220, true),
    samos: place('Samos', 'Greece', 37.715, 26.934),
    miletus: place('Miletus', 'Turkey', 37.530, 27.278),
    cos: place('Cos (Kos)', 'Greece', 36.805, 27.090),
    rhodes: place('Rhodes', 'Greece', 36.442, 28.227),
    patara: place('Patara', 'Turkey', 36.275, 29.319),
    tyre: place('Tyre', 'Lebanon', 33.276, 35.193),
    ptolemais: place('Ptolemais (Acre)', 'Israel', 32.928, 35.082),
    sidon: place('Sidon', 'Lebanon', 33.563, 35.366),
    myra: place('Myra', 'Turkey', 36.231, 30.011),
    cnidus: place('Off Cnidus', 'Turkey', 36.685, 27.340, true),
    salmone: place('Off Salmone', 'Greece', 35.212, 26.310, true),
    fairHavens: place('Fair Havens', 'Greece', 34.921, 24.731),
    cauda: place('Off Cauda (Gavdos)', 'Greece', 34.830, 24.092, true),
    malta: place('Malta', 'Malta', 35.853, 14.532, true),
    syracuse: place('Syracuse', 'Italy', 37.068, 15.295),
    rhegium: place('Rhegium (Reggio Calabria)', 'Italy', 38.112, 15.643),
    puteoli: place('Puteoli (Pozzuoli)', 'Italy', 40.836, 14.268),
    forumOfAppius: place('Forum of Appius', 'Italy', 41.469, 12.994),
    threeTaverns: place('Three Taverns', 'Italy', 41.591, 12.829, true),
    rome: place('Rome', 'Italy', 41.900, 12.483)
  };

  var missions = [
    {
      label: 'First mission', years: 'c. 47–48 CE', passage: 'Acts 13–14',
      companions: 'Barnabas and John Mark',
      stops: [
        stop('antioch', '13:1–3', 'The Antioch church commissions Barnabas and Saul for their work.'),
        stop('seleucia', '13:4', 'Barnabas and Saul go down to the port of Seleucia and sail for Cyprus.'),
        stop('salamis', '13:5', 'They proclaim their message in the synagogues. John Mark assists them.'),
        stop('paphos', '13:6–12', 'Paul confronts Elymas, who opposes their message. The proconsul Sergius Paulus believes.'),
        stop('perga', '13:13', 'The group arrives in Pamphylia. John Mark leaves and returns to Jerusalem.'),
        stop('pisidianAntioch', '13:14–52', 'Paul addresses the synagogue. Interest grows over two Sabbaths, and local opposition eventually drives the missionaries out.'),
        stop('iconium', '14:1–7', 'Many believe after hearing them in the synagogue. The city divides, and the missionaries leave after learning of a plot against them.'),
        stop('lystra', '14:8–20', 'Paul heals a man unable to walk. The crowd mistakes Barnabas and Paul for Zeus and Hermes. Later, opponents stone Paul and leave him outside the city.'),
        stop('derbe', '14:20–21', 'Paul and Barnabas proclaim the message and gain many disciples before turning back.'),
        stop('lystra', '14:21–23', 'On the way back, they strengthen the disciples and appoint elders in the churches.'),
        stop('iconium', '14:21–23', 'They return to encourage the disciples and appoint elders.'),
        stop('pisidianAntioch', '14:21–24', 'They revisit the disciples before traveling through Pisidia into Pamphylia.'),
        stop('perga', '14:24–25', 'On the return leg, they preach in Perga before going down to Attalia.'),
        stop('attalia', '14:25–26', 'They depart from this Pamphylian port for Antioch.'),
        stop('antioch', '14:26–28', 'Back at their sending church, they report what happened on the journey and stay with the disciples.')
      ]
    },
    {
      label: 'Second mission', years: 'c. 49–52 CE', passage: 'Acts 15:22–18:22',
      companions: 'Silas and Timothy',
      stops: [
        stop('antioch', '15:22–41', 'Judas Barsabbas and Silas bring the Jerusalem council’s letter to Antioch. Barnabas and Mark sail for Cyprus, while Paul sets out with Silas.'),
        stop('cilicia', '15:40–41', 'Paul and Silas strengthen churches through Syria and Cilicia. Acts gives a regional itinerary here.'),
        stop('derbe', '16:1–5', 'Paul and Silas revisit Derbe and continue to Lystra.'),
        stop('lystra', '16:1–5', 'Timothy joins them. Paul has him circumcised because of local concerns, and the party shares the Jerusalem council’s decisions.'),
        stop('phrygia', '16:6–8', 'The party travels through the Phrygian and Galatian region and passes by Mysia before reaching Troas.'),
        stop('troas', '16:8–10', 'Paul has a vision of a man from Macedonia asking for help. The group decides to cross the Aegean.'),
        stop('samothrace', '16:11', 'Acts names the island on the sea crossing from Troas to Macedonia.'),
        stop('neapolis', '16:11–12', 'The group lands at Neapolis and continues inland to Philippi.'),
        stop('philippi', '16:12–40', 'Lydia and her household are baptized. Paul and Silas are jailed after Paul confronts a spirit of divination. An earthquake shakes the prison, the jailer believes, and the magistrates release them.'),
        stop('amphipolis', '17:1', 'The party passes through Amphipolis on the road to Thessalonica.'),
        stop('apollonia', '17:1', 'Acts names Apollonia as another stop on the road to Thessalonica.'),
        stop('thessalonica', '17:1–9', 'Paul speaks in the synagogue over three Sabbaths. A crowd attacks Jason’s house, and the city officials require security from Jason and others.'),
        stop('berea', '17:10–15', 'Listeners examine the Scriptures. After opposition follows from Thessalonica, Paul leaves for Athens while Silas and Timothy remain temporarily.'),
        stop('athens', '17:16–34', 'Paul speaks at the Areopagus about the God his audience calls unknown. Some dismiss his message, while Dionysius, Damaris, and others believe.'),
        stop('corinth', '18:1–17', 'Paul meets Priscilla and Aquila and stays for eighteen months. The proconsul Gallio declines to hear a dispute against him.'),
        stop('cenchreae', '18:18', 'Paul has his hair cut in connection with a vow, then sails with Priscilla and Aquila.'),
        stop('ephesus', '18:19–21', 'Paul speaks briefly in the synagogue and leaves Priscilla and Aquila in Ephesus.'),
        stop('caesarea', '18:22', 'Paul lands at Caesarea and goes up to greet the church.'),
        stop('jerusalem', '18:22', 'Jerusalem is the usual reading of the phrase “went up and greeted the church” in this verse.'),
        stop('antioch', '18:22', 'Paul returns to Antioch before setting out again.')
      ]
    },
    {
      label: 'Third mission', years: 'c. 53–58 CE', passage: 'Acts 18:23–21:17',
      companions: 'Timothy, Erastus, and other companions',
      stops: [
        stop('antioch', '18:22–23', 'After spending time in Antioch, Paul sets out on another journey.'),
        stop('galatia', '18:23', 'Paul travels through Galatia, strengthening disciples. Acts gives a region here without naming individual towns.'),
        stop('phrygia', '18:23', 'Paul continues through Phrygia to strengthen the churches.'),
        stop('ephesus', '18:24–19:41', 'Priscilla and Aquila instruct Apollos before Paul arrives. Paul teaches in the hall of Tyrannus for two years. Later the silversmith Demetrius incites a disturbance over the Artemis shrine trade.'),
        stop('macedonia', '20:1–2', 'Paul leaves Ephesus and encourages believers as he travels through Macedonia.'),
        stop('achaia', '20:2–3', 'Paul spends three months in Greece. The map uses Corinth as a reference point for Achaia.'),
        stop('macedonia', '20:3–5', 'Paul changes plans after hearing of a plot and returns through Macedonia. Acts names several companions on this leg.'),
        stop('philippi', '20:5–6', 'The traveling party leaves Philippi after the festival of Unleavened Bread and reaches Troas five days later.'),
        stop('troas', '20:6–12', 'The group stays for seven days. Eutychus falls from a window during Paul’s long talk and is brought back alive.'),
        stop('assos', '20:13–14', 'Paul goes overland to Assos and joins the others aboard their ship.'),
        stop('mitylene', '20:14', 'The ship takes Paul and his companions to Mitylene on Lesbos.'),
        stop('chios', '20:15', 'Acts places the party opposite Chios. The pin is an approximate offshore waypoint.'),
        stop('samos', '20:15', 'The party touches at Samos on the way to Miletus.'),
        stop('miletus', '20:15–38', 'Hoping to reach Jerusalem by Pentecost, Paul bypasses Ephesus and summons its elders to Miletus for a farewell.'),
        stop('cos', '21:1', 'The ship sails from Miletus to Cos.'),
        stop('rhodes', '21:1', 'Rhodes is the next stop after Cos.'),
        stop('patara', '21:1–2', 'The group changes ships at Patara and takes a vessel bound for Phoenicia.'),
        stop('tyre', '21:3–6', 'The ship passes Cyprus and unloads at Tyre. The group stays seven days with disciples who warn Paul about going to Jerusalem.'),
        stop('ptolemais', '21:7', 'They greet the believers at Ptolemais and stay one day.'),
        stop('caesarea', '21:8–14', 'They stay with Philip the evangelist. Agabus warns that Paul will be bound in Jerusalem.'),
        stop('jerusalem', '21:15–17', 'Paul and his companions travel inland and are welcomed in Jerusalem.')
      ]
    },
    {
      label: 'Voyage to Rome', years: 'c. 59–60 CE', passage: 'Acts 27:1–28:16', voyage: true,
      companions: 'Julius and Aristarchus',
      description: 'Paul travels under Roman guard after appealing to Caesar. After a shipwreck and a winter on Malta, he reaches Rome.',
      stops: [
        stop('caesarea', '27:1–2', 'After appealing to Caesar, Paul leaves Caesarea in the custody of the Roman centurion Julius. Aristarchus travels with him.'),
        stop('sidon', '27:3', 'Julius allows Paul to visit his friends while the ship stops at Sidon.'),
        stop('myra', '27:4–6', 'After sailing past Cyprus and along the coast, the party transfers at Myra to an Alexandrian ship bound for Italy.'),
        stop('cnidus', '27:7', 'The ship reaches the waters off Cnidus after making slow progress against the wind.'),
        stop('salmone', '27:7–8', 'The ship sails into the shelter of Crete off Salmone and follows the island’s coast.'),
        stop('fairHavens', '27:8–13', 'Paul warns against sailing farther so late in the season. The crew sets out hoping to winter at Phoenix.'),
        stop('cauda', '27:14–20', 'A storm drives the ship past Cauda. In the island’s shelter the crew secures the small boat before being driven out to sea.'),
        stop('malta', '27:39–28:11', 'The ship breaks up near Malta, and everyone reaches shore. The party stays three months before sailing again. Acts names the island without identifying the exact wreck site.'),
        stop('syracuse', '28:12', 'The party puts in at Syracuse in Sicily and stays three days.'),
        stop('rhegium', '28:13', 'They reach Rhegium at the southern tip of Italy. A south wind then carries them north.'),
        stop('puteoli', '28:13–14', 'They land at Puteoli and spend a week with believers before continuing toward Rome.'),
        stop('forumOfAppius', '28:15', 'Believers from Rome come out along the Appian Way to meet Paul.'),
        stop('threeTaverns', '28:15', 'Acts names Three Taverns as another meeting point on the approach to Rome.'),
        stop('rome', '28:16–31', 'Paul arrives under guard. Acts closes with him receiving visitors and teaching for two years from his rented lodging.')
      ]
    }
  ];

  var letters = [
    { label: 'First mission association', items: [
      ['Galatians', 'Churches in Galatia, Turkey']
    ] },
    { label: 'Second mission association', items: [
      ['1 Thessalonians', 'Church in Thessalonica, Greece'],
      ['2 Thessalonians', 'Church in Thessalonica, Greece']
    ] },
    { label: 'Third mission association', items: [
      ['1 Corinthians', 'Church in Corinth, Greece'],
      ['2 Corinthians', 'Church in Corinth, Greece'],
      ['Romans', 'Believers in Rome, Italy']
    ] },
    { label: 'Imprisonment traditions', items: [
      ['Ephesians', 'Believers associated with Ephesus, Turkey'],
      ['Philippians', 'Church in Philippi, Greece'],
      ['Colossians', 'Church in Colossae, Turkey'],
      ['Philemon', 'Philemon and his household in Colossae, Turkey']
    ] },
    { label: 'Traditionally placed after Acts', items: [
      ['1 Timothy', 'Timothy in Ephesus, Turkey'],
      ['Titus', 'Titus in Crete, Greece'],
      ['2 Timothy', 'Timothy, traditionally associated with Ephesus, Turkey']
    ] }
  ];

  return { sites: sites, missions: missions, letters: letters };
})();
