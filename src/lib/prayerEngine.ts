/**
 * The PrayCircle prayer engine.
 *
 * Reads a prayer intention, detects what it is about and produces a
 * fitting Catholic prayer in the reader's language.
 *
 * If ANTHROPIC_API_KEY is configured, a bespoke prayer is generated with
 * Claude; otherwise a built-in composer assembles a fitting prayer from
 * hand-written liturgical texts. Results are cached per post & language.
 */

export type Lang = "en" | "de" | "it";

export type Category =
  | "exam"
  | "health"
  | "grief"
  | "family"
  | "work"
  | "baby"
  | "travel"
  | "addiction"
  | "relationship"
  | "money"
  | "peace"
  | "disaster"
  | "thanksgiving"
  | "faith"
  | "general";

const KEYWORDS: Record<Exclude<Category, "general">, string[]> = {
  exam: [
    "exam", "test", "school", "study", "studies", "university", "college",
    "grade", "grades", "homework", "thesis", "degree", "graduation", "quiz",
    "prüfung", "klausur", "schule", "studium", "lernen", "abitur", "matura", "note", "noten", "uni",
    "esame", "esami", "scuola", "studio", "università", "laurea", "voto", "compito", "maturità",
  ],
  health: [
    "sick", "ill", "illness", "cancer", "surgery", "hospital", "healing", "health",
    "recovery", "pain", "disease", "diagnosis", "operation", "treatment", "doctor", "injury", "depression", "anxiety",
    "krank", "krankheit", "krebs", "operation", "krankenhaus", "heilung", "gesundheit", "schmerzen", "arzt", "verletzung", "angst",
    "malato", "malata", "malattia", "cancro", "tumore", "ospedale", "guarigione", "salute", "dolore", "intervento", "medico", "ansia", "depressione",
  ],
  grief: [
    "died", "death", "passed away", "funeral", "grief", "mourning", "loss", "lost my", "in heaven", "soul of", "rest in peace",
    "gestorben", "tod", "beerdigung", "trauer", "verstorben", "verloren", "im himmel", "seele",
    "morto", "morta", "morte", "funerale", "lutto", "defunto", "defunta", "anima", "in cielo", "scomparso",
  ],
  baby: [
    "pregnant", "pregnancy", "baby", "birth", "newborn", "expecting", "unborn", "infant",
    "schwanger", "schwangerschaft", "geburt", "neugeboren", "säugling",
    "incinta", "gravidanza", "bambino", "bambina", "neonato", "neonata", "parto", "nascita",
  ],
  family: [
    "family", "mother", "father", "mom", "dad", "sister", "brother", "son", "daughter",
    "grandma", "grandpa", "grandmother", "grandfather", "parents", "aunt", "uncle", "cousin",
    "familie", "mutter", "vater", "mama", "papa", "schwester", "bruder", "sohn", "tochter", "oma", "opa", "eltern", "tante", "onkel",
    "famiglia", "madre", "padre", "mamma", "papà", "sorella", "fratello", "figlio", "figlia", "nonna", "nonno", "genitori", "zia", "zio", "cugino",
  ],
  work: [
    "job", "work", "interview", "career", "unemployed", "employment", "boss", "business", "promotion", "hired",
    "arbeit", "job", "vorstellungsgespräch", "arbeitslos", "beruf", "karriere", "chef", "firma",
    "lavoro", "colloquio", "disoccupato", "disoccupata", "carriera", "impiego", "azienda", "capo",
  ],
  travel: [
    "travel", "trip", "journey", "flight", "flying", "safe travels", "moving", "vacation", "abroad", "voyage",
    "reise", "flug", "umzug", "urlaub", "ausland", "fahrt",
    "viaggio", "volo", "vacanza", "trasferimento", "estero", "partenza",
  ],
  addiction: [
    "addiction", "addicted", "alcohol", "alcoholic", "drugs", "gambling", "sober", "sobriety", "smoking", "relapse",
    "sucht", "süchtig", "alkohol", "drogen", "spielsucht", "rauchen", "nüchtern",
    "dipendenza", "alcol", "droga", "droghe", "gioco d'azzardo", "fumo", "sobrio", "sobria",
  ],
  relationship: [
    "marriage", "wedding", "divorce", "relationship", "boyfriend", "girlfriend", "husband", "wife",
    "engaged", "breakup", "broken heart", "love", "reconcile", "reconciliation", "lonely", "loneliness",
    "ehe", "hochzeit", "scheidung", "beziehung", "freund", "freundin", "mann", "frau", "verlobt", "trennung", "liebe", "einsam", "einsamkeit", "versöhnung",
    "matrimonio", "nozze", "divorzio", "relazione", "fidanzato", "fidanzata", "marito", "moglie", "amore", "solitudine", "riconciliazione", "lasciato", "lasciata",
  ],
  money: [
    "money", "debt", "debts", "financial", "finances", "rent", "bills", "poverty", "eviction", "afford",
    "geld", "schulden", "finanzen", "miete", "rechnungen", "armut",
    "soldi", "debiti", "debito", "finanze", "affitto", "bollette", "povertà",
  ],
  peace: [
    "war", "peace", "conflict", "ukraine", "violence", "refugees", "world", "country", "nation", "attack", "soldiers",
    "krieg", "frieden", "konflikt", "gewalt", "flüchtlinge", "welt", "land", "soldaten",
    "guerra", "pace", "conflitto", "violenza", "rifugiati", "mondo", "paese", "soldati",
  ],
  disaster: [
    "earthquake", "tsunami", "flood", "flooding", "hurricane", "cyclone", "typhoon",
    "tornado", "wildfire", "volcano", "eruption", "landslide", "drought", "storm", "disaster",
    "erdbeben", "flut", "hochwasser", "wirbelsturm", "waldbrand", "vulkan", "erdrutsch", "dürre", "sturm", "katastrophe",
    "terremoto", "alluvione", "inondazione", "uragano", "ciclone", "tifone", "incendio", "vulcano", "eruzione", "frana", "siccità", "tempesta", "disastro",
  ],
  thanksgiving: [
    "thank", "thanks", "thankful", "grateful", "gratitude", "blessing", "blessed", "praise",
    "danke", "dankbar", "dankbarkeit", "segen", "gesegnet", "lob",
    "grazie", "ringraziare", "ringraziamento", "grato", "grata", "benedizione", "lode",
  ],
  faith: [
    "faith", "conversion", "convert", "baptism", "confirmation", "first communion", "vocation",
    "priest", "doubt", "doubts", "believe", "prayer life", "return to church", "confession", "sacrament",
    "glaube", "glauben", "bekehrung", "taufe", "firmung", "kommunion", "berufung", "priester", "zweifel", "beichte", "kirche",
    "fede", "conversione", "battesimo", "cresima", "comunione", "vocazione", "sacerdote", "dubbi", "confessione", "chiesa",
  ],
};

