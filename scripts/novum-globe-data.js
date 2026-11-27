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

var NOVUM_JESUS_JOURNEY = (function () {
  'use strict';

  function place(title, country, lat, lon, approximate) {
    return { title: title, country: country, lat: lat, lon: lon, approximate: Boolean(approximate) };
  }

  function event(site, title, passages, note, analysis, comparisonOnly) {
    return { site: site && 'jesus_' + site, title: title, passages: passages.split(' | '), note: note, analysis: analysis, comparisonOnly: comparisonOnly };
  }

  // Regional anchors and disputed identifications are marked approximate.
  var locations = {
    jerusalem: place('Jerusalem', 'Judea', 31.778, 35.235),
    nazareth: place('Nazareth', 'Galilee', 32.707, 35.302),
    bethlehem: place('Bethlehem', 'Judea', 31.705, 35.210),
    egypt: place('Egypt', 'Eastern Nile Delta', 30.108, 31.338, true),
    jordan: place('Jordan River', 'Lower Jordan Valley', 31.836, 35.552, true),
    jordanBethany: place('Bethany beyond the Jordan', 'Jordan Valley', 31.838, 35.550, true),
    cana: place('Cana', 'Galilee', 32.747, 35.339, true),
    capernaum: place('Capernaum', 'Galilee', 32.881, 35.575),
    sychar: place('Sychar', 'Samaria', 32.203, 35.312, true),
    aenon: place('Aenon near Salim', 'Jordan Valley', 32.399, 35.544, true),
    galilee: place('Galilee', 'Regional reference point', 32.814, 35.454, true),
    lake: place('Sea of Galilee', 'Galilee', 32.807, 35.589, true),
    eastShore: place('East shore of the Sea of Galilee', 'Lake region', 32.825, 35.652, true),
    gennesaret: place('Gennesaret', 'Galilee', 32.859, 35.510, true),
    bethsaida: place('Bethsaida', 'Northern shore of the Sea of Galilee', 32.908, 35.627, true),
    nain: place('Nain', 'Galilee', 32.631, 35.348),
    tyre: place('Region of Tyre', 'Phoenicia', 33.276, 35.193, true),
    caesarea: place('Caesarea Philippi', 'Northern Galilee region', 33.248, 35.695),
    jericho: place('Jericho', 'Judea', 31.871, 35.444),
    bethany: place('Bethany', 'Near Jerusalem', 31.772, 35.262),
    ephraim: place('Ephraim', 'Judea', 31.954, 35.299, true),
    olives: place('Mount of Olives', 'Jerusalem', 31.778, 35.247),
    gethsemane: place('Gethsemane', 'Jerusalem', 31.780, 35.240, true),
    golgotha: place('Golgotha and nearby tomb', 'Jerusalem', 31.778, 35.230, true)
  };
  var sites = {};
  locations.lake.water = true;
  Object.keys(locations).forEach(function (id) { sites['jesus_' + id] = locations[id]; });

  var missions = [
    {
      label: 'Birth and early life', shortLabel: 'Early life', passage: 'Matthew 1–2 · Luke 1–2',
      description: 'Matthew and Luke preserve distinct infancy accounts. Their own sequences are identified where the accounts diverge.',
      stops: [
        event(null, 'Jesus’ genealogies', 'Matthew 1:1–17 | Luke 3:23–38', 'Matthew traces Jesus’ family from Abraham through David. Luke presents a different line and traces it back to Adam.', 'Matthew’s opening emphasizes David and Abraham, while Luke places the genealogy after Jesus’ baptism and extends it to the whole human family.'),
        event('jerusalem', 'Gabriel appears to Zechariah', 'Luke 1:5–25', 'An angel tells Zechariah at the temple that Elizabeth will have a son named John.', 'Luke begins in the temple with a priest who cannot speak. Zechariah’s restored voice later turns that silence into public testimony.'),
        event('nazareth', 'Gabriel appears to Mary', 'Luke 1:26–38 | Matthew 1:18–25', 'Luke places Gabriel’s announcement to Mary in Nazareth during Elizabeth’s sixth month. Matthew separately tells of the angel’s message to Joseph in a dream.', 'Luke gives Mary the announcement and a spoken response. Matthew presents the pregnancy through Joseph’s decision to receive Mary and name the child.'),
        event(null, 'Mary visits Elizabeth', 'Luke 1:39–56', 'Elizabeth greets Mary, and Mary praises God in the song known as the Magnificat. Luke names the Judean hill country and leaves the town unnamed.', 'Mary’s song describes God reversing the fortunes of the powerful and the lowly, a theme Luke returns to throughout the Gospel.'),
        event(null, 'John the Baptist is born', 'Luke 1:57–80', 'Elizabeth gives birth. Zechariah confirms the name John and speaks again. The family’s town is unnamed.', 'The naming breaks with family expectations, and Zechariah’s blessing places John’s future work within Israel’s hope for deliverance.'),
        event('bethlehem', 'Jesus is born in Bethlehem', 'Matthew 1:18–25 | Matthew 2:1 | Luke 2:1–7', 'Matthew reports the birth and names Bethlehem. Luke describes the journey from Nazareth and the newborn laid in a manger.', 'Bethlehem links both narratives to David. Matthew later develops the royal theme through the Magi, while Luke first gives attention to the child’s humble surroundings.'),
        event('bethlehem', 'The shepherds visit', 'Luke 2:8–20', 'Angels announce the birth to shepherds, who go to Bethlehem and find the child.', 'Luke makes ordinary shepherds the first people outside the family to spread the birth announcement.'),
        event(null, 'Jesus is circumcised and named', 'Luke 2:21', 'Luke dates the naming and circumcision to the eighth day and gives no separate location.', 'The paired acts of circumcision and naming place the child within Israel’s covenant and fulfill the name announced earlier.'),
        event('jerusalem', 'Presentation in the temple', 'Luke 2:22–38', 'Mary and Joseph bring Jesus to the temple. Simeon blesses the family, and Anna speaks about the child.', 'Simeon juxtaposes hope for Israel and the nations with a warning about opposition. Anna adds a second public witness in the temple.'),
        event('jerusalem', 'The Magi meet Herod', 'Matthew 2:1–8', 'The Magi ask about the newborn king. Herod sends them to Bethlehem. Matthew gives no timing relative to Luke’s presentation.', 'Matthew contrasts outsiders who seek the child with a ruler who regards the same news as a threat.'),
        event('bethlehem', 'The Magi visit Jesus', 'Matthew 2:9–12', 'The Magi find the child with Mary, offer gifts, and return another way.', 'The visitors’ homage and their decision to avoid Herod distinguish their response from his.'),
        event('egypt', 'Flight to Egypt', 'Matthew 2:13–18', 'Joseph takes Jesus and Mary to Egypt after a warning in a dream. Matthew gives no destination within Egypt.', 'Matthew’s citation of Hosea gives the flight and return an echo of Israel’s Exodus story.'),
        event('nazareth', 'The family settles in Nazareth', 'Matthew 2:19–23 | Luke 2:39–40', 'Matthew reaches Nazareth after the return from Egypt. Luke describes the family returning to Nazareth after completing the temple observances.', 'The two accounts converge on Nazareth by different narrative paths, so that shared destination is firmer than a combined travel schedule.'),
        event('jerusalem', 'Jesus at the temple at age twelve', 'Luke 2:41–52', 'During Passover, Mary and Joseph find Jesus listening to the teachers and asking questions.', 'The episode contrasts the parents’ anxiety with Jesus’ sense of obligation to his Father. Luke closes by emphasizing continued growth.')
      ]
    },
    {
      label: 'Baptism and early ministry', shortLabel: 'Early ministry', passage: 'Matthew 3–4 · Mark 1 · Luke 3–4 · John 1–4',
      description: 'The Synoptic Gospels recount the baptism and wilderness. John adds early encounters, Cana, a Passover in Jerusalem, and the return through Samaria.',
      stops: [
        event('jordan', 'John begins preaching', 'Matthew 3:1–12 | Mark 1:1–8 | Luke 3:1–18 | John 1:19–28', 'John calls for repentance and baptizes. Luke places the start of his ministry in Tiberius’s fifteenth year, often dated around 28–29 CE.', 'Luke supplies a political and priestly setting and gives concrete examples of repentance. John’s Gospel introduces the Baptist chiefly as a witness to Jesus.', ['John']),
        event('jordan', 'Jesus is baptized', 'Matthew 3:13–17 | Mark 1:9–11 | Luke 3:21–23 | John 1:29–34', 'The Synoptic accounts describe the baptism and the Spirit descending. John records the Baptist’s testimony about the Spirit. The pin marks the lower Jordan region.', 'Matthew, Mark, and Luke narrate the event itself. John presents the descending Spirit through the Baptist’s testimony, shifting the emphasis toward recognition and witness.', ['John']),
        event(null, 'Temptation in the wilderness', 'Matthew 4:1–11 | Mark 1:12–13 | Luke 4:1–13', 'Jesus spends forty days in the wilderness. Matthew and Luke recount three temptations in different orders. The wilderness site is unspecified.', 'Matthew ends on a mountain, while Luke ends in Jerusalem. The different endings fit important settings in each Gospel.'),
        event('jordanBethany', 'John questioned by messengers', 'John 1:19–28', 'Priests and Levites question John near Bethany beyond the Jordan. Its identification is approximate, and John gives no date relative to the wilderness account.', 'The questions ask John to define his status. His answers direct attention toward the one he says is already present.'),
        event('jordanBethany', 'John points out Jesus', 'John 1:29–34', 'The next day, John identifies Jesus and describes seeing the Spirit descend. The map follows John’s preceding location.', 'John frames the scene as testimony about how the Baptist came to recognize Jesus and why others should trust that recognition.'),
        event('jordanBethany', 'Andrew and Simon meet Jesus', 'John 1:35–42', 'Two of John’s disciples follow Jesus. Andrew brings his brother Simon, whom Jesus calls Cephas. John gives no new location for the encounter.', 'John presents discipleship spreading through personal testimony, with Andrew bringing Simon after deciding to follow Jesus himself.'),
        event(null, 'Philip and Nathanael', 'John 1:43–51', 'Jesus calls Philip, who introduces Nathanael. John names Philip’s hometown, Bethsaida, and leaves their exact meeting place unstated.', 'Philip’s invitation leads Nathanael from skepticism about Nazareth to a confession about Jesus.'),
        event('cana', 'Water becomes wine at Cana', 'John 2:1–11', 'At a wedding, Jesus turns water into wine. John calls this his first sign. The identification of Cana is debated.', 'John connects the sign to the disciples’ belief. The setting uses ordinary wedding hospitality to disclose something they had not yet seen.'),
        event('capernaum', 'A short stay in Capernaum', 'John 2:12', 'Jesus goes to Capernaum with his family and disciples and stays a few days.', 'The brief notice connects Cana to the Passover journey. John leaves this visit distinct from the longer Capernaum ministry emphasized elsewhere.'),
        event('jerusalem', 'Temple action at an early Passover', 'John 2:13–25', 'John places the disruption of commerce in the temple near the beginning of the ministry. The Synoptic Gospels place a comparable account in the final week.', 'John links the temple saying to Jesus’ body and resurrection. Its placement differs from the final-week sequence in the Synoptic Gospels.'),
        event('jerusalem', 'Nicodemus visits at night', 'John 3:1–21', 'Jesus and Nicodemus discuss being born from above and what it means to believe. The Jerusalem setting follows John’s preceding account.', 'Nicodemus takes the language of birth literally at first, giving John a way to unfold what spiritual birth means.'),
        event('aenon', 'Baptizing in Judea and at Aenon', 'John 3:22–36 | John 4:1–2', 'Jesus’ disciples baptize in Judea while John baptizes at Aenon near Salim. The pin represents John’s location, whose identification is debated.', 'The overlap shows two ministries operating at once. John responds to concern about Jesus’ growing following by affirming Jesus’ role.'),
        event('sychar', 'The Samaritan woman at the well', 'John 4:1–42', 'On the way to Galilee, Jesus speaks with a woman at Jacob’s well. She tells the town, and Jesus stays with the Samaritans.', 'The conversation moves from water to worship and then to testimony. The town hears first through the woman and later through Jesus directly.'),
        event('cana', 'Jesus heals an official’s son', 'John 4:43–54', 'In Cana, Jesus tells a royal official that his son in Capernaum will live. John identifies the healing as a sign.', 'The father acts on Jesus’ word before confirming the healing, making trust central to how John tells the sign.'),
        event(null, 'John is imprisoned', 'Matthew 4:12 | Mark 1:14–15 | Luke 3:19–20 | John 3:24', 'The Synoptic accounts report John’s arrest. John explicitly places the preceding baptizing episode before the imprisonment. No prison site is specified in these passages.', 'Matthew and Mark use the arrest to mark a transition into Jesus’ Galilean preaching. Luke reports the arrest before narrating the baptism.', ['John'])
      ]
    },
    {
      label: 'Ministry in Galilee', shortLabel: 'Galilee', passage: 'Matthew 4–18 · Mark 1–9 · Luke 4–9 · John 6',
      description: 'Teaching, healings, and journeys around Galilee and its neighboring regions. The Gospels arrange several episodes differently.',
      stops: [
        event('nazareth', 'Rejected in his hometown', 'Matthew 13:53–58 | Mark 6:1–6 | Luke 4:16–30', 'Luke opens the Galilean ministry with the synagogue episode in Nazareth. Matthew and Mark place the hometown rejection later.', 'Luke gives the hometown episode a programmatic role through Isaiah and examples of outsiders receiving help. Matthew and Mark emphasize unbelief.'),
        event('capernaum', 'Capernaum becomes a base', 'Matthew 4:12–17 | Luke 4:31', 'Matthew describes Jesus settling at Capernaum after John’s arrest. Luke recounts his teaching there.', 'Matthew reads the move through Isaiah’s image of light in Galilee. Luke introduces Capernaum through public teaching and healing.'),
        event('lake', 'Jesus calls the fishermen', 'Matthew 4:18–22 | Mark 1:16–20 | Luke 5:1–11', 'Simon and Andrew, James and John leave their fishing work. Luke includes a remarkable catch. John places Andrew and Simon’s first encounter with Jesus earlier in its own account.', 'Matthew and Mark stress the fishermen’s immediate response. Luke builds Simon’s call around recognition, fear, and reassurance after the catch.'),
        event('capernaum', 'Healing in the synagogue', 'Mark 1:21–28 | Luke 4:31–37', 'Jesus teaches in Capernaum’s synagogue and frees a man from an unclean spirit.', 'The action illustrates the authority the crowd has already noticed in Jesus’ teaching.'),
        event('capernaum', 'Peter’s mother-in-law and other healings', 'Matthew 8:14–17 | Mark 1:29–34 | Luke 4:38–41', 'Peter’s mother-in-law recovers from a fever, and people bring others to Jesus that evening.', 'The account moves from a private household to a public gathering. Matthew reads the healing through Isaiah’s language about bearing infirmities.'),
        event('galilee', 'Prayer, preaching, and a leper healed', 'Matthew 4:23–25 | Matthew 8:1–4 | Mark 1:35–45 | Luke 4:42–44 | Luke 5:12–16', 'Jesus withdraws to pray and teaches around Galilee. All three Synoptic Gospels tell of a man with leprosy who is made clean. The pin represents the circuit.', 'Withdrawal for prayer and the decision to move on balance local demand with the wider purpose of the preaching circuit.'),
        event('capernaum', 'A paralyzed man is healed', 'Matthew 9:1–8 | Mark 2:1–12 | Luke 5:17–26', 'Jesus forgives and heals a man carried by others. Mark and Luke describe friends lowering him through the roof.', 'The disagreement over forgiveness gives the public healing a second function: it demonstrates the authority Jesus has claimed.'),
        event('capernaum', 'The tax collector and the question about fasting', 'Matthew 9:9–17 | Mark 2:13–22 | Luke 5:27–39', 'Jesus calls a tax collector named Matthew in Matthew and Levi in Mark and Luke. He shares a meal and later answers a question about fasting with images of a wedding and wineskins.', 'The meal and fasting dispute both ask who belongs at Jesus’ table and how his presence changes established practices.'),
        event(null, 'The Sabbath and healing', 'Matthew 12:1–14 | Mark 2:23–3:6 | Luke 6:1–11', 'The disciples pluck grain on the Sabbath. In a separate synagogue scene, Jesus restores a man’s hand. The accounts do not identify specific sites.', 'The episodes distinguish human need and restoration from the dispute over what the Sabbath permits.'),
        event(null, 'Jesus appoints the Twelve', 'Matthew 10:1–4 | Mark 3:13–19 | Luke 6:12–16', 'Jesus appoints twelve disciples. Mark and Luke place the appointment on an unnamed mountain.', 'Mark explicitly joins two purposes: the Twelve are to be with Jesus and then to be sent out.'),
        event(null, 'The Sermon on the Mount and related teachings', 'Matthew 5–7 | Luke 6:17–49 | Luke 11:1–4 | Luke 12:22–34 | Luke 13:23–30', 'Matthew gathers the Beatitudes, salt and light, the Law, love of enemies, giving, prayer, fasting, worry, judgment, and the wise builder into one sermon. Luke shares several teachings in the Sermon on the Plain and elsewhere. No mountain is named.', 'Matthew’s sermon gathers the teachings into a sustained account of righteousness. Luke places parallel sayings in several settings and introduces blessings alongside woes.'),
        event('capernaum', 'A centurion asks for help', 'Matthew 8:5–13 | Luke 7:1–10', 'Jesus heals the centurion’s servant. In Matthew the officer speaks to Jesus. In Luke he sends intermediaries.', 'Both accounts portray the officer as understanding authority. Luke’s use of intermediaries adds another layer to the encounter.'),
        event('nain', 'The widow’s son is raised', 'Luke 7:11–17', 'Jesus meets a funeral procession at Nain and restores a widow’s son to life.', 'Luke emphasizes Jesus’ compassion for the widow and the crowd’s recognition of a prophet. The scene echoes stories about Israel’s prophets restoring life.'),
        event(null, 'Jesus’ family and accusations against him', 'Matthew 12:22–50 | Mark 3:20–35 | Luke 8:19–21 | Luke 11:14–23', 'Opponents attribute Jesus’ exorcisms to demonic power. Jesus also describes those who do God’s will as his family. The settings vary across accounts.', 'The scenes redefine loyalty around God’s will and dispute how observers should interpret Jesus’ actions.'),
        event('lake', 'Parables by the lake', 'Matthew 13:1–35 | Mark 4:1–34 | Luke 8:4–18 | Luke 13:18–21', 'The Gospels preserve overlapping teachings about the sower, lamp, and mustard seed. Mark also records the growing seed and notes that Jesus explains parables to his disciples.', 'The seed images emphasize different things: how people receive the message, how growth occurs, and how a small beginning can have a large result.'),
        event('lake', 'Jesus calms a storm', 'Matthew 8:23–27 | Mark 4:35–41 | Luke 8:22–25', 'The disciples wake Jesus during a storm on the lake. He calms the wind and water.', 'The disciples’ fear after the wind stops turns a story of rescue into a question about Jesus’ identity.'),
        event('eastShore', 'Healing on the far shore', 'Matthew 8:28–34 | Mark 5:1–20 | Luke 8:26–39', 'Jesus frees people from demonic possession near a herd of pigs. Matthew describes two men, while Mark and Luke describe one. The place names differ across accounts and manuscripts.', 'The accounts share a movement from isolation to restoration, even though the names and number of people differ.'),
        event(null, 'Jairus’s daughter and the woman who seeks healing', 'Matthew 9:18–26 | Mark 5:21–43 | Luke 8:40–56', 'Jesus heals a woman who has been bleeding for years and restores a girl to life. Mark and Luke name the girl’s father Jairus. The town is unnamed.', 'The interwoven stories bring a longstanding illness and a sudden crisis together. The interruption builds tension around Jairus’s daughter.'),
        event(null, 'Two blind men and a man unable to speak', 'Matthew 9:27–34', 'Matthew recounts Jesus healing two blind men and then a man who could not speak. No town is identified.', 'Matthew puts two restorations together and contrasts the crowd’s amazement with the Pharisees’ accusation.'),
        event(null, 'The Twelve are sent out', 'Matthew 10:5–42 | Mark 6:7–13 | Luke 9:1–6', 'Jesus sends the Twelve to proclaim the message and heal. The accounts give instructions without naming their individual destinations.', 'Sending the Twelve extends Jesus’ work through others. The instructions also prepare them to face both hospitality and rejection.'),
        event(null, 'John the Baptist is executed', 'Matthew 14:1–12 | Mark 6:14–29 | Luke 9:7–9', 'Matthew and Mark tell how Herod has John executed. Luke records Herod’s acknowledgment. These passages give no precise site.', 'Mark narrates the execution as a flashback that explains Herod’s fear and his response to reports about Jesus.'),
        event('bethsaida', 'Feeding of the five thousand', 'Matthew 14:13–21 | Mark 6:30–44 | Luke 9:10–17 | John 6:1–15', 'All four Gospels describe a crowd fed from five loaves and two fish. Luke links the episode to the area of Bethsaida. The exact spot is unknown.', 'All four move from scarcity to abundance and gather leftovers. John also describes the crowd’s wish to make Jesus king, a response Jesus withdraws from.'),
        event('lake', 'Jesus walks on the water', 'Matthew 14:22–33 | Mark 6:45–52 | John 6:16–21', 'Jesus approaches the boat on the water. Matthew adds Peter’s attempt to walk toward him.', 'Matthew adds Peter’s fear and rescue. Mark emphasizes that the disciples have yet to understand the loaves.'),
        event('gennesaret', 'Healings at Gennesaret', 'Matthew 14:34–36 | Mark 6:53–56', 'People bring the sick to Jesus after the boat reaches Gennesaret.', 'The short landing scene shifts the focus from the disciples’ experience on the water to the response of people on shore.'),
        event('capernaum', 'Bread of life discourse', 'John 6:22–71', 'After the feeding, Jesus teaches in the synagogue at Capernaum. Some disciples leave, and Peter speaks for the Twelve.', 'John develops the feeding’s significance through the crowd’s questions and Jesus’ claims about belief and life.'),
        event(null, 'Handwashing and what defiles', 'Matthew 15:1–20 | Mark 7:1–23', 'Jesus answers a dispute over ritual handwashing by turning attention to what comes from within a person. The narratives give no exact site.', 'The dispute shifts from the source of ritual impurity to the dispositions and actions Jesus names.'),
        event('tyre', 'The Syrophoenician woman', 'Matthew 15:21–28 | Mark 7:24–30', 'A woman asks Jesus to heal her daughter. Mark describes her as Syrophoenician, and Matthew as Canaanite. The pin represents the region.', 'The dialogue crosses a boundary of ethnicity and region. Matthew and Mark use different identifications while preserving the woman’s persistence.'),
        event('eastShore', 'Healing in the Decapolis and feeding of the four thousand', 'Matthew 15:29–39 | Mark 7:31–8:10', 'Mark describes a man who is deaf and has difficulty speaking being healed in the Decapolis. Matthew describes broader healings. Both tell of the feeding of four thousand. The pin is regional.', 'The regional settings matter because they broaden the reach of the ministry. The feeding accounts retain their own quantities and travel contexts.'),
        event(null, 'The warning about leaven', 'Matthew 16:5–12 | Mark 8:14–21', 'Jesus warns the disciples about leaven after they discover they have little bread. The wording and setting differ across the accounts.', 'The disciples mistake a metaphor for a comment about supplies, highlighting their difficulty interpreting teaching through what they have already seen.'),
        event('bethsaida', 'A blind man at Bethsaida', 'Mark 8:22–26', 'Jesus leads a blind man outside Bethsaida and restores his sight in stages.', 'A healing that unfolds in stages sits just before Peter recognizes Jesus but struggles to understand the kind of Messiah he will be.'),
        event('caesarea', 'Peter’s confession and the first passion prediction', 'Matthew 16:13–28 | Mark 8:27–9:1 | Luke 9:18–27', 'Peter identifies Jesus as the Messiah. Jesus speaks of suffering and calls disciples to take up their cross. Matthew and Mark locate the scene near Caesarea Philippi.', 'The confession is immediately followed by teaching about suffering, which complicates the disciples’ expectation of what messiahship entails.'),
        event(null, 'Transfiguration and healing of a boy', 'Matthew 17:1–21 | Mark 9:2–29 | Luke 9:28–43', 'Jesus is transfigured before Peter, James, and John on an unnamed mountain. Afterward he heals a boy whom the disciples could not help.', 'The mountain revelation and the healing afterward place extraordinary insight beside the disciples’ failure to help below.'),
        event('galilee', 'Second passion prediction and lessons for disciples', 'Matthew 17:22–23 | Matthew 18:1–9 | Mark 9:30–50 | Luke 9:43–50', 'Jesus again foretells his death and teaches about greatness, welcoming a child, an outsider acting in his name, and causes of stumbling. The pin is regional.', 'The prediction is followed by arguments about rank and belonging. Jesus answers with examples of welcome, service, and responsibility.')
      ]
    },
    {
      label: 'On the way to Jerusalem', shortLabel: 'To Jerusalem', passage: 'Matthew 19–20 · Mark 10 · Luke 9–19 · John 7–12',
      description: 'Luke tells a long journey toward Jerusalem. John records festival visits and the raising of Lazarus in a distinct sequence.',
      stops: [
        event('jerusalem', 'Festival visits in John', 'John 5:1–18 | John 7:1–39 | John 9:1–41 | John 10:22–39', 'John describes visits to Jerusalem, including Bethesda, teaching during the Festival of Booths, healing a man born blind, and debate at the Festival of Dedication. These visits span different points in John’s account.', 'John’s festival settings shape the imagery and debates. These episodes should be read in John’s sequence even when compared with Synoptic material.'),
        event(null, 'Luke sets the journey toward Jerusalem', 'Luke 9:51–62 | Luke 10:25–42 | Luke 15:1–32', 'Luke describes a Samaritan village refusing hospitality and frames teachings such as the Good Samaritan and the lost son within the journey. The parables themselves do not locate Jesus on the map.', 'Luke uses travel as a framework for teaching, so the setting of a parable and the place where Jesus tells it carry different meanings.'),
        event(null, 'Marriage, children, and riches', 'Matthew 19:1–30 | Mark 10:1–31 | Luke 18:15–30', 'Jesus teaches about marriage, welcomes children, and discusses wealth and the demands and promises of discipleship. Matthew and Mark describe a regional setting beyond the Jordan.', 'These scenes move from disputed social rules to questions about who can enter the kingdom and what following Jesus requires.'),
        event('bethany', 'Lazarus is raised', 'John 11:1–44', 'Jesus comes to Bethany, speaks with Martha and Mary, and calls Lazarus out of the tomb.', 'John gives Martha a central confession before the sign and places the family’s grief alongside Jesus’ claim about resurrection.'),
        event('ephraim', 'Jesus withdraws to Ephraim', 'John 11:45–57', 'After leaders meet to discuss what to do about him, Jesus withdraws to Ephraim near the wilderness. The identification is approximate.', 'The withdrawal marks a change from public signs to growing danger as Passover approaches.'),
        event(null, 'Third passion prediction and servant leadership', 'Matthew 20:17–28 | Mark 10:32–45 | Luke 18:31–34', 'Jesus tells the disciples what awaits him in Jerusalem. Matthew and Mark also recount a request for places of honor and Jesus’ response about serving others.', 'Matthew and Mark place a request for honor beside the prediction of suffering. Jesus answers by redefining authority as service.'),
        event('jericho', 'Blind beggars receive sight near Jericho', 'Matthew 20:29–34 | Mark 10:46–52 | Luke 18:35–43', 'Mark names Bartimaeus. Matthew describes two men. Luke places the encounter as Jesus approaches Jericho, while Matthew and Mark place it as he leaves.', 'The number of people and direction of travel differ, but each account makes someone at the roadside an active participant in the encounter.'),
        event('jericho', 'Jesus visits Zacchaeus', 'Luke 19:1–10', 'Jesus stops at the house of Zacchaeus, a chief tax collector who promises restitution and generosity.', 'The story joins a welcome into Zacchaeus’s home to concrete restitution, making his response publicly measurable.'),
        event('bethany', 'Anointing at Bethany', 'Matthew 26:6–13 | Mark 14:3–9 | John 12:1–8', 'Matthew and Mark describe an unnamed woman anointing Jesus’ head. John names Mary and describes her anointing his feet before the entry into Jerusalem. Their placements in the final-week narrative differ.', 'The accounts connect the act with Jesus’ burial. The different names, gestures, and placements matter for how each writer develops that connection.')
      ]
    },
    {
      label: 'Final week in Jerusalem', shortLabel: 'Final week', passage: 'Matthew 21–27 · Mark 11–15 · Luke 19–23 · John 12–19',
      description: 'Follow the entry into Jerusalem, public teaching, the meal, trial, crucifixion, and burial. Most stops are close together in Jerusalem.',
      stops: [
        event('olives', 'Jesus enters Jerusalem', 'Matthew 21:1–11 | Mark 11:1–11 | Luke 19:28–44 | John 12:12–19', 'All four describe the entry and public welcome. The Synoptic accounts connect the approach to the Mount of Olives.', 'The public welcome uses royal imagery. Luke adds Jesus’ grief over Jerusalem, while John explicitly connects the crowd to the raising of Lazarus.'),
        event('jerusalem', 'Fig tree and temple action', 'Matthew 21:12–22 | Mark 11:12–26 | Luke 19:45–48 | John 2:13–22', 'Matthew and Mark include the fig tree in the final-week account. Matthew, Mark, and Luke place the temple action here, while John places a similar account early in the ministry.', 'Mark frames the temple action between encounters with the fig tree. John connects the comparable scene to Jesus’ body and later resurrection.', ['John']),
        event('jerusalem', 'Authority, the vineyard, and questions at the temple', 'Matthew 21:23–22:46 | Mark 11:27–12:37 | Luke 20:1–44', 'Jesus answers challenges about his authority, tells of the vineyard tenants, and addresses taxes to Caesar, resurrection, the greatest commandment, and the Messiah as David’s son.', 'The linked episodes show a debate over authority unfolding through a story, public questions, and Jesus’ own reading of Scripture.'),
        event('jerusalem', 'Teachers of the law and the widow’s offering', 'Matthew 23:1–36 | Mark 12:38–44 | Luke 20:45–21:4', 'Jesus criticizes the search for status. Mark and Luke contrast wealthy gifts with the offering of a poor widow.', 'Mark and Luke put the widow’s gift beside criticism of leaders who exploit widows, inviting attention to both her generosity and her vulnerability.'),
        event('olives', 'Teaching on the temple and what is to come', 'Matthew 24–25 | Mark 13 | Luke 21:5–36', 'Jesus predicts the temple’s destruction and teaches about vigilance. Matthew and Mark locate the conversation on the Mount of Olives, while Luke introduces it at the temple.', 'The discourse moves between the temple’s fate and the disciples’ readiness. The Gospel settings and surrounding material shape how those themes are heard.'),
        event('jerusalem', 'Judas agrees to betray Jesus', 'Matthew 26:14–16 | Mark 14:10–11 | Luke 22:1–6', 'Judas goes to the chief priests and agrees to hand Jesus over. The precise meeting place is not given.', 'The agreement shifts the plot from public opposition to betrayal from within the circle of disciples.'),
        event('jerusalem', 'Last Supper and foot washing', 'Matthew 26:17–30 | Mark 14:12–26 | Luke 22:7–23 | John 13:1–30', 'The Synoptic Gospels recount the bread and cup at the meal. John describes Jesus washing his disciples’ feet and identifying his betrayer. The accounts frame the meal’s relation to Passover differently.', 'The Synoptic accounts and John attach different actions to the meal. Read together, they bring remembrance, service, and betrayal into view without settling the calendar.'),
        event('olives', 'Jesus predicts Peter’s denial', 'Matthew 26:30–35 | Mark 14:26–31 | Luke 22:31–34 | John 13:36–38', 'Jesus tells Peter that he will deny him three times. Matthew and Mark place the prediction after the group leaves for the Mount of Olives, while Luke and John place it in the meal’s conversation.', 'The prediction makes a contrast between Peter’s confidence and what he will do under pressure. Luke also emphasizes his later task of strengthening others.'),
        event('gethsemane', 'Prayer at Gethsemane', 'Matthew 26:36–46 | Mark 14:32–42 | Luke 22:39–46', 'Jesus prays while the disciples struggle to stay awake. Matthew and Mark name Gethsemane. Luke describes the Mount of Olives.', 'The prayer gives voice to anguish and commitment. The disciples’ sleep contrasts with Jesus’ repeated call to remain alert.'),
        event('gethsemane', 'Jesus is arrested', 'Matthew 26:47–56 | Mark 14:43–52 | Luke 22:47–53 | John 18:1–12', 'Judas leads the arresting party. A disciple strikes a servant, whom John names Malchus, and John identifies Peter as the disciple. Mark alone mentions a young man who flees.', 'John emphasizes Jesus stepping forward and protecting the disciples. Mark’s fleeing witness adds a detail about the collapse of support around him.'),
        event('jerusalem', 'Questioning and Peter’s denials', 'Matthew 26:57–75 | Mark 14:53–72 | Luke 22:54–71 | John 18:13–27', 'The accounts describe questioning by Jewish authorities and Peter’s three denials. John names Annas in the initial questioning, and Luke places the council meeting at daybreak.', 'Each narrative interweaves Jesus’ treatment with Peter’s behavior. Luke’s timing of the formal council and John’s naming of Annas distinguish their sequences.'),
        event('jerusalem', 'Jesus before Pilate', 'Matthew 27:11–26 | Mark 15:1–15 | Luke 23:1–25 | John 18:28–19:16', 'Pilate questions Jesus, Barabbas is released, and Jesus is handed over to be crucified. Luke also describes a hearing before Herod Antipas.', 'The narratives give Pilate, the crowd, and other authorities different amounts of attention. Luke broadens the scene by including Herod Antipas.'),
        event('jerusalem', 'The soldiers mock Jesus', 'Matthew 27:27–31 | Mark 15:16–20 | Luke 23:11 | John 19:1–5', 'Matthew, Mark, and John describe the soldiers clothing Jesus and mocking him as king. Luke describes mockery and a robe at Herod’s hearing.', 'The mock regalia turns the charge of kingship into a public humiliation. Luke presents a related scene in a different hearing.'),
        event('golgotha', 'Crucifixion and death', 'Matthew 27:32–56 | Mark 15:21–41 | Luke 23:26–49 | John 19:16–37', 'All four tell of the crucifixion and death, with different details and sayings. The Synoptic accounts name Simon of Cyrene as carrying the cross. John describes Jesus carrying it. The site shown is approximate.', 'The accounts converge on the execution while preserving different sayings, witnesses, and actions. Source-specific details should remain attached to their own narratives.'),
        event('golgotha', 'Jesus is buried', 'Matthew 27:57–66 | Mark 15:42–47 | Luke 23:50–56 | John 19:38–42', 'Joseph of Arimathea takes responsibility for the burial. John also names Nicodemus and places the tomb in a nearby garden. The exact location is debated.', 'The named burial figures and witnesses connect the death narratives to the later visit to the tomb.')
      ]
    },
    {
      label: 'Resurrection and appearances', shortLabel: 'Resurrection', passage: 'Matthew 28 · Mark 16 · Luke 24 · John 20–21',
      description: 'Compare the empty-tomb accounts and appearances in Jerusalem, on the road, and in Galilee. The Gospels emphasize different locations and sequences.',
      stops: [
        event('golgotha', 'The women find the tomb empty', 'Matthew 28:1–10 | Mark 16:1–8 | Luke 24:1–12 | John 20:1–10', 'All four open the resurrection account with a visit to the tomb. They differ in whom they name and what happens next.', 'The shared discovery anchors each account. Differences in witnesses, messengers, and responses shape the beginning of each resurrection narrative.'),
        event('golgotha', 'Jesus appears to Mary Magdalene', 'Matthew 28:8–10 | John 20:11–18 | Mark 16:9–11', 'John describes Mary recognizing Jesus at the tomb. Matthew tells of an appearance to the women as they leave. Mark 16:9–11 belongs to the longer ending of Mark.', 'John builds recognition around Jesus addressing Mary by name. Matthew gives the women a message for the disciples, and the longer ending of Mark compresses the scene.'),
        event(null, 'Two disciples on the road to Emmaus', 'Luke 24:13–35 | Mark 16:12–13', 'Luke names Emmaus and recounts how two travelers recognize Jesus at a meal. Its location is disputed. Mark’s longer ending briefly describes an appearance to two travelers.', 'Luke moves from failed recognition through interpretation of Scripture to recognition at the meal. Mark’s longer ending leaves most of that development out.'),
        event('jerusalem', 'Jesus appears to the gathered disciples', 'Luke 24:36–49 | John 20:19–29 | Mark 16:14–18', 'Luke and John describe appearances to gathered disciples. John adds a later encounter with Thomas. Mark’s longer ending adds a commissioning scene.', 'Luke emphasizes bodily presence and the opening of Scripture. John emphasizes peace, sending, and Thomas’s later response.'),
        event('lake', 'Breakfast by the Sea of Galilee', 'John 21:1–23', 'Jesus appears by the lake, shares breakfast, and speaks with Peter. John names the sea without specifying a particular beach.', 'John places the conversation after an abundant catch and a meal. Peter’s repeated commission follows his earlier repeated denial.'),
        event(null, 'The commission on a Galilean mountain', 'Matthew 28:16–20', 'The eleven meet Jesus in Galilee and are sent to make disciples of all nations. Matthew leaves the mountain unnamed.', 'Matthew closes in Galilee, pairing the disciples’ worship and doubt with a commission grounded in Jesus’ authority.'),
        event('bethany', 'Ascension near Bethany', 'Luke 24:50–53 | Mark 16:19–20', 'Luke places the departure near Bethany. The longer ending of Mark mentions the ascension without naming a location.', 'Luke ends with blessing and the disciples returning to Jerusalem. The longer ending of Mark closes with their preaching and its confirmation.')
      ]
    }
  ];

  // Intermediate waypoints trace broad travel corridors, with coordinates in route order.
  var ridge = [[31.917, 35.222], [32.081, 35.251], [32.203, 35.281], [32.385, 35.235], [32.557, 35.268]];
  var coast = [[31.662, 35.073], [31.618, 34.814], [31.430, 34.432], [31.303, 34.244], [31.107, 33.812], [30.995, 33.119], [30.995, 32.542]];
  var valley = [[31.959, 35.485], [32.161, 35.524], [32.347, 35.548], [32.505, 35.506], [32.664, 35.554], [32.722, 35.572], [32.769, 35.536], [32.815, 35.530], [32.863, 35.518]];
  var descent = [[31.790, 35.252], [31.806, 35.289], [31.824, 35.325], [31.837, 35.365], [31.853, 35.405]];
  var roads = {
    'jerusalem:nazareth': ridge,
    'bethlehem:nazareth': [[31.776, 35.215]].concat(ridge),
    'bethlehem:jerusalem': [[31.731, 35.207], [31.755, 35.222]],
    'bethlehem:egypt': coast,
    'egypt:nazareth': coast.slice().reverse().concat([[31.793, 34.889], [31.959, 35.011], [32.108, 35.099], [32.368, 35.176], [32.579, 35.223]]),
    'jordanBethany:cana': [[31.853, 35.475]].concat(valley.slice(0, 5), [[32.622, 35.387], [32.685, 35.357]]),
    'cana:capernaum': [[32.773, 35.378], [32.789, 35.435], [32.808, 35.485], [32.836, 35.503], [32.875, 35.536]],
    'nazareth:capernaum': [[32.730, 35.342], [32.762, 35.385], [32.779, 35.457], [32.807, 35.509], [32.861, 35.519]],
    'jerusalem:capernaum': descent.concat(valley),
    'jerusalem:aenon': descent.concat(valley.slice(0, 3)),
    'aenon:sychar': [[32.347, 35.512], [32.294, 35.437], [32.216, 35.377]],
    'sychar:cana': [[32.338, 35.304], [32.464, 35.270], [32.583, 35.290], [32.675, 35.315]],
    'capernaum:nain': [[32.864, 35.519], [32.805, 35.502], [32.753, 35.449], [32.688, 35.406]],
    'eastShore:bethsaida': [[32.863, 35.654], [32.893, 35.646]],
    'gennesaret:capernaum': [[32.877, 35.541]],
    'capernaum:tyre': [[32.900, 35.539], [32.942, 35.482], [33.044, 35.401], [33.159, 35.321], [33.225, 35.257]],
    'tyre:eastShore': [[33.215, 35.382], [33.200, 35.572], [33.088, 35.610], [32.973, 35.633], [32.920, 35.650]],
    'bethsaida:caesarea': [[32.951, 35.635], [33.057, 35.624], [33.171, 35.642]],
    'caesarea:galilee': [[33.179, 35.624], [33.045, 35.591], [32.962, 35.522], [32.886, 35.487]],
    'jerusalem:bethany': [[31.782, 35.244], [31.779, 35.254]],
    'bethany:ephraim': [[31.814, 35.276], [31.876, 35.282], [31.922, 35.303]],
    'ephraim:jericho': [[31.944, 35.337], [31.927, 35.377], [31.905, 35.405]],
    'bethany:jericho': descent.slice(1),
    'jerusalem:olives': [[31.780, 35.241]],
    'olives:gethsemane': [[31.7762, 35.2446], [31.7779, 35.2417]]
  };

  return {
    title: 'Jesus’ journey',
    sites: sites,
    roads: roads,
    towns: {
      jesus_jerusalem: 'Jerusalem',
      jesus_bethlehem: 'Bethlehem',
      jesus_bethany: 'Bethany',
      jesus_jericho: 'Jericho',
      jesus_ephraim: 'Ephraim',
      jesus_sychar: 'Sychar',
      jesus_nazareth: 'Nazareth',
      jesus_cana: 'Cana',
      jesus_nain: 'Nain',
      jesus_capernaum: 'Capernaum',
      jesus_bethsaida: 'Bethsaida',
      jesus_caesarea: 'Caesarea Philippi',
      jesus_tyre: 'Tyre'
    },
    missions: missions,
    sources: [
      ['Bible geography · OpenBible.info (CC BY 4.0)', 'https://www.openbible.info/geo/'],
      ['Historical travel corridors · GIS research', 'https://ruj.uj.edu.pl/server/api/core/bitstreams/b0283188-c8bc-4fc1-9f3b-bd96a393f1b5/content'],
      ['Lake outlines · Natural Earth', 'https://www.naturalearthdata.com/downloads/10m-physical-vectors/10m-lakes/'],
      ['The four Gospels · NRSVUE', 'https://www.biblegateway.com/versions/New-Revised-Standard-Version-Updated-Edition-NRSVue-Bible/']
    ]
  };
})();

var NOVUM_ARCHAEOLOGY = (function () {
  'use strict';

  function place(title, region, lat, lon) {
    return { title: title, region: region, lat: lat, lon: lon };
  }

  function finding(title, genre, site, period, age, reference, evidence, source, recovery) {
    return {
      title: title, genre: genre, site: site && 'arch_' + site, period: period,
      age: age, reference: reference, evidence: evidence, source: source, recovery: recovery
    };
  }

  var sites = {
    arch_avaris: place('Tell el-Dabʿa (Avaris)', 'Egypt', 30.787, 31.826),
    arch_hammam: place('Tall el-Hammam', 'Jordan Valley, Jordan', 31.840, 35.673),
    arch_hattusa: place('Hattusa', 'Boğazkale, Türkiye', 40.020, 34.615),
    arch_telDan: place('Tel Dan', 'Upper Jordan Valley', 33.249, 35.653),
    arch_dhiban: place('Dhiban (ancient Dibon)', 'Jordan', 31.504, 35.787),
    arch_jerusalem: place('Jerusalem', 'Judean Hills', 31.774, 35.235),
    arch_khorsabad: place('Khorsabad (Dur-Sharrukin)', 'Iraq', 36.509, 43.229),
    arch_nimrud: place('Nimrud (Kalhu)', 'Iraq', 36.101, 43.329),
    arch_nineveh: place('Nineveh', 'Mosul, Iraq', 36.366, 43.154),
    arch_yavne: place('Meṣad Ḥashavyahu', 'Mediterranean coast, Israel', 31.919, 34.716),
    arch_lachish: place('Tel Lachish', 'Judean Shephelah', 31.565, 34.847),
    arch_ur: place('Ur', 'Tell el-Muqayyar, Iraq', 30.962, 46.104),
    arch_gath: place('Tell es-Safi (Gath)', 'Judean Shephelah', 31.700, 34.846),
    arch_caesarea: place('Caesarea Maritima', 'Mediterranean coast, Israel', 32.500, 34.892),
    arch_elAraj: place('El-Araj', 'Northern shore of the Sea of Galilee', 32.893, 35.620),
    arch_thessalonica: place('Thessalonica', 'Thessaloniki, Greece', 40.641, 22.937),
    arch_frankfurt: place('Praunheim Roman cemetery', 'Frankfurt am Main, Germany', 50.149, 8.634),
    arch_sinai: place('St. Catherine’s Monastery', 'Sinai, Egypt', 28.556, 33.976)
  };

  // Calendar dates describe the physical witness or site layer. A null range
  // denotes a textual comparison or an item with no usable artifact date.
  var records = [
    finding('Tell el-Dabʿa settlement and burials', 'Sites and structures', 'avaris', [-1800, -1550],
      'c. 1800–1550 BCE', 'Genesis 37–41',
      'Excavations show a large community with Near Eastern cultural ties in Egypt’s eastern Delta. The residences and burials provide context for migration to Egypt. They do not identify Joseph or his family.',
      ['Austrian Archaeological Institute · Tell el-Dabʿa excavations', 'https://www.oeaw.ac.at/en/oeai/institute/branches/cairo/excavations-projects/tell-el-dab%CA%BFa']),
    finding('Tall el-Hammam', 'Sites and structures', 'hammam', [-1750, -1550],
      'Middle Bronze Age occupation, broadly c. 1750–1550 BCE', 'Genesis 19:24–26',
      'This is a Bronze Age settlement in the Jordan Valley. Its identification with Sodom remains a proposal. Scientific Reports retracted the study that presented the destruction as a cosmic airburst.',
      ['Scientific Reports · Retraction notice and original study', 'https://www.nature.com/articles/s41598-021-97778-3']),
    finding('Hattusa, the Hittite capital', 'Sites and structures', 'hattusa', [-1600, -1200],
      'c. 1600–1200 BCE, imperial-period remains', 'Genesis 23:3–20',
      'The fortified capital and its archives document the Hittite Empire. This establishes the Anatolian civilization and gives context to the name Hittite. The relationship to the people called Hittites in Genesis is a separate question.',
      ['UNESCO · Hattusha', 'https://whc.unesco.org/en/list/377/'], 'Major systematic excavations began in 1906.'),
    finding('Ipuwer Papyrus', 'Manuscripts and texts', null, [-1292, -1189],
      '19th Dynasty, c. 1292–1189 BCE, surviving copy', 'Exodus 7–12',
      'Papyrus Leiden I 344 preserves an Egyptian literary work about disorder and suffering. Its composition may predate the surviving copy. Similar imagery has prompted comparison with Exodus, without establishing an eyewitness connection.',
      ['Open Richly Annotated Egyptian Corpus · Papyrus Leiden I 344', 'https://oraec.github.io/corpus/oraec21.html'], 'The precise recovery location is undocumented.'),
    finding('Mesha Stele', 'Inscriptions and reliefs', 'dhiban', [-850, -825],
      'Around 840 BCE', '2 Kings 3',
      'Mesha of Moab commemorates victories and describes earlier Israelite rule over Moab. The inscription gives a Moabite royal perspective on conflict with Israel that can be compared with the account in Kings.',
      ['Louvre · Mesha Stele', 'https://collections.louvre.fr/ark:/53355/cl010120339'], 'Recorded at Dhiban in 1868.'),
    finding('Tel Dan Stele', 'Inscriptions and reliefs', 'telDan', [-875, -800],
      '9th century BCE, approximately', '2 Kings 8–9',
      'The surviving Aramaic fragments commemorate an Aramean victory and refer to a king of Israel and a ruler of the House of David, the usual reading of the dynastic name. The inscription is later than the reigns traditionally assigned to David and Solomon.',
      ['Israel Antiquities Authority · Tel Dan Stele', 'https://www.atiqot.org.il/en/objects/tel-dan-stele/'], 'Fragments were excavated at Tel Dan in the 1990s.'),
    finding('Earthquake destruction at Gath', 'Excavation layers', 'gath', [-775, -750],
      'Mid-8th century BCE, approximate layer date', 'Amos 1:1',
      'Excavators identified collapsed and displaced architecture at Tell es-Safi. Its date makes a connection with the earthquake remembered in Amos plausible. The excavated damage cannot establish the identity of the event on its own.',
      ['Excavation study · Eighth-century Gath', 'https://www.journals.uchicago.edu/doi/10.5615/neareastarch.81.1.0048']),
    finding('Jotham seal impression', 'Seals and sealings', 'jerusalem', [-750, -701],
      'Late 8th century BCE, approximate', '2 Kings 15:32–38',
      'A sealing names a man called Jotham and gives him the title servant of the king. Jotham is a name found in the biblical record, but the title and text do not securely identify the person as the king of Judah.',
      ['Armstrong Institute · The Jotham seal impression and proposed identification', 'https://armstronginstitute.org/321-on-the-archaeological-trail-of-king-jotham']),
    finding('Ahaz seal impression', 'Seals and sealings', null, [-735, -715],
      'Late 8th century BCE if authentic', '2 Kings 16',
      'A privately held clay sealing has been read as naming Ahaz, son of Jotham and king of Judah. It lacks a controlled excavation provenance. A fingerprint on the clay cannot establish whose finger made the mark.',
      ['Lawrence J. Mykytiuk · Northwest Semitic inscriptions and biblical identifications', 'https://yausha.com.br/wp-content/uploads/2024/02/Identifying-Biblical-Persons-In-Northwest-Semitic-Inscriptions-Of-1200.pdf']),
    finding('Tiglath-pileser III’s tribute inscription', 'Inscriptions and reliefs', 'nimrud', [-737, -729],
      'Late reign of Tiglath-pileser III, c. 737–729 BCE', '2 Kings 16:7–9',
      'An Assyrian summary inscription lists Jehoahaz of Judah among rulers who paid tribute. The royal record and 2 Kings both describe Judah’s subordinate relationship to Assyria, from different perspectives.',
      ['Fontes · Published Akkadian inscriptions of Tiglath-pileser III', 'https://fontes.page/texts/akkadian-tiglath-pileser-iii/']),
    finding('Palace of Sargon II', 'Sites and structures', 'khorsabad', [-717, -706],
      'c. 717–706 BCE', 'Isaiah 20:1',
      'The palace at Sargon II’s new capital preserves Assyrian royal architecture, sculpture, and inscriptions. Isaiah names Sargon in connection with Ashdod. The Khorsabad remains independently document the ruler and his empire.',
      ['Louvre · Palace of Sargon II at Khorsabad', 'https://www.louvre.fr/en/explore/the-palace/the-palace-of-sargon-ii']),
    finding('Hezekiah royal seal impression', 'Seals and sealings', 'jerusalem', [-715, -686],
      'Late 8th–early 7th century BCE', '2 Kings 18:1–8',
      'A bulla excavated at the Ophel names Hezekiah, son of Ahaz, king of Judah. Its archaeological context and royal wording distinguish it from unprovenanced examples on the antiquities market.',
      ['Excavation report · The Ophel royal sealing', 'https://armstronginstitute.org/files/W1siZiIsIjIwMjMvMDgvMjEvMWhjemV2dDIyZ19MU1MyMDIzMDdfRU4ucGRmIl1d/98217f295652ff6f/LSS202307_EN.pdf']),
    finding('Siloam Tunnel', 'Sites and structures', 'jerusalem', [-725, -675],
      'Around 700 BCE, approximate construction date', '2 Kings 20:20',
      'The tunnel conducts water from the Gihon Spring toward Siloam. Its inscription describes workers meeting underground, and radiometric analysis supports an Iron Age date consistent with the traditional association with Hezekiah.',
      ['Frumkin and colleagues · Radiometric dating of the Siloam Tunnel', 'https://www.nature.com/articles/nature01875']),
    finding('Lachish reliefs', 'Inscriptions and reliefs', 'nineveh', [-700, -692],
      'c. 700–692 BCE, palace carvings', '2 Kings 18:13–17',
      'Sennacherib’s palace reliefs depict the capture of Lachish in his 701 BCE campaign. The map marks where the reliefs were recovered at Nineveh. The scene itself depicts a town in Judah.',
      ['British Museum · Lachish palace reliefs', 'https://www.britishmuseum.org/collection/object/W_1856-0909-14']),
    finding('Sennacherib’s Taylor Prism', 'Inscriptions and reliefs', 'nineveh', [-691, -691],
      '691 BCE, inscribed prism', '2 Kings 18–19',
      'Sennacherib’s account recalls the 701 BCE campaign, names Hezekiah, and describes confining him in Jerusalem. It records tribute and does not claim to have taken the city.',
      ['Israel Museum · Sennacherib’s campaign in Judah', 'https://www.imj.org.il/en/exhibitions/special-display-assyrian-campaign-judah-told-sennacherib-prism'], 'Associated with the ruins of Nineveh.'),
    finding('Ashurbanipal’s annals naming Manasseh', 'Inscriptions and reliefs', 'nineveh', [-669, -630],
      'Mid-7th century BCE, broad range for the royal inscriptions', '2 Chronicles 33:10–13',
      'An Assyrian royal inscription names Manasseh of Judah among kings who contributed to an Egyptian campaign. This attests Manasseh in an Assyrian context without independently documenting the imprisonment or return described in Chronicles.',
      ['ORACC · Royal inscriptions of Ashurbanipal', 'https://oracc.museum.upenn.edu/rinap/rinap5/']),
    finding('Meṣad Ḥashavyahu ostracon', 'Letters and tablets', 'yavne', [-650, -600],
      'Late 7th century BCE, often placed around 630 BCE', '2 Kings 22–23',
      'A Hebrew complaint written on a potsherd asks an official to return a worker’s garment. The letter illuminates local administration and appeals for justice. The reading of a possible reference to the Sabbath is disputed.',
      ['Cambridge · Ancient Hebrew Inscriptions', 'https://www.cambridge.org/core/elements/ancient-hebrew-inscriptions/26E0DECA312B046780697E72296BF572']),
    finding('Lachish letters', 'Letters and tablets', 'lachish', [-600, -586],
      'Early 6th century BCE, before the Babylonian destruction', '2 Kings 24–25',
      'Hebrew communications written on pottery sherds were recovered near the Lachish gate. The letters illuminate Judah’s military communications in the last years of the kingdom.',
      ['Cambridge · Ancient Hebrew Inscriptions', 'https://www.cambridge.org/core/elements/ancient-hebrew-inscriptions/26E0DECA312B046780697E72296BF572'], 'Excavated at Tel Lachish in the 1930s.'),
    finding('Babylonian Chronicle 5', 'Letters and tablets', null, [-599, -500],
      '6th century BCE, catalogued tablet', '2 Kings 24:8–17',
      'The cuneiform tablet records Nebuchadnezzar’s first capture of Jerusalem and replacement of its king in 597 BCE. That event date is distinct from the broad dating of the physical tablet.',
      ['British Museum · Babylonian Chronicle, BM 21946', 'https://www.britishmuseum.org/collection/object/W_1896-0409-51'], 'Specific archaeological findspot uncertain.'),
    finding('Babylonian destruction layers in Jerusalem', 'Excavation layers', 'jerusalem', [-586, -586],
      'Around 586 BCE, destruction horizon', '2 Kings 25:1–12',
      'Excavated ash, burnt material, and damaged Iron Age structures provide physical evidence of severe destruction. Archaeologists compare these layers with the Babylonian conquest at the end of the kingdom of Judah.',
      ['Journal of Archaeological Science · Reconstruction of the 586 BCE fire', 'https://doi.org/10.1016/j.jas.2023.105823']),
    finding('Nabonidus cylinders naming Belshazzar', 'Inscriptions and reliefs', 'ur', [-556, -539],
      '556–539 BCE, reign of Nabonidus', 'Daniel 5',
      'A cylinder from Ur identifies Belshazzar as Nabonidus’s eldest son. Other Babylonian records describe the crown prince’s delegated authority. The inscriptions give historical context for the figure in Daniel.',
      ['Royal Inscriptions of Babylonia Online · Nabonidus sources', 'https://build-oracc.museum.upenn.edu/ribo/sources/P519004']),
    finding('Seal impression bearing the name Isaiah', 'Seals and sealings', 'jerusalem', [-750, -675],
      'Late 8th–early 7th century BCE, approximate', 'Isaiah 1:1',
      'A damaged bulla from the Ophel preserves the name Isaiah and another incomplete word. Reading that word as prophet is disputed. The surviving letters do not securely identify the biblical prophet.',
      ['Haggai Misgav · Reading the Isaiah bulla', 'https://www.megalim.org.il/wp-content/uploads/2020/06/sefer_keness13_EN_Misgav.pdf']),
    finding('Uzziah reburial inscription', 'Inscriptions and reliefs', null, [-50, 100],
      'Around the 1st century CE, much later than Uzziah’s reign', '2 Chronicles 26:23',
      'The Aramaic inscription identifies the bones of Uzziah, king of Judah, as having been brought to a burial place. Its lettering is from the late Second Temple period. The precise original findspot is uncertain.',
      ['Tchekhanovets and Vach · Study of the inscription’s provenance', 'https://www.academia.edu/122202184/Y_Tchekhanovets_and_K_Vach_On_the_Provenance_of_the_Jerusalem_Inscription_of_King_Uzziah_Eretz_Israel_35_2024_pp_155_161_']),
    finding('Pontius Pilate Stone', 'Inscriptions and reliefs', 'caesarea', [26, 36],
      '26–36 CE, Pilate’s prefecture', 'Matthew 27',
      'A Latin dedication names Pontius Pilate and identifies him as prefect of Judea. It was reused in the theatre at Caesarea. The stone establishes his office independently of the Gospel accounts.',
      ['Israel Museum · Pilate inscription', 'https://www.imj.org.il/en/collections/199042'], 'Excavated at Caesarea in 1961.'),
    finding('Thessalonica politarch inscription', 'Inscriptions and reliefs', 'thessalonica', [101, 200],
      '2nd century CE, Vardar Gate inscription', 'Acts 17:5–9',
      'The Greek inscription from the Vardar Gate lists officeholders called politarchs. It attests the civic title used in Acts, while the surviving inscription dates later than Paul’s visit.',
      ['British Museum · Vardar Gate inscription', 'https://www.britishmuseum.org/collection/object/G_1877-0509-1']),
    finding('Rylands Papyrus of John (P52)', 'Manuscripts and texts', null, [125, 250],
      'c. 125–250 CE, broad handwriting estimate', 'John 18:31–33, 37–38',
      'This small Greek papyrus preserves parts of John’s account of Jesus before Pilate. Its precise date remains debated. The fragment was acquired in Egypt, with no documented excavation location.',
      ['University of Manchester Library · Greek papyri collection', 'https://www.library.manchester.ac.uk/rylands/special-collections/search/published-catalogues/greek-papyri/']),
    finding('Frankfurt silver amulet', 'Amulets and relics', 'frankfurt', [230, 260],
      'c. 230–260 CE, grave assemblage estimate', 'Philippians 2:9–11',
      'CT imaging revealed an early Latin Christian text inside a small silver amulet from a Roman grave. Its language names Jesus Christ and echoes language used in Philippians.',
      ['Archaeological Museum Frankfurt · Silver inscription and excavation', 'https://archaeologisches-museum-frankfurt.de/index.php/de/?catid=14%3Aausstellungen&id=1506%3Afrankfurter-silberinschrift-antworten-auf-die-wichtigsten-fragen&view=article'], 'Recovered during excavations in 2017–2018.'),
    finding('Codex Vaticanus', 'Manuscripts and texts', null, [301, 400],
      '4th century CE', 'Greek Old and New Testaments',
      'The Vatican manuscript preserves a large portion of the Greek Bible and is an important textual witness. Its current library is documented, while its place of recovery is unknown.',
      ['Vatican Apostolic Library · Vat. gr. 1209', 'https://spotlight.vatlib.it/overview/catalog/Vat_gr_1209']),
    finding('Codex Sinaiticus', 'Manuscripts and texts', 'sinai', [301, 400],
      '4th century CE, often placed near the middle of the century', 'Greek Old and New Testaments',
      'The manuscript preserves the earliest complete surviving New Testament alongside much of the Greek Old Testament and other writings. The map shows the monastery where portions were identified and recovered.',
      ['Codex Sinaiticus Project · Manuscript and history', 'https://codexsinaiticus.org/en/codex/default.aspx'], 'Parts were identified and recovered at St. Catherine’s from 1844 onward.'),
    finding('El-Araj church and Peter mosaic', 'Sites and structures', 'elAraj', [401, 600],
      'Byzantine period, broadly 5th–6th century CE', 'John 1:44',
      'A Greek mosaic honors Peter in a Byzantine church at El-Araj, a proposed location for Bethsaida. The building documents a later Christian association with Peter. The mosaic itself does not settle the identification of the first-century town.',
      ['Excavation project · Report on the basilica inscriptions', 'https://www.tsedizioni.it/wp-content/uploads/2024/03/ESTRATTO-LA_2023.pdf']),
    finding('Shroud of Turin', 'Amulets and relics', null, [1260, 1390],
      '1260–1390 CE, radiocarbon result for the tested sample', 'Matthew 27:59–60',
      'The image-bearing linen has a longstanding devotional association with Jesus’ burial. The published radiocarbon measurement dates the sample to the medieval period. Claims about image formation and the representativeness of the sample remain debated.',
      ['Damon and colleagues · Radiocarbon dating of the Shroud', 'https://www.nature.com/articles/337611a0'], 'The textile’s manufacture and archaeological findspot are unknown.'),
    finding('Sudarium of Oviedo', 'Amulets and relics', null, null,
      'Date of manufacture uncertain', 'John 20:6–7',
      'The cloth is preserved in Oviedo as a devotional relic. Proposed links to the separate face cloth described in John have not established an archaeological identification.',
      ['UNESCO · Cámara Santa and the monuments of Oviedo', 'https://whc.unesco.org/en/list/312/']),
    finding('Flood traditions', 'Research context', null, null,
      'Multiple literary traditions and dates', 'Genesis 6–9',
      'Flood stories are found in several literary traditions. Comparing them can illuminate shared themes and transmission, but the recurrence of the story cannot establish a worldwide flood.',
      ['British Museum · Flood Tablet from the Epic of Gilgamesh', 'https://www.britishmuseum.org/collection/object/W_K-3375']),
    finding('Mount Ararat and Ark claims', 'Research context', null, null,
      'No verified artifact to date', 'Genesis 8:4',
      'Genesis names the mountains of Ararat, a wider region. Proposed sites on or near the modern mountain have not yielded a securely authenticated archaeological discovery of the Ark.',
      ['Genesis 8 · Text', 'https://www.biblegateway.com/passage/?search=Genesis+8&version=NRSVUE']),
    finding('Egyptian famine records and Joseph', 'Research context', null, null,
      'Starter entry gives no specific artifact', 'Genesis 41:25–57',
      'Egyptian texts can attest episodes of food shortage in different periods. A comparison with Joseph’s famine requires an identified text, a date, and independent evidence of the connection.',
      ['Genesis 41 · Text', 'https://www.biblegateway.com/passage/?search=Genesis+41&version=NRSVUE']),
    finding('Josephus on Jesus', 'Manuscripts and texts', null, null,
      'Jewish Antiquities composed c. 93–94 CE', 'Matthew 27',
      'Jewish Antiquities 18 includes a description of Jesus and his execution under Pilate in its received text. Scholars debate how much of the wording is original. The year shown here is the work’s composition date, so this comparison is outside the artifact slider.',
      ['Cambridge · Study of Josephus and the Testimonium Flavianum', 'https://www.cambridge.org/core/services/aop-cambridge-core/content/view/S0022046900049435']),
    finding('Later Han eclipse account', 'Research context', null, null,
      'The later chronicle preserves a report from the Eastern Han period', 'Matthew 27:45',
      'The Chinese chronicle records celestial phenomena in its own historical setting. Equating an eclipse report with the Gospel darkness requires independent evidence for an exact date and connection.',
      ['Chinese Text Project · Book of the Later Han', 'https://ctext.org/hou-han-shu']),
    finding('Phlegon’s eclipse in Origen', 'Research context', null, null,
      'Second-century source quoted in a third-century work', 'Matthew 27:45, 51',
      'Origen discusses a lost chronicle by Phlegon when responding to Celsus. The surviving passage is a later quotation and interpretation, so its dating and reference to the crucifixion require care.',
      ['Origen · Against Celsus, book 2', 'https://www.newadvent.org/fathers/04162.htm'])
  ];

  return { sites: sites, records: records };
})();