export function detectCategory(text: string): Category {
  const lower = ` ${text.toLowerCase()} `;
  let best: Category = "general";
  let bestScore = 0;
  for (const [category, words] of Object.entries(KEYWORDS)) {
    let score = 0;
    for (const word of words) {
      if (lower.includes(word.toLowerCase())) score += word.length > 5 ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = category as Category;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Built-in composer: opening + category heart + closing               */
/* ------------------------------------------------------------------ */

const OPENINGS: Record<Lang, string[]> = {
  en: [
    "Heavenly Father, we come before You united in prayer, lifting up our brother or sister who has entrusted this intention to us.",
    "Lord Jesus, You told us that where two or three are gathered in Your name, You are there among them. We gather now around this intention.",
    "Loving God, source of all comfort and strength, hear the prayer we offer today for one of Your children.",
    "Almighty and merciful God, You know every heart and every need before a word is spoken. We bring this intention before Your throne of grace.",
  ],
  de: [
    "Himmlischer Vater, vereint im Gebet treten wir vor Dich und bringen Dir das Anliegen unseres Bruders oder unserer Schwester.",
    "Herr Jesus, Du hast gesagt: Wo zwei oder drei in Deinem Namen versammelt sind, da bist Du mitten unter ihnen. So versammeln wir uns nun um dieses Anliegen.",
    "Liebender Gott, Quelle allen Trostes und aller Kraft, erhöre das Gebet, das wir heute für eines Deiner Kinder sprechen.",
    "Allmächtiger, barmherziger Gott, Du kennst jedes Herz und jede Not, noch bevor ein Wort gesprochen ist. Wir legen dieses Anliegen vor Deinen Thron der Gnade.",
  ],
  it: [
    "Padre celeste, veniamo davanti a Te uniti nella preghiera, presentandoti l'intenzione di un nostro fratello o di una nostra sorella.",
    "Signore Gesù, Tu hai detto che dove due o tre sono riuniti nel Tuo nome, Tu sei in mezzo a loro. Ci riuniamo ora attorno a questa intenzione.",
    "Dio d'amore, fonte di ogni consolazione e di ogni forza, ascolta la preghiera che oggi offriamo per uno dei Tuoi figli.",
    "Dio onnipotente e misericordioso, Tu conosci ogni cuore e ogni necessità prima ancora che una parola sia pronunciata. Portiamo questa intenzione davanti al Tuo trono di grazia.",
  ],
};

const HEARTS: Record<Category, Record<Lang, string>> = {
  exam: {
    en: "Grant them a clear mind, a calm heart and perseverance in their studies. Send Your Holy Spirit, the Spirit of wisdom and understanding, to help them remember what they have learned and to express it with confidence. Free them from anxiety, and let them feel that their worth rests not on results but on Your unchanging love.",
    de: "Schenke ihnen einen klaren Verstand, ein ruhiges Herz und Ausdauer beim Lernen. Sende Deinen Heiligen Geist, den Geist der Weisheit und der Einsicht, damit sie sich an das Gelernte erinnern und es mit Zuversicht wiedergeben können. Befreie sie von aller Angst und lass sie spüren, dass ihr Wert nicht von Ergebnissen abhängt, sondern in Deiner unwandelbaren Liebe ruht.",
    it: "Dona loro una mente lucida, un cuore sereno e perseveranza nello studio. Manda il Tuo Santo Spirito, Spirito di sapienza e di intelletto, perché ricordino ciò che hanno imparato e lo esprimano con fiducia. Liberali dall'ansia e fa' che sentano che il loro valore non dipende dai risultati, ma dal Tuo amore che non cambia.",
  },
  health: {
    en: "Lord, You healed the sick who were brought to You and You carry our sufferings as Your own. Lay Your gentle hand upon the one who is ill: ease their pain, strengthen their body, and give wisdom to the doctors and nurses who care for them. Grant peace to those who watch and worry, and let hope shine even in the longest night.",
    de: "Herr, Du hast die Kranken geheilt, die man zu Dir brachte, und Du trägst unsere Leiden wie Deine eigenen. Lege Deine sanfte Hand auf den Menschen, der krank ist: lindere seine Schmerzen, stärke seinen Leib und schenke den Ärzten und Pflegenden Weisheit. Gib Frieden allen, die wachen und sich sorgen, und lass die Hoffnung selbst in der längsten Nacht leuchten.",
    it: "Signore, Tu hai guarito i malati che venivano portati a Te e porti le nostre sofferenze come fossero Tue. Poni la Tua mano gentile su chi è malato: allevia il suo dolore, fortifica il suo corpo e dona sapienza ai medici e agli infermieri che lo curano. Concedi pace a chi veglia e si preoccupa, e fa' risplendere la speranza anche nella notte più lunga.",
  },
  grief: {
    en: "Receive into Your merciful arms the soul of the departed, and let perpetual light shine upon them. Comfort all who mourn: hold them in their sorrow, dry their tears, and give them the sure hope of the resurrection, where every tear will be wiped away and those who love each other will be reunited in Your presence.",
    de: "Nimm die Seele des Verstorbenen in Deine barmherzigen Arme auf, und das ewige Licht leuchte ihr. Tröste alle, die trauern: Halte sie in ihrem Schmerz, trockne ihre Tränen und schenke ihnen die feste Hoffnung auf die Auferstehung, wo jede Träne abgewischt wird und die, die einander lieben, in Deiner Gegenwart wieder vereint sind.",
    it: "Accogli tra le Tue braccia misericordiose l'anima del defunto, e splenda ad essa la luce perpetua. Consola tutti coloro che sono nel lutto: sostienili nel dolore, asciuga le loro lacrime e dona loro la ferma speranza della risurrezione, dove ogni lacrima sarà asciugata e coloro che si amano saranno riuniti alla Tua presenza.",
  },
  family: {
    en: "Bless this family and every member of it. Where there is distance, draw hearts together; where there are wounds, bring healing; where there is worry, give peace. Holy Family of Nazareth — Jesus, Mary and Joseph — watch over this home, protect it from all harm, and make it a place of love, patience and forgiveness.",
    de: "Segne diese Familie und jedes ihrer Mitglieder. Wo Entfernung ist, führe die Herzen zusammen; wo Wunden sind, bringe Heilung; wo Sorge ist, schenke Frieden. Heilige Familie von Nazaret — Jesus, Maria und Josef — wacht über dieses Zuhause, beschützt es vor allem Übel und macht es zu einem Ort der Liebe, der Geduld und der Vergebung.",
    it: "Benedici questa famiglia e ciascuno dei suoi membri. Dove c'è distanza, avvicina i cuori; dove ci sono ferite, porta guarigione; dove c'è preoccupazione, dona pace. Santa Famiglia di Nazaret — Gesù, Maria e Giuseppe — vegliate su questa casa, proteggetela da ogni male e rendetela un luogo di amore, pazienza e perdono.",
  },
  work: {
    en: "You know their need for good and honest work. Open the right doors, guide their steps, and give them favor in the eyes of those they meet. Grant them patience while they wait, courage when they are discouraged, and the certainty that You provide for Your children as You clothe the lilies of the field.",
    de: "Du kennst ihr Bedürfnis nach guter und ehrlicher Arbeit. Öffne die richtigen Türen, lenke ihre Schritte und lass sie Wohlwollen finden bei den Menschen, denen sie begegnen. Schenke ihnen Geduld im Warten, Mut in der Entmutigung und die Gewissheit, dass Du für Deine Kinder sorgst, wie Du die Lilien auf dem Feld kleidest.",
    it: "Tu conosci il loro bisogno di un lavoro buono e onesto. Apri le porte giuste, guida i loro passi e dona loro favore agli occhi delle persone che incontrano. Concedi loro pazienza nell'attesa, coraggio nello scoraggiamento e la certezza che Tu provvedi ai Tuoi figli come vesti i gigli del campo.",
  },
  baby: {
    en: "Creator of life, watch over this mother and the little one she carries. Protect them both, guide every stage of growth and every moment of birth, and surround them with skilled and gentle hands. Mary, Mother of God, who carried the Savior beneath your heart, wrap this family in your mantle.",
    de: "Schöpfer des Lebens, wache über diese Mutter und das Kind, das sie trägt. Beschütze beide, begleite jede Phase des Wachsens und jeden Augenblick der Geburt, und umgib sie mit geschickten und sanften Händen. Maria, Mutter Gottes, die Du den Erlöser unter Deinem Herzen getragen hast, hülle diese Familie in Deinen Schutzmantel.",
    it: "Creatore della vita, veglia su questa madre e sul piccolo che porta in grembo. Proteggili entrambi, accompagna ogni tappa della crescita e ogni momento della nascita, e circondali di mani esperte e delicate. Maria, Madre di Dio, che hai portato il Salvatore sotto il tuo cuore, avvolgi questa famiglia nel tuo manto.",
  },
  travel: {
    en: "Be their companion on the road, as You walked beside the disciples on the way to Emmaus. Send Your holy angels to guard every mile of the journey, keep danger far from their path, and bring them safely to their destination and safely home again to those who love them.",
    de: "Sei ihr Begleiter auf dem Weg, wie Du an der Seite der Jünger nach Emmaus gegangen bist. Sende Deine heiligen Engel, um jede Meile der Reise zu behüten, halte Gefahr fern von ihrem Weg und führe sie sicher ans Ziel und sicher wieder heim zu denen, die sie lieben.",
    it: "Sii il loro compagno di viaggio, come camminasti accanto ai discepoli sulla via di Emmaus. Manda i Tuoi santi angeli a custodire ogni miglio del cammino, tieni lontano il pericolo dalla loro strada e portali sani e salvi a destinazione e di nuovo a casa da chi li ama.",
  },
  addiction: {
    en: "Lord, You came to set captives free. Break every chain that binds this person, give them strength for each single day, and courage to accept help. When temptation returns, be their refuge; when they stumble, lift them up without shame. Restore what has been lost and renew their hope.",
    de: "Herr, Du bist gekommen, um Gefangene zu befreien. Zerbrich jede Kette, die diesen Menschen bindet, gib ihm Kraft für jeden einzelnen Tag und den Mut, Hilfe anzunehmen. Wenn die Versuchung wiederkehrt, sei seine Zuflucht; wenn er strauchelt, richte ihn ohne Scham wieder auf. Stelle wieder her, was verloren ging, und erneuere seine Hoffnung.",
    it: "Signore, Tu sei venuto a liberare i prigionieri. Spezza ogni catena che lega questa persona, donale forza per ogni singolo giorno e il coraggio di accettare aiuto. Quando la tentazione ritorna, sii il suo rifugio; quando inciampa, rialzala senza vergogna. Ristora ciò che è andato perduto e rinnova la sua speranza.",
  },
  relationship: {
    en: "God of love, You created our hearts for communion. Heal what is wounded in this relationship, soften what has hardened, and teach both hearts patience, humility and forgiveness. Where a path together is Your will, unite them more deeply; and in every case, fill this heart with the peace that only You can give.",
    de: "Gott der Liebe, Du hast unsere Herzen für die Gemeinschaft geschaffen. Heile, was in dieser Beziehung verwundet ist, mache weich, was hart geworden ist, und lehre beide Herzen Geduld, Demut und Vergebung. Wo ein gemeinsamer Weg Dein Wille ist, vereine sie tiefer; und in jedem Fall erfülle dieses Herz mit dem Frieden, den nur Du geben kannst.",
    it: "Dio dell'amore, Tu hai creato i nostri cuori per la comunione. Guarisci ciò che è ferito in questa relazione, ammorbidisci ciò che si è indurito e insegna a entrambi i cuori pazienza, umiltà e perdono. Dove un cammino insieme è la Tua volontà, uniscili più profondamente; e in ogni caso riempi questo cuore della pace che solo Tu puoi dare.",
  },
  money: {
    en: "Provider of all good things, You see this burden of need and worry. Open unexpected doors of provision, give wisdom in every decision, and send generous hearts to help. Free them from the fear that crushes, and let them trust that not even a sparrow falls without Your Father's knowledge.",
    de: "Geber aller guten Gaben, Du siehst diese Last der Not und der Sorge. Öffne unerwartete Türen der Versorgung, schenke Weisheit in jeder Entscheidung und sende großzügige Herzen zur Hilfe. Befreie sie von der Angst, die erdrückt, und lass sie darauf vertrauen, dass nicht einmal ein Spatz zu Boden fällt, ohne dass der Vater es weiß.",
    it: "Datore di ogni bene, Tu vedi questo peso di necessità e preoccupazione. Apri porte inattese di provvidenza, dona saggezza in ogni decisione e manda cuori generosi in aiuto. Liberali dalla paura che schiaccia e fa' che confidino che nemmeno un passero cade a terra senza che il Padre lo sappia.",
  },
  peace: {
    en: "Prince of Peace, look upon our wounded world. Silence the weapons, soften the hearts of those who wage war, and protect the innocent, the refugees and all who suffer. Make each of us an instrument of Your peace, so that hatred may be overcome by love and darkness by Your light.",
    de: "Fürst des Friedens, blicke auf unsere verwundete Welt. Lass die Waffen schweigen, erweiche die Herzen derer, die Krieg führen, und beschütze die Unschuldigen, die Flüchtlinge und alle Leidenden. Mache jeden von uns zu einem Werkzeug Deines Friedens, damit der Hass durch die Liebe besiegt wird und die Finsternis durch Dein Licht.",
    it: "Principe della Pace, guarda il nostro mondo ferito. Fa' tacere le armi, ammorbidisci i cuori di chi fa la guerra e proteggi gli innocenti, i rifugiati e tutti coloro che soffrono. Rendi ciascuno di noi uno strumento della Tua pace, perché l'odio sia vinto dall'amore e le tenebre dalla Tua luce.",
  },
  disaster: {
    en: "Lord of heaven and earth, look with mercy on all who are struck by this catastrophe. Rescue those who are trapped, comfort those who have lost their homes or their loved ones, and give strength and courage to the rescuers and helpers. Move the hearts of the world to generous aid, and in the midst of the ruins let Your hope rise stronger than fear.",
    de: "Herr des Himmels und der Erde, blicke voll Erbarmen auf alle, die von dieser Katastrophe getroffen wurden. Rette die Verschütteten, tröste alle, die ihr Zuhause oder ihre Lieben verloren haben, und gib den Rettern und Helfern Kraft und Mut. Bewege die Herzen der Welt zu großzügiger Hilfe, und lass mitten in den Trümmern Deine Hoffnung stärker aufsteigen als die Angst.",
    it: "Signore del cielo e della terra, guarda con misericordia tutti coloro che sono stati colpiti da questa catastrofe. Salva chi è intrappolato, consola chi ha perso la casa o i propri cari, e dona forza e coraggio ai soccorritori. Muovi i cuori del mondo a un aiuto generoso, e in mezzo alle macerie fa' sorgere la Tua speranza più forte della paura.",
  },
  thanksgiving: {
    en: "We join our brother or sister in giving You thanks and praise. Every good gift comes from Your hand, and today we remember it with joy. Let gratitude grow in all our hearts, and may this blessing bear fruit that lasts, for the good of many and the glory of Your name.",
    de: "Wir schließen uns unserem Bruder oder unserer Schwester an und sagen Dir Dank und Lob. Jede gute Gabe kommt aus Deiner Hand, und heute erinnern wir uns dessen mit Freude. Lass die Dankbarkeit in allen unseren Herzen wachsen, und möge dieser Segen Frucht bringen, die bleibt — zum Wohl vieler und zur Ehre Deines Namens.",
    it: "Ci uniamo al nostro fratello o alla nostra sorella nel renderTi grazie e lode. Ogni dono buono viene dalla Tua mano, e oggi lo ricordiamo con gioia. Fa' crescere la gratitudine in tutti i nostri cuori, e che questa benedizione porti frutto duraturo, per il bene di molti e la gloria del Tuo nome.",
  },
  faith: {
    en: "Good Shepherd, You never stop seeking the hearts You love. Strengthen the faith behind this intention: enlighten every doubt, rekindle the joy of prayer, and draw this soul closer to You through Your Word and Your sacraments. Let them experience that whoever seeks You has already been found by You.",
    de: "Guter Hirte, Du hörst nie auf, die Herzen zu suchen, die Du liebst. Stärke den Glauben, der hinter diesem Anliegen steht: Erleuchte jeden Zweifel, entzünde neu die Freude am Gebet und ziehe diese Seele durch Dein Wort und Deine Sakramente näher zu Dir. Lass sie erfahren: Wer Dich sucht, ist von Dir längst gefunden.",
    it: "Buon Pastore, Tu non smetti mai di cercare i cuori che ami. Rafforza la fede dietro questa intenzione: illumina ogni dubbio, riaccendi la gioia della preghiera e attira quest'anima più vicino a Te attraverso la Tua Parola e i Tuoi sacramenti. Fa' che sperimenti che chi Ti cerca è già stato trovato da Te.",
  },
  general: {
    en: "You know the full depth of this intention, even the parts that words cannot carry. Give what is truly needed: light for the next step, strength for the burden, healing for the hidden wound, and the quiet certainty of Your presence. May Your will be done in this situation, for Your will is always love.",
    de: "Du kennst die ganze Tiefe dieses Anliegens, auch das, was Worte nicht fassen können. Gib, was wirklich nötig ist: Licht für den nächsten Schritt, Kraft für die Last, Heilung für die verborgene Wunde und die stille Gewissheit Deiner Gegenwart. Dein Wille geschehe in dieser Situation — denn Dein Wille ist immer Liebe.",
    it: "Tu conosci tutta la profondità di questa intenzione, anche ciò che le parole non riescono a portare. Dona ciò che è veramente necessario: luce per il prossimo passo, forza per il peso, guarigione per la ferita nascosta e la quieta certezza della Tua presenza. Sia fatta la Tua volontà in questa situazione, perché la Tua volontà è sempre amore.",
  },
};

const CLOSINGS: Record<Lang, string[]> = {
  en: [
    "Mary, Mother of the Church, intercede for this intention. We ask all this through Christ our Lord.",
    "We entrust this intention to Your Sacred Heart, confident that no prayer offered in love is ever lost. Through Christ our Lord.",
    "United with brothers and sisters praying around the world, we place this intention in Your hands. Through Christ our Lord.",
    "Holy Mary, refuge of those who hope, present this prayer to your Son. We ask it in the name of Jesus.",
  ],
  de: [
    "Maria, Mutter der Kirche, tritt für dieses Anliegen ein. Darum bitten wir durch Christus, unseren Herrn.",
    "Wir vertrauen dieses Anliegen Deinem Heiligsten Herzen an, gewiss, dass kein Gebet, das in Liebe gesprochen wird, jemals verloren geht. Durch Christus, unseren Herrn.",
    "Vereint mit Brüdern und Schwestern, die auf der ganzen Welt beten, legen wir dieses Anliegen in Deine Hände. Durch Christus, unseren Herrn.",
    "Heilige Maria, Zuflucht der Hoffenden, trage dieses Gebet zu Deinem Sohn. Darum bitten wir im Namen Jesu.",
  ],
  it: [
    "Maria, Madre della Chiesa, intercedi per questa intenzione. Te lo chiediamo per Cristo nostro Signore.",
    "Affidiamo questa intenzione al Tuo Sacro Cuore, certi che nessuna preghiera offerta con amore va mai perduta. Per Cristo nostro Signore.",
    "Uniti ai fratelli e alle sorelle che pregano in tutto il mondo, mettiamo questa intenzione nelle Tue mani. Per Cristo nostro Signore.",
    "Santa Maria, rifugio di chi spera, presenta questa preghiera al Tuo Figlio. Te lo chiediamo nel nome di Gesù.",
  ],
};

function seededIndex(seed: string, salt: string, max: number): number {
  let hash = 0;
  const input = seed + salt;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % max;
}

export function composePrayer(category: Category, lang: Lang, seed: string): string {
  const opening = OPENINGS[lang][seededIndex(seed, "open", OPENINGS[lang].length)];
  const heart = HEARTS[category][lang];
  const closing = CLOSINGS[lang][seededIndex(seed, "close", CLOSINGS[lang].length)];
  return `${opening}\n\n${heart}\n\n${closing}`;
}

/* ------------------------------------------------------------------ */
/* Optional: bespoke prayer via Claude                                  */
/* ------------------------------------------------------------------ */

const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  de: "German",
  it: "Italian",
};

export async function generatePrayerWithAI(
  content: string,
  lang: Lang
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system:
          "You write Catholic intercessory prayers for a prayer app. Given a short prayer intention posted by a user, write one warm, reverent, theologically sound Catholic prayer (about 90-130 words) that fits the specific situation. Address God directly. You may invoke the intercession of Mary or a fitting saint. Do NOT end with the word 'Amen' (the user says it by tapping a button). Do NOT include any preamble, title or quotation marks — output only the prayer text. Write in the requested language.",
        messages: [
          {
            role: "user",
            content: `Prayer intention: "${content}"\n\nWrite the prayer in ${LANG_NAMES[lang]}.`,
          },
        ],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const text = data?.content?.[0]?.text;
    return typeof text === "string" && text.trim().length > 40
      ? text.trim()
      : null;
  } catch {
    return null;
  }
}