var NOVUM_CHRISTIANITY = (function () {
  'use strict';

  var milestones = [
    [30, 'c. 30 CE', 'The Jerusalem community', 'Jerusalem', 31.778, 35.232,
      'Acts describes Pentecost and a community that gathered in Jerusalem for teaching, prayer, and shared meals. The date is approximate.',
      'Acts 2', 'https://www.biblegateway.com/passage/?search=Acts+2&version=NRSVUE'],
    [40, 'c. 40s CE', 'Antioch becomes a sending church', 'Antioch, Roman Syria', 36.205, 36.161,
      'Acts describes believers from Cyprus and Cyrene preaching in Antioch, where the disciples were first called Christians. The community later sent Barnabas and Paul on mission.',
      'Acts 11 and 13', 'https://www.biblegateway.com/passage/?search=Acts+11%3A19-26%3BActs+13%3A1-3&version=NRSVUE'],
    [60, 'c. 60 CE', 'Paul reaches Rome', 'Rome, Roman Empire', 41.893, 12.483,
      'Acts ends with Paul teaching in Rome. His Letter to the Romans already addresses a community there before his arrival.',
      'Acts 28 and Romans 1', 'https://www.biblegateway.com/passage/?search=Acts+28%3A14-31%3BRomans+1%3A7-13&version=NRSVUE'],
    [240, 'c. 240 CE', 'A Christian meeting place at Dura-Europos', 'Dura-Europos, present-day Syria', 34.749, 40.728,
      'A building near the Euphrates was converted into a place of Christian worship. Its painted baptistery provides material evidence of an established community.',
      'Yale University Art Gallery', 'https://duraeuropos.artgallery.yale.edu/christian-building'],
    [314, 'By 314 CE', 'Christianity in the Armenian kingdom', 'Vagharshapat, present-day Armenia', 40.162, 44.294,
      'The Armenian kingdom adopted Christianity in the early fourth century. Surviving traditions place Gregory the Illuminator at the center of the conversion of the royal court.',
      'Metropolitan Museum of Art', 'https://www.metmuseum.org/ja/toah/ht/05/waa'],
    [340, 'Mid-4th century CE', 'Christianity takes root in Aksum', 'Aksum, present-day Ethiopia', 14.130, 38.720,
      'Aksum adopted Christianity during the reign of Ezana. The change appears on royal coins bearing crosses, and later church buildings attest its lasting place in the kingdom.',
      'Metropolitan Museum of Art', 'https://www.metmuseum.org/ko/essays/african-christianity-in-ethiopia'],
    [380, '380 CE', 'Imperial support for Nicene Christianity', 'Thessalonica, Roman Empire', 40.641, 22.937,
      'An imperial edict issued at Thessalonica made Nicene Christianity the official religious standard of the Roman Empire. Christian communities already existed across many imperial cities.',
      'Metropolitan Museum of Art', 'https://www.metmuseum.org/ja/toah/ht/05/waa'],
    [550, 'Mid-6th century CE', 'Christian communities on the Malabar Coast', 'Malabar Coast, present-day Kerala, India', 10.284, 76.178,
      'Cosmas Indicopleustes describes a church in a pepper-growing region usually identified with Malabar. His account also mentions Christians in Sri Lanka and a bishop appointed from Persia.',
      'Cosmas, Christian Topography, book 3', 'https://earlychristianwritings.com/fathers/cosmas_03_book3.html'],
    [597, '597 CE', 'Augustine’s mission in Kent', 'Canterbury, England', 51.279, 1.087,
      'Augustine and his companions established a base at Canterbury. Christianity had reached Roman Britain earlier, and other Christian communities continued in western Britain and Ireland.',
      'English Heritage', 'https://www.english-heritage.org.uk/visit/places/st-augustines-abbey/history-and-stories/history/'],
    [635, '635 CE', 'The Church of the East in Tang China', 'Chang’an (Xi’an), China', 34.265, 108.947,
      'The Xi’an stele, erected in 781, records the arrival of Alopen in 635. It attests the presence of East Syriac Christianity in Tang China and its connections along Asian trade routes.',
      'SOAS University of London research', 'https://eprints.soas.ac.uk/18057/1/Ashurov_3569.pdf'],
    [988, 'c. 988 CE', 'The baptism of Kyivan Rus’', 'Kyiv, present-day Ukraine', 50.454, 30.524,
      'Volodymyr adopted Byzantine Christianity and ordered a public baptism in Kyiv. Christian communities existed before this turning point, and adoption across Rus’ unfolded gradually.',
      'Internet Encyclopedia of Ukraine', 'https://www.encyclopediaofukraine.com/display.asp?linkpath=pages%5CC%5CH%5CChristianizationofUkraine.htm'],
    [1455, 'c. 1455 CE', 'The Gutenberg Bible', 'Mainz, Germany', 49.999, 8.271,
      'A Latin Bible printed with movable metal type in Mainz showed how printing could widen access to biblical texts. Its Latin text and production costs still shaped who could read it.',
      'Library of Congress', 'https://guides.loc.gov/gutenberg'],
    [1491, '1491 CE', 'The Kongo court adopts Christianity', 'Mbanza Kongo, present-day Angola', -6.267, 14.240,
      'Nzinga Nkuwu accepted baptism, and his successor Afonso I fostered Christian learning and correspondence. Kongo artists and thinkers developed local Christian forms.',
      'Metropolitan Museum of Art', 'https://www.metmuseum.org/exhibitions/listings/2015/kongo/blog/posts/kongo-christian-art'],
    [1524, '1524 CE', 'Franciscan missions in New Spain', 'Mexico City, Mexico', 19.433, -99.133,
      'Franciscans arrived in the early years of Spanish colonial rule. Conversion took place within unequal colonial power relations, and Indigenous peoples responded through adoption, adaptation, and resistance.',
      'UNESCO World Heritage nomination archive', 'https://whc.unesco.org/uploads/nominations/1466.pdf'],
    [1549, '1549 CE', 'Jesuit mission reaches Japan', 'Kagoshima, Japan', 31.594, 130.557,
      'Francis Xavier arrived at Kagoshima. Christian networks grew in parts of Japan, and some communities later maintained practices in secret through official prohibitions.',
      'UNESCO Memory of the World nomination archive', 'https://media.unesco.org/sites/default/files/webform/mow001/japan_spain_keicho.pdf'],
    [1565, '1565 CE', 'Spanish missions in the Philippines', 'Cebu, Philippines', 10.294, 123.902,
      'The Augustinians began a sustained Catholic mission in the Philippines within Spanish colonization. Filipino communities shaped how Christianity was practiced and passed on.',
      'UNESCO World Heritage nomination archive', 'https://whc.unesco.org/uploads/nominations/1466.pdf'],
    [1663, '1663 CE', 'A Bible in the Massachusett language', 'Cambridge, Massachusetts', 42.374, -71.116,
      'The Bible printed in Cambridge used the Massachusett language. It emerged from a colonial mission in which Indigenous speakers and printers helped create and produce the text.',
      'Library of Congress', 'https://tile.loc.gov/storage-services/service/rbc/rbc0001/2025/2025batch29029386/2025batch29029386.pdf'],
    [1814, '1814 CE', 'An early mission in Aotearoa New Zealand', 'Rangihoua, Bay of Islands', -35.108, 174.109,
      'Ngāpuhi leader Ruatara helped establish a Church Missionary Society settlement at Rangihoua and interpreted Samuel Marsden’s first sermon there.',
      'Manatū Taonga · New Zealand History', 'https://nzhistory.govt.nz/samuel-marsden-conducts-nzs-first-christian-service'],
    [1906, '1906 CE', 'The Azusa Street Revival', 'Los Angeles, California', 34.047, -118.239,
      'A revival led by William J. Seymour brought visitors to Los Angeles. Participants and publications helped carry Pentecostal ideas across national borders.',
      'Flower Pentecostal Heritage Center · Assemblies of God', 'https://news.ag.org/en/article-repository/news/2021/03/this-week-in-ag-history--march-11-1916'],
    [1910, '1910 CE', 'Edinburgh World Missionary Conference', 'Edinburgh, Scotland', 55.949, -3.189,
      'Protestant mission societies met in Edinburgh to discuss cooperation. The conference became an important point of reference for later ecumenical and missionary organizations.',
      'Boston University Center for Global Christianity and Mission', 'https://www.bu.edu/cgcm/files/2022/08/AHundredYearsofMissionCooperation_Web.pdf']
  ].map(function (row, index) {
    return {
      year: row[0], date: row[1], title: row[2], place: row[3], lat: row[4], lon: row[5],
      note: row[6], source: row[7], url: row[8], site: 'christianity_' + index
    };
  });

  return { milestones: milestones, sites: Object.fromEntries(milestones.map(function (event) {
    return [event.site, event];
  })) };
})();

var NOVUM_MOSES_JOURNEY = (function () {
  'use strict';

  var sites = {};
  function place(id, title, country, lat, lon, approximate) {
    sites['moses_' + id] = { title: title, country: country, lat: lat, lon: lon, approximate: Boolean(approximate) };
  }
  function stop(site, title, passage, note, analysis, breakRoute) {
    return { site: site && 'moses_' + site, title: title, passage: passage, note: note, analysis: analysis, breakRoute: breakRoute };
  }

  place('delta', 'Eastern Nile Delta', 'Egypt', 30.811, 31.702, true);
  place('midian', 'Midian region', 'Northwest Arabia', 28.483, 35.006, true);
  place('sinai', 'Mount Sinai · traditional site', 'Southern Sinai', 28.539, 33.975, true);
  place('rameses', 'Rameses · Qantir area', 'Eastern Nile Delta', 30.798, 31.833);
  place('succoth', 'Succoth · Wadi Tumilat area', 'Eastern Nile Delta', 30.556, 32.023, true);
  place('sin', 'Wilderness of Sin · regional anchor', 'Sinai Peninsula', 29.087, 33.184, true);
  place('kadesh', 'Kadesh-barnea · proposed site', 'ʿAin Qudeirat area', 30.646, 34.423, true);
  place('zered', 'Zered · traditional identification', 'Wadi al-Hasa, Jordan', 30.983, 35.749, true);
  place('arnon', 'Arnon valley', 'Wadi Mujib, Jordan', 31.439, 35.816);
  place('dibon', 'Dibon', 'Dhiban, Jordan', 31.501, 35.779);
  place('moab', 'Plains of Moab', 'East of the Jordan near Jericho', 31.844, 35.581, true);
  place('nebo', 'Mount Nebo', 'Moab, present-day Jordan', 31.768, 35.726);

  return {
    title: 'Moses’ journey',
    sites: sites,
    towns: {
      moses_delta: 'Eastern Nile Delta', moses_midian: 'Midian', moses_sinai: 'Sinai · traditional site',
      moses_rameses: 'Rameses', moses_succoth: 'Succoth region', moses_sin: 'Wilderness of Sin',
      moses_kadesh: 'Kadesh-barnea', moses_zered: 'Zered valley', moses_arnon: 'Arnon valley',
      moses_dibon: 'Dibon', moses_moab: 'Plains of Moab', moses_nebo: 'Mount Nebo'
    },
    roads: {
      'delta:midian': [[30.6, 32.2], [30.5, 33.6], [30.2, 34.7], [29.59, 35.04]],
      'midian:sinai': [[29.55, 35.04], [29.65, 34.65], [29.23, 34.42], [28.88, 34.13]],
      'sinai:delta': [[29.1, 33.5], [29.55, 33.04], [30.15, 32.58], [30.55, 32.22]],
      'sinai:kadesh': [[28.86, 34.16], [29.21, 34.22], [29.74, 34.32], [30.20, 34.40]]
    },
    sources: [
      ['Numbers 33 · wilderness itinerary', 'https://www.biblegateway.com/passage/?search=Numbers+33&version=NRSVUE'],
      ['Research on the itinerary’s desert place-names', 'https://ri.conicet.gov.ar/bitstream/handle/11336/183367/CONICET_Digital_Nro.3cf3fe29-876d-43db-81ec-1f31484a3a06_B.pdf?isAllowed=n&sequence=2']
    ],
    missions: [
      {
        label: 'Egypt, Midian, and the call', shortLabel: 'Early life', passage: 'Exodus 1–4',
        description: 'Moses grows up in Egypt, flees to Midian, and returns after receiving his call. The map uses regional anchors for places the story leaves unnamed.',
        stops: [
          stop('delta', 'Moses is born in Egypt', 'Exodus 1:22–2:10', 'Moses’ mother hides him and sets him among the reeds. Pharaoh’s daughter finds him and raises him.', 'The narrative names the Nile but gives no precise birthplace or location for Pharaoh’s household.'),
          stop('midian', 'Moses flees to Midian', 'Exodus 2:11–25', 'After killing an Egyptian who was beating a Hebrew, Moses flees to Midian. He helps the daughters of a priest and marries Zipporah.', 'Midian is a regional name. The well and settlement are unnamed.'),
          stop('sinai', 'The burning bush', 'Exodus 3:1–4:17', 'At Horeb, Moses receives a commission to return to Egypt and lead the Israelites out.', 'The pin uses the later Jebel Musa tradition for the mountain of God. The biblical location remains debated.'),
          stop('delta', 'Moses returns to Egypt', 'Exodus 4:18–31', 'Moses returns and, with Aaron, tells the elders what God has promised.', 'The story frames the return as the start of a public mission. The meeting place in Egypt is unspecified.')
        ]
      },
      {
        label: 'Passover and the Exodus', shortLabel: 'Exodus', passage: 'Exodus 5–19 · Numbers 33:3–15',
        description: 'The story moves from forced labor and the Passover through departure, the sea crossing, and arrival at Sinai. Locations and connecting lines are approximate.',
        stops: [
          stop('rameses', 'Passover and departure from Rameses', 'Exodus 12:1–42 · Numbers 33:3–5', 'Israel keeps the Passover and departs from Rameses. Numbers begins its wilderness itinerary at Rameses.', 'The Qantir area is associated with Pi-Ramesses. The pin locates the named city, while the event comes from the biblical account.'),
          stop('succoth', 'Camp at Succoth', 'Exodus 12:37–39 · Numbers 33:5–6', 'The itinerary names Succoth as the first camp after Rameses.', 'The eastern Delta and Wadi Tumilat are possible settings. The specific camp is uncertain.'),
          stop(null, 'Crossing the sea', 'Exodus 14–15', 'The Israelites pass through the sea, and the story follows the crossing with songs of deliverance.', 'The Hebrew name Yam Suph is often rendered Sea of Reeds. The crossing site remains disputed.', true),
          stop('sin', 'Manna in the wilderness', 'Exodus 16:1–36', 'In the wilderness of Sin, the people gather manna and receive instructions about rest on the seventh day.', 'Exodus places this camp between Elim and Sinai. The marker represents a broad Sinai region.'),
          stop('sinai', 'The covenant at Sinai', 'Exodus 19–20 · Exodus 24', 'The people camp near Sinai, where Moses receives the commandments and the covenant is confirmed.', 'Jebel Musa is a traditional site. Other identifications have been proposed.')
        ]
      },
      {
        label: 'Sinai, Kadesh, and the wilderness', shortLabel: 'Wilderness', passage: 'Numbers 10–14 · Numbers 20',
        description: 'Numbers follows the departure from Sinai, the spies’ report, and the return to Kadesh. Several camps lie between the map anchors.',
        stops: [
          stop('sinai', 'Departure from Sinai', 'Numbers 10:11–36', 'The cloud lifts from the tabernacle and the Israelites set out from Sinai.', 'The map links broad regions. The itinerary lists intermediate stops and camps whose locations remain uncertain.'),
          stop('kadesh', 'The spies return to Kadesh', 'Numbers 13:1–3 · Numbers 13:25–33', 'Scouts survey Canaan and return with conflicting assessments of what the people should do.', 'The text locates the report at Kadesh. ʿAin Qudeirat is a proposed identification for Kadesh-barnea.'),
          stop('kadesh', 'The years in the wilderness', 'Numbers 14:20–35', 'After the people refuse to enter the land, Numbers describes a generation remaining in the wilderness.', 'The stop represents the decision in the story. The intervening journeys span multiple camps.'),
          stop('kadesh', 'Water at Meribah and Edom’s refusal', 'Numbers 20:1–21', 'At Kadesh, Moses strikes the rock when the people need water. Edom then refuses permission for Israel to pass through.', 'The account brings the themes of water, leadership, and passage together at Kadesh.')
        ]
      },
      {
        label: 'Moab and Mount Nebo', shortLabel: 'Mount Nebo', passage: 'Numbers 21–22 · Numbers 33:41–49 · Deuteronomy 34',
        description: 'The final phase follows the route east of the Dead Sea into Moab, where Moses sees the land from Mount Nebo.',
        stops: [
          stop('zered', 'Crossing the Zered', 'Numbers 21:10–12 · Deuteronomy 2:13–15', 'After traveling around Edom, the Israelites cross the Zered brook.', 'The Zered is often associated with Wadi al-Hasa. The specific crossing is unknown.'),
          stop('arnon', 'Along the Arnon', 'Numbers 21:13–24', 'The people camp beyond the Arnon and later seek passage through the territory of Sihon.', 'The narrative treats the Arnon as a boundary. The pin marks the valley in general.'),
          stop('dibon', 'Camp at Dibon-gad', 'Numbers 33:44–46', 'The wilderness itinerary lists Dibon-gad among the final camps.', 'The map associates the name with Dhiban in present-day Jordan. The camp itself is not located precisely.'),
          stop('moab', 'The plains of Moab', 'Numbers 22:1 · Numbers 33:48–49 · Deuteronomy 1:1–5', 'Israel camps opposite Jericho. Deuteronomy frames Moses’ addresses to Israel east of the Jordan.', 'The plain is a regional marker for the encampment and speeches.'),
          stop('nebo', 'Moses looks out from Mount Nebo', 'Deuteronomy 34:1–12', 'Moses goes up from the plains of Moab, sees the land, and dies before Israel crosses the Jordan.', 'The journey ends at Nebo. Deuteronomy leaves Moses’ burial place unknown.')
        ]
      }
    ]
  };
})();
