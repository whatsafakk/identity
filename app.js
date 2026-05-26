"use strict";

// ── CONSTANTS ────────────────────────────────────────────

const STORAGE_KEY = 'mik-tool-v16-design-analysis';
const HISTORY_MAX = 50;

// V9: polierte Analyse-Oberfläche mit natürlicher Sprache, qualitativer Gewichtung und klar getrennten Ebenen.
// V6: lesbare Analyse-Logik mit konkreten Farben/Materialien und visueller Zusammenfassung.
// Diese Version hält die Datenbank bewusst eng: Quellen werden nur eingebaut,
// wenn sie die Beobachtung von Silhouette, Linie/Form, Farbe, Material,
// Detail/Konstruktion oder Kontext direkt präzisieren. Keine fixen Symboltabellen.
// Grundmodell: Beobachtung → Gestaltungswirkung → kontextabhängige Lesart.
const CORE_CATEGORIES = [
  'Silhouette / Körperform',
  'Linie / Form',
  'Farbe / Farbfamilie',
  'Farbwirkung / Tonwert',
  'Material / konkretes Material',
  'Material / Oberfläche',
  'Detail / Konstruktion',
  'Referenz / Kontext'
];

const THEORY_FRAMES = [
  { id: 'fashion-design', label: 'Fashion-Design-Analyse', source: 'Sue Jenkyn Jones; Jenny Udale', note: 'Körper, Silhouette, Proportion, Linie, Detail, Stoffwahl, Drape, Griff, Textur und Körperinteraktion werden als beobachtbare Designparameter behandelt.' },
  { id: 'visual-literacy', label: 'Visuelle Grundelemente', source: 'Gestaltungslehre; Dondis/Kandinsky/Wong als Rahmen', note: 'Linie, Form, Richtung, Fläche, Tonwert, Textur, Rhythmus und Bewegung strukturieren die sichtbare Wirkung eines Outfits.' },
  { id: 'color-storytelling', label: 'Farbtheorie und visuelles Erzählen', source: 'Itten; Patti Bellantoni', note: 'Farbe wird über Tonwert, Sättigung, Temperatur, Quantität, Akzent und narrative Einbettung gelesen — nicht als universelle Symbolik.' },
  { id: 'material-analysis', label: 'Textil- und Materialanalyse', source: 'Jenny Udale; Sue Jenkyn Jones', note: 'Faser, Konstruktion, Veredelung, Dichte, Glanz, Transparenz, Stretch, Griff, Fall und Gebrauch beeinflussen Körper- und Bedeutungswirkung.' },
  { id: 'costume-cinema', label: 'Filmische Kostüm- und Identitätsanalyse', source: 'Stella Bruzzi; Anne Hollander', note: 'Kleidung wird als Identitätskonstruktion und als bildlich wahrgenommener Körper gelesen; Kostüm ist nicht bloß dekoratives Zubehör.' },
  { id: 'fashion-semiotics', label: 'Mode als Zeichen- und Codesystem', source: 'Roland Barthes; Malcolm Barnard; Yuniya Kawamura', note: 'Bedeutung entsteht über Zeichen, Codes, Institutionen, soziale Kommunikation und Kontext — nicht durch isolierte Einzelteile.' },
  { id: 'anime-media', label: 'Anime-spezifische Bildlichkeit', source: 'Thomas LaMarre; Rayna Denison', note: 'Anime-Kostüm wird als gezeichnete/animierte Fläche, Linie, Layer, Bewegung und genreabhängiges Zeichen gelesen.' }
];

const SOURCE_TIERS = [
  {
    tier: 'Kernquellen für Datenbank-Begriffe',
    role: 'Diese Quellen liefern direkt beobachtbare Design-, Textil-, Farb- und Konstruktionsparameter.',
    sources: ['Jenny Udale – Textiles and Fashion', 'Sue Jenkyn Jones – Fashion Design', 'Patti Bellantoni – If It’s Purple, Someone’s Gonna Die']
  },
  {
    tier: 'Kernquellen für Methodik',
    role: 'Diese Quellen begründen, warum Kleidung nicht als fixe Symboltabelle, sondern als Zeichen-, Wahrnehmungs- und Identitätssystem gelesen wird.',
    sources: ['Roland Barthes – The Language of Fashion / The Fashion System', 'Malcolm Barnard – Fashion as Communication', 'Yuniya Kawamura – Fashion-ology', 'Anne Hollander – Seeing Through Clothes', 'Stella Bruzzi – Undressing Cinema']
  },
  {
    tier: 'Anime- und Bildmedium-Kontext',
    role: 'Diese Quellen werden nur als Warnung/Erweiterung genutzt: Anime ist gezeichnet, bewegt, hybrid und genreabhängig.',
    sources: ['Thomas LaMarre – The Anime Machine', 'Rayna Denison – Anime: A Critical Introduction']
  },
  {
    tier: 'Bewusst nicht als Hauptdatenbank genutzt',
    role: 'Interessant, aber für das Kernsystem zu anekdotisch, zu allgemein oder zu schwer belastbar.',
    sources: ['Kassia St. Clair – The Secret Lives of Color', 'Nigel Cross – Design Thinking', 'Tom Bancroft – Creating Characters with Personality', 'Scott McCloud – Understanding Comics']
  }
];

const METHODOLOGY_FIELDS = [
  {
    title: 'Silhouette / Körperform',
    question: 'Wie organisiert Kleidung den Körper im Bildraum?',
    method: 'Silhouette wird über Körpernähe, Körperdistanz, Volumen, Proportion, Achse, Balance und Raumanspruch erfasst. Entscheidend ist nicht ein Stilwort, sondern wie Kleidung den Körper betont, erweitert, verhüllt, aufrichtet oder grafisch zusammenfasst.',
    terms: ['Körpernähe', 'Körperdistanz', 'Volumenbildung', 'Konturbetonung', 'Aufrichtung', 'Raumanspruch'],
    source: 'Jenkyn Jones für Körper/Fabric/Line/Volume; Hollander für den bekleideten Körper als Bildform.',
    caution: 'Silhouette beschreibt zuerst eine formale Körperwirkung. Status, Gender oder Macht sind erst im Kontext von Figur, Szene und Medium belastbar.'
  },
  {
    title: 'Linie / Form',
    question: 'Welche Richtung, Spannung, Ordnung und Lesbarkeit entstehen durch Linien und Grundformen?',
    method: 'Linien und Formen werden als visuelle Strukturmittel gelesen: vertikal streckt und richtet auf, horizontal verbreitert oder lagert, diagonal erzeugt Spannung, kreisförmig zentriert, blockhaft begrenzt und spitze Formen verdichten Richtung. Diese Wirkungen sind formal, nicht automatisch symbolisch.',
    terms: ['vertikale Streckung', 'horizontale Breitenwirkung', 'diagonale Spannung', 'Blicklenkung', 'klare Begrenzung', 'Zuspitzung'],
    source: 'Gestaltungslehre/visuelle Grundelemente; Jenkyn Jones für Designprinzipien wie Kontrast, Balance, Rhythmus und Proportion.',
    caution: 'Formen können mehrere Lesarten unterstützen. Ein Kreis kann Schutz, Vollständigkeit oder Isolation erzeugen, je nach Position, Farbe, Material und Erzählfunktion.'
  },
  {
    title: 'Farbe / Farbfamilie',
    question: 'Welche konkrete Farbfamilie ist sichtbar?',
    method: 'Konkrete Farben werden als beobachtbare Farbfamilien aufgenommen, damit die App praktisch nutzbar bleibt. Sie erzeugen aber keine festen Bedeutungen. Rot, Blau oder Schwarz werden erst über Fläche, Tonwert, Sättigung, Material, Licht und Kontext interpretierbar.',
    terms: ['Schwarz', 'Weiß', 'Rot', 'Blau', 'Beige/Nude', 'Gold/Silber'],
    source: 'Bellantoni für Farbe im narrativen Bild; Itten als Kontrast- und Parameterlogik.',
    caution: 'Farbfamilien sind nur der erste Beobachtungsschritt. Die Bedeutung wird erst mit Farbwirkung/Tonwert und Kontext belastbar.'
  },
  {
    title: 'Farbwirkung / Tonwert',
    question: 'Wie ist Farbe eingesetzt: hell, dunkel, gesättigt, entsättigt, warm, kalt oder kontrastreich?',
    method: 'Farbwirkung wird über Hell-Dunkel, Sättigung, Temperatur, Akzent, Flächengröße und Kontrast beschrieben. Dadurch bleibt die Analyse näher an Farblehre und Bildwirkung als an vereinfachter Farbsymbolik.',
    terms: ['dunkler Tonwert', 'heller Tonwert', 'hohe Sättigung', 'Entsättigung', 'Farbakzent', 'Hell-Dunkel-Kontrast'],
    source: 'Itten für Kontrastlogik; Bellantoni für Farbe als emotional und narrativ wirksames Filmsprachelement.',
    caution: 'Nicht die Farbe allein, sondern ihre Einsatzweise erzeugt die Wirkung.'
  },
  {
    title: 'Material / konkretes Material',
    question: 'Welches Material oder welche Materialassoziation ist erkennbar?',
    method: 'Konkrete Materialien wie Leder, Baumwolle, Wolle, Seide, Denim, Nylon oder Metall werden als unterstützende Beobachtungen aufgenommen. Sie zählen bewusst schwächer als Form, Farbeinsatz oder Konstruktion, weil ein Material allein keine sichere Bedeutung trägt.',
    terms: ['Leder', 'Baumwolle', 'Wolle', 'Seide', 'Denim', 'Nylon/Tech-Gewebe'],
    source: 'Udale und Jenkyn Jones für textile Grundmaterialien, Materialwahl und Körper-Stoff-Interaktion.',
    caution: 'Materialnamen sind keine Symboltabellen. Leder bedeutet nicht automatisch Rebellion; Denim nicht automatisch Amerika; Seide nicht automatisch Luxus.'
  },
  {
    title: 'Material / Oberfläche',
    question: 'Welche haptische, optische und funktionale Qualität erzeugt das Material?',
    method: 'Materialwirkung wird über Fall, Griff, Gewicht, Steifigkeit, Elastizität, Transparenz, Glanz, Mattigkeit, Textur, Konstruktion und Veredelung beschrieben. Diese Eigenschaften sind meist aussagekräftiger als der reine Materialname.',
    terms: ['fließender Fall', 'Steifigkeit', 'Glanz', 'matte Oberfläche', 'Transparenz', 'sichtbare Textur'],
    source: 'Udale für Textilgrundlagen und Veredelungen; Jenkyn Jones für Stoffwahl, Hand/Handle, Drape und Körperinteraktion.',
    caution: 'Die Materialwirkung entsteht aus Oberfläche, Verarbeitung und Einsatz am Körper — nicht aus dem Materialnamen allein.'
  },
  {
    title: 'Detail / Konstruktion',
    question: 'Welche Funktion, Grenze oder Zeichenwirkung haben sichtbare Details?',
    method: 'Details werden als Konstruktion und Zeichen gelesen: Nähte gliedern, Reißverschlüsse öffnen/trennen, Schnallen fixieren, Taschen markieren Funktion, Kragen rahmen oder schützen, Falten erzeugen Rhythmus und Volumenreserve.',
    terms: ['Fixierung', 'Öffnen/Schließen', 'sichtbare Funktionalität', 'Eindruck von Bewegungseinschränkung', 'Schutzfunktion', 'handwerkliche Spur'],
    source: 'Jenkyn Jones und Udale für Konstruktion/Textiltechnik; Barthes für die Relevanz kleiner Details im Ensemble.',
    caution: 'Ein Detail kann praktisch, dekorativ oder symbolisch sein. Die App markiert Möglichkeiten; die konkrete Lesart bleibt Analysearbeit.'
  },
  {
    title: 'Referenz / Kontext',
    question: 'Welche kulturellen, sozialen, filmischen oder anime-spezifischen Codes werden aktiviert?',
    method: 'Kontext wird getrennt von formaler Wirkung geführt. Uniform, Workwear, Sport, Luxus, Ritual, Subkultur oder Genre sind Codes, die erst durch Kombination, Wiederholung und Erzählumgebung belastbar werden.',
    terms: ['Uniformbezug', 'Workwear-/Utility-Bezug', 'Sport-/Performance-Bezug', 'Luxus-/Couture-Bezug', 'Ritualbezug', 'Genrebezug'],
    source: 'Barthes/Barnard/Kawamura für Mode als Zeichen- und Sozialsystem; Bruzzi für filmische Identitätskonstruktion; LaMarre/Denison für Anime als Medium und Kontext.',
    caution: 'Kontextcodes sind Hypothesen. Sie müssen mit Figur, Szene, Körperhaltung, Kamera, Genre, Zielgruppe und narrativem Verlauf abgeglichen werden.'
  }
];

const METHODOLOGY_REFERENCES = [
  'Jenny Udale: Textiles and Fashion — Stoffeigenschaften, Fasern, Konstruktion, Veredelung, Print, Embroidery, Fabric Manipulation und Stoffwahl für Design.',
  'Sue Jenkyn Jones: Fashion Design — Designprinzipien, Körperlinie, Silhouette, Balance, Kontrast, Farbe, Stoff, Detail und Körper-Stoff-Interaktion.',
  'Patti Bellantoni: If It’s Purple, Someone’s Gonna Die — Farbe als emotional/narrativ wirksames Mittel im Film; ausdrücklich nicht als starre Farbsymbolik übernommen.',
  'Stella Bruzzi: Undressing Cinema — Kleidung als zentrales Element filmischer Identitätskonstruktion, nicht bloß Accessoire.',
  'Anne Hollander: Seeing Through Clothes — Kleidung und Körper werden über Bildkonventionen wahrgenommen; Dress als visuelle Bildform.',
  'Roland Barthes: The Language of Fashion / The Fashion System — Kleidung und Mode als signifizierende Systeme; Bedeutung entsteht über Code, Detail, Kombination und Sprache.',
  'Yuniya Kawamura: Fashion-ology — Unterscheidung zwischen Kleidung/Dress und Fashion als institutionell erzeugtem, immateriellem Wert.',
  'Thomas LaMarre: The Anime Machine — Anime nicht nur als Text/Story, sondern als bewegtes, materielles Bild lesen.',
  'Rayna Denison: Anime: A Critical Introduction — Anime als hybridisiertes, kontextabhängiges kulturelles Feld statt einheitliche Kategorie.'
];

const EFFECT_GROUPS = [
  { name: 'Formale Ordnung', layer: 'Gestaltungswirkung', theory: 'Visuelle Grundelemente', color: '#5F5A52', effects: [
    'Achsenbetonung', 'Symmetrie', 'Asymmetrie', 'Balance', 'Gliederung', 'klare Begrenzung', 'Wiederholung', 'Rhythmus', 'Proportionierung', 'Reduktion', 'Komplexität', 'sichtbare Konstruktion', 'formale Strenge', 'Hierarchie'
  ] },
  { name: 'Richtung / Dynamik', layer: 'Gestaltungswirkung', theory: 'Visuelle Grundelemente', color: '#9B5B45', effects: [
    'vertikale Streckung', 'horizontale Breitenwirkung', 'diagonale Spannung', 'gerichtete Bewegung', 'Spannung', 'instabile Wirkung', 'Zuspitzung', 'Fragmentierung', 'Blicklenkung', 'Beschleunigung', 'fließende Richtung', 'Richtungswechsel'
  ] },
  { name: 'Körperbezug / Silhouette', layer: 'Gestaltungswirkung', theory: 'Fashion-Design-Analyse', color: '#B78A3D', effects: [
    'Körpernähe', 'Körperdistanz', 'Volumenbildung', 'Konturbetonung', 'Verhüllung', 'Körperexponierung', 'Rahmung des Körpers', 'Aufrichtung', 'Breitenbetonung', 'Zentrierung', 'Raumanspruch', 'Größenskalierung', 'Leichtigkeit', 'Körpererweiterung', 'Haltungswirkung'
  ] },
  { name: 'Farbton / Farbfamilie', layer: 'Beobachtungsmerkmal', theory: 'Farbtheorie und visuelles Erzählen', color: '#8F6B59', effects: [
    'dunkle Farbfamilie', 'helle Farbfamilie', 'neutrale Farbfamilie', 'warme Farbfamilie', 'kalte Farbfamilie', 'rote Farbfamilie', 'blaue Farbfamilie', 'gelbe Farbfamilie', 'grüne Farbfamilie', 'violette Farbfamilie', 'rosa Farbfamilie', 'braune Farbfamilie', 'metallische Farbfamilie'
  ] },
  { name: 'Farbwirkung / Tonwert', layer: 'Gestaltungswirkung', theory: 'Farbtheorie und visuelles Erzählen', color: '#A84B54', effects: [
    'Hell-Dunkel-Kontrast', 'dunkler Tonwert', 'heller Tonwert', 'hohe Sättigung', 'geringe Sättigung', 'warme Farbtemperatur', 'kalte Farbtemperatur', 'Signalwirkung', 'Farbakzent', 'große Farbfläche', 'Farbquantität', 'Kontrastfokus', 'monochrome Farbigkeit', 'Komplementärkontrast', 'Flächenruhe', 'Lichtreflexion', 'Konturverstärkung', 'Narrativer Farbfokus', 'Nähewirkung'
  ] },
  { name: 'Konkretes Material (unterstützend)', layer: 'Materialhinweis', theory: 'Textil- und Materialanalyse', color: '#6F7F68', effects: [
    'lederartige Materialassoziation', 'baumwollartige Materialassoziation', 'wollartige Materialassoziation', 'seidige Materialassoziation', 'denimartige Materialassoziation', 'technische Materialassoziation', 'netzartige Materialassoziation', 'strickartige Materialassoziation', 'metallische Materialassoziation', 'kunststoffartige Materialassoziation', 'leinenartige Materialassoziation', 'fellartige Materialassoziation', 'textile Grundmaterialität'
  ] },
  { name: 'Materialität / Oberfläche', layer: 'Gestaltungswirkung', theory: 'Textil- und Materialanalyse', color: '#7D9272', effects: [
    'sichtbare Textur', 'Glanz', 'matte Oberfläche', 'Transparenz', 'Blickdichte', 'Steifigkeit', 'fließender Fall', 'schwere Wirkung', 'Gebrauchsspur', 'Oberflächenkontrast', 'haptischer Eindruck', 'Durchlässigkeit', 'Elastizität', 'technische Funktion', 'Schutzwirkung des Materials'
  ] },
  { name: 'Konstruktion / Detailfunktion', layer: 'Gestaltungswirkung', theory: 'Fashion-Design-Analyse', color: '#7A6AA3', effects: [
    'Fixierung', 'Öffnen/Schließen', 'Eindruck von Bewegungseinschränkung', 'Schutzfunktion', 'Schichtung', 'sichtbare Funktionalität', 'handwerkliche Spur', 'Ornament', 'modulare Ordnung', 'Grenzmarkierung', 'Rüstungseindruck', 'Schnittlinie', 'Detail-Wiederholung'
  ] },
  { name: 'Kulturelle Codierung', layer: 'Kontextlesart', theory: 'Mode als Zeichen- und Codesystem', color: '#4F7991', effects: [
    'Uniformbezug', 'Workwear-/Utility-Bezug', 'Sport-/Performance-Bezug', 'Luxus-/Couture-Bezug', 'Ritual-/Zeremonialbezug', 'Subkulturbezug', 'historische Referenz', 'Technikbezug', 'institutioneller Bezug', 'Naturbezug', 'Genrebezug', 'Markt-/Wertbezug', 'Alltagscodierung'
  ] },
  { name: 'Soziale / narrative Lesart', layer: 'Kontextlesart', theory: 'Filmische Kostüm- und Identitätsanalyse', color: '#8A6278', effects: [
    'Distanz', 'Schutz', 'Kontrolle', 'Autorität', 'Verletzlichkeit', 'Transformation', 'Zugehörigkeit', 'Abgrenzung', 'Status', 'Bedrohung', 'Offenheit', 'Ambivalenz', 'Identitätskonstruktion', 'performative Wirkung', 'Bild-/Medienwirkung', 'Zurückhaltung'
  ] }
];

const EFFECT_META = {
  // Formale Ordnung
  'Achsenbetonung': { label: 'aufrechte Achse', type: 'Gestaltungswirkung', desc: 'Eine sichtbare vertikale Ordnung gibt der Figur mehr Aufrichtung und Klarheit.', caution: 'Nicht automatisch mit Macht gleichsetzen; erst Kombination mit Haltung, Größe und Kontext prüfen.' },
  'Symmetrie': { label: 'symmetrische Ordnung', type: 'Gestaltungswirkung', desc: 'Beide Seiten wirken ausbalanciert; das Outfit erscheint geordneter und kontrollierter.', caution: 'Symmetrie kann Ruhe, Formalität oder Strenge erzeugen.' },
  'Asymmetrie': { label: 'asymmetrische Spannung', type: 'Gestaltungswirkung', desc: 'Ungleichgewicht in Form oder Schnitt erzeugt visuelle Spannung und Bewegung.', caution: 'Nicht automatisch avantgardistisch; Kontext und Ausführung prüfen.' },
  'Balance': { label: 'ausbalancierte Proportion', type: 'Gestaltungswirkung', desc: 'Formen und Gewichtungen wirken optisch ausgewogen.', caution: 'Balance kann ruhig oder kontrolliert wirken, abhängig vom restlichen Outfit.' },
  'Gliederung': { label: 'sichtbare Gliederung', type: 'Gestaltungswirkung', desc: 'Nähte, Kanten oder Teilungen strukturieren die Fläche und machen Aufbau lesbar.', caution: 'Gliederung ist zuerst formaler Aufbau, noch keine Symbolik.' },
  'klare Begrenzung': { label: 'klare Konturgrenze', type: 'Gestaltungswirkung', desc: 'Formen wirken deutlich abgeschlossen und sauber voneinander getrennt.', caution: 'Kann reduziert, streng oder grafisch wirken.' },
  'Wiederholung': { label: 'rhythmische Wiederholung', type: 'Gestaltungswirkung', desc: 'Wiederholte Linien, Module oder Details erzeugen Rhythmus und Systematik.', caution: 'Wiederholung kann Ordnung oder Uniformität andeuten.' },
  'Rhythmus': { label: 'visueller Rhythmus', type: 'Gestaltungswirkung', desc: 'Wiederkehrende Formen oder Falten führen das Auge in einem regelmäßigen Takt.', caution: 'Rhythmus ist formal, nicht automatisch dekorativ.' },
  'Proportionierung': { label: 'bewusste Proportionierung', type: 'Gestaltungswirkung', desc: 'Längen, Breiten und Teilungen ordnen den Körper in erkennbare Verhältnisse.', caution: 'Proportionen wirken je nach Körperbild und Zeichenstil unterschiedlich.' },
  'Reduktion': { label: 'reduzierte Gestaltung', type: 'Gestaltungswirkung', desc: 'Wenige Details und klare Flächen lassen das Outfit zurückgenommener und konzentrierter wirken.', caution: 'Reduktion kann schlicht, streng oder hochwertig lesbar sein.' },
  'Komplexität': { label: 'vielschichtige Gestaltung', type: 'Gestaltungswirkung', desc: 'Viele Lagen, Details oder Richtungen erzeugen visuelle Dichte.', caution: 'Komplexität kann erzählerisch stark sein, aber auch unruhig wirken.' },
  'sichtbare Konstruktion': { label: 'sichtbarer Aufbau', type: 'Gestaltungswirkung', desc: 'Nähte, Verschlüsse oder Schnittlinien zeigen, wie das Kleidungsstück konstruiert ist.', caution: 'Kann handwerklich, technisch oder dekonstruiert wirken.' },
  'formale Strenge': { label: 'strenge Formordnung', type: 'Gestaltungswirkung', desc: 'Klare Linien, symmetrische Ordnung oder harte Begrenzungen erzeugen kontrollierte Strenge.', caution: 'Strenge wird erst im Kontext zur sozialen oder narrativen Lesart.' },
  'Hierarchie': { label: 'ranghafte Aufrichtung', type: 'Lesart', desc: 'Vertikale Ordnung, Höhe oder zentrale Platzierung können eine ranghafte Präsenz unterstützen.', caution: 'Nur als mögliche Lesart verwenden, nicht als automatische Bedeutung.' },

  // Richtung / Dynamik
  'vertikale Streckung': { label: 'optische Streckung', type: 'Gestaltungswirkung', desc: 'Vertikale Linien oder lange Formen lassen die Figur höher und aufgerichteter wirken.', caution: 'Streckung kann Eleganz, Strenge oder Distanz unterstützen.' },
  'horizontale Breitenwirkung': { label: 'optische Breite', type: 'Gestaltungswirkung', desc: 'Horizontale Linien oder breite Formen lassen die Figur stabiler und breiter erscheinen.', caution: 'Breite kann Standfestigkeit oder Schwere erzeugen.' },
  'diagonale Spannung': { label: 'diagonale Spannung', type: 'Gestaltungswirkung', desc: 'Schräge Linien bringen Richtung, Unruhe und Bewegung in die Form.', caution: 'Nicht automatisch Aggression; erst mit Spitze, Haltung und Szene prüfen.' },
  'gerichtete Bewegung': { label: 'gerichtete Dynamik', type: 'Gestaltungswirkung', desc: 'Formen oder Linien scheinen den Blick in eine klare Richtung zu ziehen.', caution: 'Dynamik beschreibt Bewegungseindruck, nicht tatsächliche Bewegung.' },
  'Spannung': { label: 'visuelle Spannung', type: 'Gestaltungswirkung', desc: 'Gegensätze, Schrägen oder harte Richtungen erzeugen ein aktiveres, weniger ruhiges Bild.', caution: 'Spannung kann positiv, konflikthaft oder dramatisch wirken.' },
  'instabile Wirkung': { label: 'instabile Balance', type: 'Gestaltungswirkung', desc: 'Formen wirken nicht vollständig ausbalanciert und erzeugen Unsicherheit oder Bewegung.', caution: 'Instabilität ist eine formale Qualität, keine Charakterdiagnose.' },
  'Zuspitzung': { label: 'spitze Richtungswirkung', type: 'Gestaltungswirkung', desc: 'Spitzen oder Dreiecke bündeln Aufmerksamkeit und erzeugen eine gerichtete, schärfere Wirkung.', caution: 'Kann Angriff, Schutz oder Energie andeuten, je nach Kontext.' },
  'Fragmentierung': { label: 'fragmentierte Fläche', type: 'Gestaltungswirkung', desc: 'Teilungen und Brüche lösen die Fläche in mehrere Abschnitte auf.', caution: 'Kann Komplexität, Bruch oder technische Konstruktion unterstützen.' },
  'Blicklenkung': { label: 'gerichteter Blickverlauf', type: 'Gestaltungswirkung', desc: 'Linien, Kontraste, Glanz oder Details führen den Blick gezielt über den Körper.', caution: 'Blicklenkung ist eine formale Beobachtung, noch keine Bedeutung.' },
  'Beschleunigung': { label: 'beschleunigte Dynamik', type: 'Gestaltungswirkung', desc: 'Schrägen, Wiederholungen oder Zuspitzungen lassen die Form schneller und aktiver erscheinen.', caution: 'Nur verwenden, wenn mehrere Richtungselemente zusammenarbeiten.' },
  'fließende Richtung': { label: 'fließender Linienverlauf', type: 'Gestaltungswirkung', desc: 'Kurven und weiche Linien führen das Auge ohne harte Brüche weiter.', caution: 'Kann organisch, weich oder beweglich wirken.' },
  'Richtungswechsel': { label: 'wechselnde Blickrichtung', type: 'Gestaltungswirkung', desc: 'Linien oder Formen ändern ihre Richtung und erzeugen Bewegung im Bild.', caution: 'Kann lebendig oder unruhig wirken.' },

  // Körperbezug
  'Körpernähe': { label: 'körpernahe Kontur', type: 'Gestaltungswirkung', desc: 'Die Kleidung liegt nah am Körper; Körperform und Haltung bleiben gut lesbar.', caution: 'Nicht automatisch sexualisieren; Kontext, Material und Szene prüfen.' },
  'Körperdistanz': { label: 'körperferne Außenform', type: 'Gestaltungswirkung', desc: 'Die Kleidung bildet Abstand zum Körper und erzeugt eine eigenständige Silhouette.', caution: 'Kann Schutz, Volumen, Status oder Verhüllung unterstützen.' },
  'Volumenbildung': { label: 'aufgebautes Volumen', type: 'Gestaltungswirkung', desc: 'Stoff, Schnitt oder Polsterung vergrößern die Körperform optisch.', caution: 'Volumen kann Macht, Schutz oder Spiel mit Proportionen bedeuten.' },
  'Konturbetonung': { label: 'betonte Körperlinie', type: 'Gestaltungswirkung', desc: 'Die äußere Linie des Körpers oder Outfits wird deutlich hervorgehoben.', caution: 'Betonung kann elegant, streng, exponierend oder grafisch wirken.' },
  'Verhüllung': { label: 'verdeckter Körper', type: 'Gestaltungswirkung', desc: 'Körperdetails werden durch Stoff, Volumen oder Schichten weniger sichtbar.', caution: 'Verhüllung kann Schutz, Distanz oder Formalität erzeugen.' },
  'Körperexponierung': { label: 'sichtbare Körperform', type: 'Gestaltungswirkung', desc: 'Der Körper wird stärker sichtbar oder lesbar gemacht.', caution: 'Nicht automatisch erotisch lesen; Kontext und Darstellungsweise prüfen.' },
  'Rahmung des Körpers': { label: 'gerahmter Körperbereich', type: 'Gestaltungswirkung', desc: 'Kragen, Schultern, Ausschnitte oder Kanten fassen Körperpartien optisch ein.', caution: 'Rahmung kann Fokus, Schutz oder Inszenierung erzeugen.' },
  'Aufrichtung': { label: 'aufrechte Präsenz', type: 'Gestaltungswirkung', desc: 'Schnitt, Linie oder Proportion lassen die Figur aufgerichteter und präsenter wirken.', caution: 'Kann Würde, Kontrolle oder Distanz unterstützen.' },
  'Breitenbetonung': { label: 'betonte Breite', type: 'Gestaltungswirkung', desc: 'Schultern, Hüfte oder horizontale Linien erweitern die Figur seitlich.', caution: 'Kann Stärke, Standfestigkeit oder Blockhaftigkeit erzeugen.' },
  'Zentrierung': { label: 'betonte Körpermitte', type: 'Gestaltungswirkung', desc: 'Taille, Gürtel oder Mittellinie lenken Aufmerksamkeit auf die Körpermitte.', caution: 'Kann Ordnung, Figurbetonung oder Fixierung erzeugen.' },
  'Raumanspruch': { label: 'erweiterter Raumanspruch', type: 'Lesart', desc: 'Volumen oder Breite lassen die Figur mehr Raum einnehmen.', caution: 'Kann Präsenz oder Dominanz andeuten, aber nur kontextabhängig.' },
  'Größenskalierung': { label: 'veränderte Größenskala', type: 'Gestaltungswirkung', desc: 'Proportionen lassen einzelne Körperbereiche größer oder kleiner erscheinen.', caution: 'Kann stilisieren, überzeichnen oder charakterisieren.' },
  'Leichtigkeit': { label: 'leichte Körperwirkung', type: 'Gestaltungswirkung', desc: 'Helle, dünne oder fließende Elemente lassen die Figur weniger schwer erscheinen.', caution: 'Leichtigkeit hängt stark von Material, Farbe und Bewegung ab.' },
  'Körpererweiterung': { label: 'erweiterte Körperform', type: 'Gestaltungswirkung', desc: 'Details, Volumen oder Ausrüstung verlängern oder erweitern die Körperform.', caution: 'Kann Schutz, Technik oder Transformation andeuten.' },
  'Haltungswirkung': { label: 'veränderte Haltung', type: 'Gestaltungswirkung', desc: 'Schnitt oder Konstruktion lassen die Körperhaltung aufrechter, steifer oder weicher erscheinen.', caution: 'Haltung muss mit Pose und Bildkomposition abgeglichen werden.' },

  // Farbe Beobachtung
  'dunkle Farbfamilie': { label: 'dunkle Farbangabe', type: 'Beobachtung', desc: 'Die sichtbare Farbe gehört zu dunklen Farbtönen. Das ist zunächst eine Beobachtung, keine Bedeutung.', caution: 'Bedeutung entsteht erst über Tonwert, Fläche, Material und Szene.' },
  'helle Farbfamilie': { label: 'helle Farbangabe', type: 'Beobachtung', desc: 'Die sichtbare Farbe gehört zu hellen Farbtönen. Das ist eine Farbangabe, keine Wirkung.', caution: 'Kann helle Flächenwirkung unterstützen, aber nicht allein interpretieren.' },
  'neutrale Farbfamilie': { label: 'neutrale Farbangabe', type: 'Beobachtung', desc: 'Die Farbe liegt im neutralen Spektrum, etwa Weiß, Grau, Beige, Braun oder Schwarz.', caution: 'Neutralität kann ruhig wirken, ist aber nicht automatisch unauffällig.' },
  'warme Farbfamilie': { label: 'warme Farbangabe', type: 'Beobachtung', desc: 'Die Farbe liegt im warmen Bereich, etwa Rot, Orange, Gelb oder warme Beigetöne.', caution: 'Wärme wird erst über Sättigung, Fläche und Kontext wirksam.' },
  'kalte Farbfamilie': { label: 'kalte Farbangabe', type: 'Beobachtung', desc: 'Die Farbe liegt im kühlen Bereich, etwa Blau, Violett, kühles Grün oder Silber.', caution: 'Kühle kann Distanz unterstützen, ist aber keine feste Symbolik.' },
  'rote Farbfamilie': { label: 'rote Farbangabe', type: 'Beobachtung', desc: 'Rot ist als Farbton sichtbar. Die Bedeutung hängt von Sättigung, Fläche und Szene ab.', caution: 'Nicht pauschal als Liebe, Gefahr oder Aggression lesen.' },
  'blaue Farbfamilie': { label: 'blaue Farbangabe', type: 'Beobachtung', desc: 'Blau ist als Farbton sichtbar. Tonwert und Kontext entscheiden über die Wirkung.', caution: 'Nicht automatisch Ruhe oder Melancholie annehmen.' },
  'gelbe Farbfamilie': { label: 'gelbe Farbangabe', type: 'Beobachtung', desc: 'Gelb ist als Farbton sichtbar und kann hohe Sichtbarkeit unterstützen.', caution: 'Erst Sättigung und Fläche machen daraus Signalwirkung.' },
  'grüne Farbfamilie': { label: 'grüne Farbangabe', type: 'Beobachtung', desc: 'Grün ist als Farbton sichtbar. Es kann natürlich, künstlich oder giftig wirken, je nach Kontext.', caution: 'Nicht automatisch Naturbezug annehmen.' },
  'violette Farbfamilie': { label: 'violette Farbangabe', type: 'Beobachtung', desc: 'Violett/Lila ist als Farbton sichtbar und stark kontextabhängig.', caution: 'Nicht isoliert mystisch oder bedrohlich lesen.' },
  'rosa Farbfamilie': { label: 'rosa Farbangabe', type: 'Beobachtung', desc: 'Rosa/Pink ist als Farbton sichtbar; Wirkung hängt stark von Sättigung und Genre ab.', caution: 'Nicht automatisch feminin oder kindlich lesen.' },
  'braune Farbfamilie': { label: 'braune Farbangabe', type: 'Beobachtung', desc: 'Braun ist als Farbton sichtbar und kann Erdigkeit oder Gebrauchsnähe unterstützen.', caution: 'Material und Oberfläche sind entscheidend.' },
  'metallische Farbfamilie': { label: 'metallische Farbangabe', type: 'Beobachtung', desc: 'Gold, Silber oder metallische Töne sind sichtbar.', caution: 'Metallische Farbe ist nicht automatisch Luxus oder Technik.' },

  // Farbwirkung
  'Hell-Dunkel-Kontrast': { label: 'starker Hell-Dunkel-Kontrast', type: 'Gestaltungswirkung', desc: 'Helle und dunkle Flächen stehen deutlich gegeneinander und erzeugen Spannung und klare Lesbarkeit.', caution: 'Kontrast kann dramatisch, grafisch oder ordnend wirken.' },
  'dunkler Tonwert': { label: 'dunkle Flächenwirkung', type: 'Gestaltungswirkung', desc: 'Dunkle Flächen verdichten Kontur und lassen die Form schwerer oder abgeschirmter wirken.', caution: 'Nicht automatisch bedrohlich lesen.' },
  'heller Tonwert': { label: 'helle Farbwirkung', type: 'Gestaltungswirkung', desc: 'Helle Flächen öffnen die Form, reflektieren Licht und reduzieren optische Schwere.', caution: 'Nicht automatisch Reinheit oder Unschuld ableiten.' },
  'hohe Sättigung': { label: 'kräftige Farbwirkung', type: 'Gestaltungswirkung', desc: 'Intensive Farbe erhöht Sichtbarkeit und visuelle Präsenz.', caution: 'Sättigung ist ein Parameter, keine feste Emotion.' },
  'geringe Sättigung': { label: 'gedämpfte Farbwirkung', type: 'Gestaltungswirkung', desc: 'Entsättigte Farben wirken zurückgenommen, gealtert oder weniger signalhaft.', caution: 'Kann Ruhe, Realismus oder Erschöpfung unterstützen.' },
  'warme Farbtemperatur': { label: 'warme Farbwirkung', type: 'Gestaltungswirkung', desc: 'Warme Töne rücken optisch näher und können Aktivität oder Körperlichkeit unterstützen.', caution: 'Wärme bleibt kontextabhängig.' },
  'kalte Farbtemperatur': { label: 'kühle Farbwirkung', type: 'Gestaltungswirkung', desc: 'Kühle Töne können Distanz, Klarheit oder Raumtiefe unterstützen.', caution: 'Nicht automatisch emotional kalt lesen.' },
  'Signalwirkung': { label: 'hohe Signalwirkung', type: 'Gestaltungswirkung', desc: 'Farbe oder Kontrast zieht stark Aufmerksamkeit auf sich.', caution: 'Signalwirkung kann Warnung, Fokus, Status oder Energie sein.' },
  'Farbakzent': { label: 'farblicher Akzent', type: 'Gestaltungswirkung', desc: 'Eine kleinere Farbfläche hebt einen bestimmten Bereich hervor.', caution: 'Akkzente sind oft narrative Marker, aber nicht automatisch Symbol.' },
  'große Farbfläche': { label: 'dominante Farbfläche', type: 'Gestaltungswirkung', desc: 'Eine Farbe nimmt viel Fläche ein und prägt die Gesamtwirkung stark.', caution: 'Je größer die Fläche, desto stärker muss Kontext geprüft werden.' },
  'Farbquantität': { label: 'Farbmenge', type: 'Beobachtung', desc: 'Beschreibt, wie viel Raum eine Farbe im Outfit einnimmt.', caution: 'Farbmenge unterstützt Wirkung, ist aber selbst keine Bedeutung.' },
  'Kontrastfokus': { label: 'Fokus durch Kontrast', type: 'Gestaltungswirkung', desc: 'Ein Kontrast lenkt Aufmerksamkeit auf einen bestimmten Bereich.', caution: 'Der Fokus kann formal oder narrativ relevant sein.' },
  'monochrome Farbigkeit': { label: 'monochrome Farbwirkung', type: 'Gestaltungswirkung', desc: 'Eine Farbfamilie dominiert und beruhigt oder vereinheitlicht das Outfit.', caution: 'Monochromie kann ruhig, streng oder stilisiert wirken.' },
  'Komplementärkontrast': { label: 'Komplementärspannung', type: 'Gestaltungswirkung', desc: 'Gegensätzliche Farben steigern sich gegenseitig und erzeugen Spannung.', caution: 'Nicht automatisch Konflikt; Bildkontext beachten.' },
  'Flächenruhe': { label: 'ruhige Flächenwirkung', type: 'Gestaltungswirkung', desc: 'Reduzierte, große oder helle Flächen wirken weniger unruhig und weniger schwer.', caution: 'Flächenruhe kann schlicht, klar oder leer wirken.' },
  'Lichtreflexion': { label: 'glänzende Lichtwirkung', type: 'Gestaltungswirkung', desc: 'Reflektierte Lichtpunkte ziehen Aufmerksamkeit auf die Oberfläche.', caution: 'Glanz kann hochwertig, technisch, künstlich oder hart wirken.' },
  'Konturverstärkung': { label: 'verstärkte Kontur', type: 'Gestaltungswirkung', desc: 'Farbe oder Kontrast macht die Außenform deutlicher lesbar.', caution: 'Kontur kann grafisch, streng oder ikonisch wirken.' },
  'Narrativer Farbfokus': { label: 'narrativer Farbfokus', type: 'Lesart', desc: 'Eine Farbe wirkt wie ein gezielter Marker für Figur, Szene oder Bedeutung.', caution: 'Nur nutzen, wenn Farbe im Verlauf oder Bildkontext auffällig wiederkehrt.' },
  'Nähewirkung': { label: 'optische Nähe', type: 'Gestaltungswirkung', desc: 'Warme, helle oder körpernahe Farben können die Figur näher erscheinen lassen.', caution: 'Nähe hängt von Bildkomposition und Figur ab.' },

  // Material Hinweise
  'lederartige Materialassoziation': { label: 'Leder als Materialhinweis', type: 'Beobachtung', desc: 'Leder wird als konkretes Material erkannt. Allein daraus folgt noch keine feste Bedeutung.', caution: 'Erst Oberfläche, Schnitt und Kontext entscheiden über Schutz, Härte, Luxus oder Körperbezug.' },
  'baumwollartige Materialassoziation': { label: 'Baumwolle als Materialhinweis', type: 'Beobachtung', desc: 'Baumwolle wird als konkretes Material erkannt.', caution: 'Allein nur unterstützender Hinweis auf textile Alltäglichkeit oder Weichheit.' },
  'wollartige Materialassoziation': { label: 'Wolle als Materialhinweis', type: 'Beobachtung', desc: 'Wolle wird als Material erkannt und kann Wärme, Gewicht oder Textur unterstützen.', caution: 'Nicht automatisch traditionell lesen.' },
  'seidige Materialassoziation': { label: 'Seide/Satin als Materialhinweis', type: 'Beobachtung', desc: 'Eine glatte, fließende oder glänzende textile Qualität wird als Seide/Satin gelesen.', caution: 'Luxus oder Sinnlichkeit nur in Kombination mit Schnitt und Kontext.' },
  'denimartige Materialassoziation': { label: 'Denim als Materialhinweis', type: 'Beobachtung', desc: 'Denim wird als robustes, gewebtes Material erkannt.', caution: 'Nicht automatisch amerikanisch; eher Stoffstruktur, Gebrauch und Workwear-Kontext prüfen.' },
  'technische Materialassoziation': { label: 'Tech-Gewebe als Materialhinweis', type: 'Beobachtung', desc: 'Nylon, Ripstop oder synthetische Oberflächen wirken technisch oder funktional.', caution: 'Technikbezug entsteht über Material, Detail und Kontext.' },
  'netzartige Materialassoziation': { label: 'Netz/Mesh als Materialhinweis', type: 'Beobachtung', desc: 'Perforierte oder netzartige Struktur ist sichtbar.', caution: 'Bedeutung hängt von Transparenz, Körperstelle und Szene ab.' },
  'strickartige Materialassoziation': { label: 'Strick als Materialhinweis', type: 'Beobachtung', desc: 'Maschenstruktur oder gestrickte Oberfläche ist sichtbar.', caution: 'Kann Weichheit, Alltag oder Handwerk stützen, aber nicht allein.' },
  'metallische Materialassoziation': { label: 'Metall als Materialhinweis', type: 'Beobachtung', desc: 'Metallische Materialität oder Metallteile sind sichtbar.', caution: 'Kann Schutz, Status oder Technik stützen, je nach Einsatz.' },
  'kunststoffartige Materialassoziation': { label: 'Kunststoff/Vinyl als Materialhinweis', type: 'Beobachtung', desc: 'Kunststoffartige oder vinylartige Oberfläche ist sichtbar.', caution: 'Künstlichkeit oder Glanzwirkung erst durch Oberfläche und Form prüfen.' },
  'leinenartige Materialassoziation': { label: 'Leinen als Materialhinweis', type: 'Beobachtung', desc: 'Leinenartige Struktur oder matter Naturfaser-Eindruck ist sichtbar.', caution: 'Natur- oder Alltagsnähe nur kontextabhängig.' },
  'fellartige Materialassoziation': { label: 'Fell/Pelzoptik als Materialhinweis', type: 'Beobachtung', desc: 'Fellartige Oberfläche oder Haarigkeit ist sichtbar.', caution: 'Kann Schutz, Wärme, Status oder Animalität andeuten, aber nicht automatisch.' },
  'textile Grundmaterialität': { label: 'textile Grundmaterialität', type: 'Beobachtung', desc: 'Das Kleidungsstück wirkt primär als Stofffläche, ohne starkes Sondermaterial.', caution: 'Dient vor allem als neutraler Materialhinweis.' },

  // Material effects
  'sichtbare Textur': { label: 'sichtbare Oberflächenstruktur', type: 'Gestaltungswirkung', desc: 'Die Oberfläche zeigt Körnung, Webung, Maschen oder Relief.', caution: 'Textur macht Material greifbarer, ist aber keine feste Symbolik.' },
  'Glanz': { label: 'glänzende Oberfläche', type: 'Gestaltungswirkung', desc: 'Lichtreflexe machen die Oberfläche auffälliger, härter oder künstlicher.', caution: 'Glanz kann Luxus, Technik oder Kälte unterstützen.' },
  'matte Oberfläche': { label: 'matte Oberfläche', type: 'Gestaltungswirkung', desc: 'Wenig Reflexion lässt die Fläche ruhiger, weicher oder zurückgenommener wirken.', caution: 'Mattigkeit ist nicht automatisch natürlich.' },
  'Transparenz': { label: 'transparente Wirkung', type: 'Gestaltungswirkung', desc: 'Darunterliegende Schichten oder Körperpartien bleiben sichtbar.', caution: 'Nicht automatisch sexualisiert; Kontext und Körperstelle prüfen.' },
  'Blickdichte': { label: 'blickdichte Fläche', type: 'Gestaltungswirkung', desc: 'Die Oberfläche verdeckt darunterliegende Schichten oder Körperpartien.', caution: 'Kann Schutz, Distanz oder Materialschwere unterstützen.' },
  'Steifigkeit': { label: 'formhaltende Steifigkeit', type: 'Gestaltungswirkung', desc: 'Das Material hält seine Form und schafft Abstand zum Körper.', caution: 'Kann Rüstung, Status oder Strenge stützen.' },
  'fließender Fall': { label: 'fließender Stofffall', type: 'Gestaltungswirkung', desc: 'Der Stoff fällt weich und reagiert sichtbar auf Körper oder Bewegung.', caution: 'Fluss kann Eleganz, Verletzlichkeit oder Bewegung erzeugen.' },
  'schwere Wirkung': { label: 'schwere Materialwirkung', type: 'Gestaltungswirkung', desc: 'Material oder Fall wirken dicht, belastend oder erdend.', caution: 'Schwere kann Schutz, Status oder Trägheit bedeuten.' },
  'Gebrauchsspur': { label: 'sichtbare Gebrauchsspuren', type: 'Beobachtung', desc: 'Abnutzung, Patina oder Reparatur lassen Material benutzt und zeitlich aufgeladen wirken.', caution: 'Gebrauchsspur kann Alltag, Erfahrung oder Armut stützen, aber nicht automatisch.' },
  'Oberflächenkontrast': { label: 'Kontrast der Oberflächen', type: 'Gestaltungswirkung', desc: 'Unterschiedliche Oberflächen wie matt/glänzend oder glatt/rau stehen gegeneinander.', caution: 'Kontrast kann Blick lenken und Materialhierarchie erzeugen.' },
  'haptischer Eindruck': { label: 'fühlbare Oberfläche', type: 'Gestaltungswirkung', desc: 'Die Oberfläche wirkt greifbar, rau, weich, glatt oder abgenutzt.', caution: 'Haptik ist bei Anime oft gezeichnete Illusion.' },
  'Durchlässigkeit': { label: 'durchlässige Oberfläche', type: 'Gestaltungswirkung', desc: 'Löcher, Mesh oder Transparenz lassen Innen und Außen sichtbar miteinander reagieren.', caution: 'Kann Offenheit, Verletzlichkeit oder Technik unterstützen.' },
  'Elastizität': { label: 'dehnbare Körperanpassung', type: 'Gestaltungswirkung', desc: 'Das Material wirkt flexibel und passt sich dem Körper an.', caution: 'Elastizität kann Sportlichkeit, Körpernähe oder Funktion stützen.' },
  'technische Funktion': { label: 'technische Materialfunktion', type: 'Gestaltungswirkung', desc: 'Material wirkt leistungsorientiert, synthetisch oder für bestimmte Funktion entwickelt.', caution: 'Funktion kann real oder nur visuell codiert sein.' },
  'Schutzwirkung des Materials': { label: 'schützende Materialwirkung', type: 'Gestaltungswirkung', desc: 'Dichte, Härte oder Schichtung lassen das Material als Schutzschicht erscheinen.', caution: 'Schutz ist eine mögliche Lesart, kein Automatismus.' },

  // Details
  'Fixierung': { label: 'fixierende Details', type: 'Gestaltungswirkung', desc: 'Schnallen, Gurte oder Riemen lassen Kleidung und Körper optisch gehalten, angepasst oder begrenzt erscheinen.', caution: 'Nicht automatisch Unterdrückung: kann funktional, schützend, sportlich oder dekorativ sein.' },
  'Öffnen/Schließen': { label: 'sichtbares Öffnen und Schließen', type: 'Gestaltungswirkung', desc: 'Reißverschlüsse, Knöpfe oder Verschlüsse zeigen, wo Kleidung zugänglich oder verschließbar ist.', caution: 'Kann Funktion, Kontrolle oder Körperzugang thematisieren.' },
  'Eindruck von Bewegungseinschränkung': { label: 'eingeschränkte Beweglichkeit', type: 'Gestaltungswirkung', desc: 'Enge, Gurte oder feste Konstruktionen lassen Bewegung optisch kontrolliert oder begrenzt wirken.', caution: 'Nur als Eindruck beschreiben, nicht als reale Einschränkung behaupten.' },
  'Schutzfunktion': { label: 'sichtbare Schutzfunktion', type: 'Gestaltungswirkung', desc: 'Polster, harte Schichten, hohe Kragen oder dichte Materialien wirken schützend.', caution: 'Schutz kann praktisch, symbolisch oder stilisiert sein.' },
  'Schichtung': { label: 'sichtbare Schichtung', type: 'Gestaltungswirkung', desc: 'Mehrere Lagen erzeugen Tiefe, Schutz oder komplexe Körperform.', caution: 'Schichtung kann praktisch oder narrativ wirken.' },
  'sichtbare Funktionalität': { label: 'sichtbare Funktionalität', type: 'Gestaltungswirkung', desc: 'Taschen, Verschlüsse, Riemen oder technische Details zeigen praktischen Gebrauch an.', caution: 'Funktionalität kann real oder rein visuell codiert sein.' },
  'handwerkliche Spur': { label: 'handwerkliche Spur', type: 'Gestaltungswirkung', desc: 'Nähte, Reparaturen oder sichtbare Verarbeitung machen Herstellung oder Gebrauch lesbar.', caution: 'Kann Authentizität, Armut, Craft oder Dekonstruktion andeuten.' },
  'Ornament': { label: 'ornamentale Verzierung', type: 'Gestaltungswirkung', desc: 'Dekorative Elemente erweitern die Oberfläche über reine Funktion hinaus.', caution: 'Ornament ist nicht automatisch Luxus.' },
  'modulare Ordnung': { label: 'modulare Ordnung', type: 'Gestaltungswirkung', desc: 'Wiederholte Bauteile oder Segmente lassen das Outfit systematisch aufgebaut wirken.', caution: 'Kann Technik, Uniformität oder Designsystem stützen.' },
  'Grenzmarkierung': { label: 'markierte Grenze', type: 'Gestaltungswirkung', desc: 'Kanten, Säume oder Kontraste markieren Übergänge am Körper.', caution: 'Grenzen können Körperzonen betonen oder abschirmen.' },
  'Rüstungseindruck': { label: 'rüstungsartige Wirkung', type: 'Lesart', desc: 'Harte, steife, geschichtete oder schützende Elemente können an Rüstung erinnern.', caution: 'Nur bei mehreren unterstützenden Merkmalen verwenden.' },
  'Schnittlinie': { label: 'sichtbare Schnittlinie', type: 'Gestaltungswirkung', desc: 'Schnittkanten oder Nähte strukturieren die Form und lenken den Blick.', caution: 'Schnittlinien sind zuerst konstruktive Beobachtung.' },
  'Detail-Wiederholung': { label: 'wiederholte Details', type: 'Gestaltungswirkung', desc: 'Mehrfach auftretende Details erzeugen Rhythmus oder Systematik.', caution: 'Kann dekorativ, funktional oder uniform wirken.' },

  // Codings / readings
  'Uniformbezug': { label: 'Uniformbezug', type: 'Lesart', desc: 'Wiederholung, Ordnung, Rangdetails oder einheitliche Form können an Uniformen erinnern.', caution: 'Nur als Bezug, nicht als tatsächliche Uniform behaupten.' },
  'Workwear-/Utility-Bezug': { label: 'Utility-/Workwear-Bezug', type: 'Lesart', desc: 'Taschen, robuste Materialien, Gebrauchsspuren oder funktionale Details erinnern an Arbeits- oder Einsatzkleidung.', caution: 'Nicht automatisch amerikanisch oder proletarisch lesen.' },
  'Sport-/Performance-Bezug': { label: 'Sport-/Performance-Bezug', type: 'Lesart', desc: 'Stretch, Tech-Gewebe oder körpernahe Funktion können Leistungs- oder Bewegungsbezug erzeugen.', caution: 'Kontext entscheidet, ob Sport oder Technik dominiert.' },
  'Luxus-/Couture-Bezug': { label: 'Luxus-/Couture-Bezug', type: 'Lesart', desc: 'Feine Verarbeitung, Glanz, wertige Materialien oder ornamentale Details können Wertigkeit anzeigen.', caution: 'Luxus entsteht nicht nur durch Material, sondern durch Inszenierung.' },
  'Ritual-/Zeremonialbezug': { label: 'Ritual-/Zeremonialbezug', type: 'Lesart', desc: 'Formale, symmetrische, dekorative oder historisierte Elemente können zeremoniell wirken.', caution: 'Nur bei passendem Kontext stark gewichten.' },
  'Subkulturbezug': { label: 'Subkulturbezug', type: 'Lesart', desc: 'Bestimmte Details, Materialien oder Codes können auf Stilgemeinschaften verweisen.', caution: 'Nicht ohne Kontext eindeutig benennen.' },
  'historische Referenz': { label: 'historische Referenz', type: 'Lesart', desc: 'Schnitt, Material oder Detail erinnert an eine erkennbare historische Kleidungstradition.', caution: 'Nur nennen, wenn Referenz wirklich erkennbar ist.' },
  'Technikbezug': { label: 'Technikbezug', type: 'Lesart', desc: 'Synthetische Materialien, Glanz, Module oder technische Details erzeugen maschinelle/technische Assoziation.', caution: 'Technikbezug kann futuristisch, funktional oder künstlich sein.' },
  'institutioneller Bezug': { label: 'institutioneller Bezug', type: 'Lesart', desc: 'Uniformität, Ordnung oder formale Strenge können auf Schule, Militär, Amt oder Organisation verweisen.', caution: 'Kontext erforderlich.' },
  'Naturbezug': { label: 'Naturbezug', type: 'Lesart', desc: 'Naturfasern, erdige Farben, organische Formen oder Gebrauchsspuren können Naturbezug erzeugen.', caution: 'Nicht automatisch bei Grün oder Braun annehmen.' },
  'Genrebezug': { label: 'Genrebezug', type: 'Lesart', desc: 'Bestimmte Kombinationen verweisen auf Genre-Codes, etwa Fantasy, Sci-Fi, Schuluniform oder Battle Outfit.', caution: 'Genrebezug muss mit Anime/Film-Kontext abgeglichen werden.' },
  'Markt-/Wertbezug': { label: 'Wertigkeitsbezug', type: 'Lesart', desc: 'Material, Verarbeitung und Inszenierung können Status oder Wertigkeit anzeigen.', caution: 'Preis/Wert nicht aus Material allein ableiten.' },
  'Alltagscodierung': { label: 'Alltagsnähe', type: 'Lesart', desc: 'Gebrauchsspuren, neutrale Farben oder einfache Materialien können ein getragenes, weniger repräsentatives Bild erzeugen.', caution: 'Alltag ist eine Lesart, nicht bloß eine Farbeigenschaft.' },
  'Distanz': { label: 'Distanzwirkung', type: 'Lesart', desc: 'Körperferne Formen, dunkle Flächen oder geschlossene Details können Abstand erzeugen.', caution: 'Distanz kann sozial, emotional oder formal sein.' },
  'Schutz': { label: 'Schutzlesart', type: 'Lesart', desc: 'Schichtung, Steifigkeit oder dichte Materialien können Schutz nahelegen.', caution: 'Schutz nicht automatisch mit Angst oder Kampf gleichsetzen.' },
  'Kontrolle': { label: 'kontrollierte Wirkung', type: 'Lesart', desc: 'Klare Ordnung, körpernahe Führung oder fixierende Details können Kontrolle vermitteln.', caution: 'Kann Selbstkontrolle, soziale Kontrolle oder technische Kontrolle sein.' },
  'Autorität': { label: 'Autoritätswirkung', type: 'Lesart', desc: 'Aufrichtung, Schulterbetonung, Symmetrie oder formale Strenge können Autorität unterstützen.', caution: 'Autorität braucht Figur, Pose und Szene.' },
  'Verletzlichkeit': { label: 'verletzliche Wirkung', type: 'Lesart', desc: 'Transparenz, Körperexponierung oder geringe Schutzschichten können Verletzlichkeit nahelegen.', caution: 'Nicht automatisch sexualisieren.' },
  'Transformation': { label: 'Transformationswirkung', type: 'Lesart', desc: 'Schichtung, Brüche, ungewöhnliche Proportionen oder Materialwechsel können Veränderung des Körpers zeigen.', caution: 'Stark abhängig von Narration.' },
  'Zugehörigkeit': { label: 'Zugehörigkeitswirkung', type: 'Lesart', desc: 'Uniformität, wiederholte Codes oder gemeinsame Farben können Gruppe/Zugehörigkeit anzeigen.', caution: 'Nur mit Kontext eindeutig.' },
  'Abgrenzung': { label: 'Abgrenzungswirkung', type: 'Lesart', desc: 'Ungewöhnliche Formen, Kontraste oder Codes können Distanz zu einer Gruppe zeigen.', caution: 'Nicht automatisch Rebellion.' },
  'Status': { label: 'Statuswirkung', type: 'Lesart', desc: 'Material, Verarbeitung, Glanz oder formale Inszenierung können Rang oder Wertigkeit unterstützen.', caution: 'Status braucht Kontext und Vergleich.' },
  'Bedrohung': { label: 'bedrohliche Wirkung', type: 'Lesart', desc: 'Spitzen, harte Materialien, dunkle Verdichtung oder Rüstungseindruck können bedrohlich wirken.', caution: 'Nie nur aus einer einzelnen Spitze ableiten.' },
  'Offenheit': { label: 'offene Wirkung', type: 'Lesart', desc: 'Helle Flächen, Öffnungen oder transparente Bereiche können Zugänglichkeit oder Offenheit stützen.', caution: 'Offenheit ist stark kontextabhängig.' },
  'Ambivalenz': { label: 'ambivalente Wirkung', type: 'Lesart', desc: 'Widersprüchliche Merkmale erzeugen eine nicht eindeutig lesbare Figur.', caution: 'Nur nutzen, wenn echte Gegensätze vorhanden sind.' },
  'Identitätskonstruktion': { label: 'definierte Figurenwirkung', type: 'Lesart', desc: 'Kleidung macht die Figur als bestimmte Rolle, Haltung oder Selbstinszenierung lesbar.', caution: 'Keine konkrete Bedeutung allein; erst Szene, Pose und Erzählfunktion klären die Lesart.' },
  'performative Wirkung': { label: 'performative Wirkung', type: 'Lesart', desc: 'Das Outfit wirkt wie eine Rolle, Pose oder inszenierte Haltung.', caution: 'Mit Körperhaltung und Szene abgleichen.' },
  'Bild-/Medienwirkung': { label: 'bildmediale Wirkung', type: 'Lesart', desc: 'Linie, Fläche oder Layer wirken besonders stark als gezeichnetes/animiertes Bild.', caution: 'Relevant vor allem bei Anime, Comic und Filmstill.' },
  'Zurückhaltung': { label: 'zurückhaltende Wirkung', type: 'Lesart', desc: 'Reduktion, gedämpfte Farbe oder ruhige Fläche können eine unaufdringliche Wirkung erzeugen.', caution: 'Nicht automatisch Passivität.' }
};

const EFFECT_EXPLANATIONS = Object.fromEntries(Object.entries(EFFECT_META).map(([key, value]) => [key, value.desc]));


const STARTER_ELEMENTS = [
  // Silhouette / Körperform
  { category: 'Silhouette / Körperform', name: 'Körpernahe Silhouette', observation: 'Das Outfit folgt eng der Körperkontur und macht Proportionen deutlich lesbar.', source: 'Jenkyn Jones: Körper/Fabric-Interaktion; Bruzzi: Kleidung als Identitätskonstruktion.', effects: ['Körpernähe', 'Konturbetonung', 'Körperexponierung', 'Rahmung des Körpers', 'Identitätskonstruktion'] },
  { category: 'Silhouette / Körperform', name: 'Körperferne Silhouette', observation: 'Kleidung hält Abstand zum Körper und erzeugt eine eigene Außenform.', source: 'Jenkyn Jones: Silhouette/Volume; Hollander: bekleideter Körper als Bild.', effects: ['Körperdistanz', 'Volumenbildung', 'Verhüllung', 'Raumanspruch', 'Distanz'] },
  { category: 'Silhouette / Körperform', name: 'Vertikal gestreckte Silhouette', observation: 'Gesamtform, Länge oder Linienführung ziehen den Körper optisch nach oben oder unten.', source: 'Gestaltungslehre; Jenkyn Jones: Linie und Körperproportion.', effects: ['vertikale Streckung', 'Aufrichtung', 'Proportionierung', 'Hierarchie', 'Autorität'] },
  { category: 'Silhouette / Körperform', name: 'Horizontal verbreiterte Silhouette', observation: 'Schulter, Hüfte, Rockweite oder Querlinien erweitern den Körper seitlich.', source: 'Jenkyn Jones: Balance/Proportion; Fashion-Design-Analyse.', effects: ['horizontale Breitenwirkung', 'Breitenbetonung', 'Volumenbildung', 'Größenskalierung', 'Raumanspruch'] },
  { category: 'Silhouette / Körperform', name: 'Schulterbetonung', observation: 'Die Schulterzone wird durch Schnitt, Polsterung, Linie oder Detail erweitert oder gerahmt.', source: 'Jenkyn Jones: Körperlinie/Detail; Bruzzi: Kostüm als Identitätsmarker.', effects: ['Rahmung des Körpers', 'Breitenbetonung', 'Aufrichtung', 'Raumanspruch', 'Autorität'] },
  { category: 'Silhouette / Körperform', name: 'Taillenbetonung', observation: 'Die Körpermitte wird durch Schnitt, Gürtel, Naht oder Kontrast markiert.', source: 'Jenkyn Jones: Proportion, Balance und Detailposition.', effects: ['Zentrierung', 'Proportionierung', 'Rahmung des Körpers', 'Fixierung', 'Kontrolle'] },
  { category: 'Silhouette / Körperform', name: 'Layered / geschichtete Silhouette', observation: 'Mehrere Lagen verändern Kontur, Tiefe und Körperzugang.', source: 'Udale: Stoffschichtung/Textil; LaMarre: Layer und animierte Fläche als Anime-Kontext.', effects: ['Schichtung', 'Komplexität', 'Körperdistanz', 'Schutz', 'Bild-/Medienwirkung'] },
  { category: 'Silhouette / Körperform', name: 'Asymmetrische Silhouette', observation: 'Die Gesamtform ist links/rechts oder oben/unten bewusst unausgeglichen.', source: 'Jenkyn Jones: Balance/Asymmetrie; Gestaltungslehre.', effects: ['Asymmetrie', 'instabile Wirkung', 'Spannung', 'Blicklenkung', 'Ambivalenz'] },

  // Linie / Form
  { category: 'Linie / Form', name: 'Vertikale Linienführung', observation: 'Nähte, Kanten, Streifen, Verschlüsse oder Silhouettenzüge verlaufen überwiegend vertikal.', source: 'Gestaltungslehre; Jenkyn Jones: Linie/Silhouette.', effects: ['vertikale Streckung', 'Aufrichtung', 'Achsenbetonung', 'Blicklenkung', 'Hierarchie'] },
  { category: 'Linie / Form', name: 'Horizontale Linienführung', observation: 'Querlinien, Gürtel, Saumstufen oder Blockungen laufen deutlich horizontal.', source: 'Gestaltungslehre; Jenkyn Jones: Balance/Proportion.', effects: ['horizontale Breitenwirkung', 'Breitenbetonung', 'klare Begrenzung', 'Flächenruhe', 'Proportionierung'] },
  { category: 'Linie / Form', name: 'Diagonale Linienführung', observation: 'Linien oder Kanten schneiden den Körper schräg und erzeugen Richtung.', source: 'Gestaltungslehre: Richtung/Spannung.', effects: ['diagonale Spannung', 'gerichtete Bewegung', 'Spannung', 'instabile Wirkung', 'Blicklenkung'] },
  { category: 'Linie / Form', name: 'Kreis / Rundform', observation: 'Runde Formen, Öffnungen, Muster oder Konturen zentrieren und schließen Flächen.', source: 'Visuelle Grundelemente; Gestaltungslehre.', effects: ['Zentrierung', 'klare Begrenzung', 'Rhythmus', 'Rahmung des Körpers', 'Schutz'] },
  { category: 'Linie / Form', name: 'Dreieck / Spitze', observation: 'Spitze Formen oder Dreiecke erzeugen eine klare Richtung und Zuspitzung.', source: 'Visuelle Grundelemente: Form/Richtung.', effects: ['Zuspitzung', 'diagonale Spannung', 'Spannung', 'Blicklenkung', 'Bedrohung'] },
  { category: 'Linie / Form', name: 'Rechteck / Blockform', observation: 'Körper oder Kleidungsfläche erscheint als kompakter, begrenzter Block.', source: 'Gestaltungslehre: Form/Begrenzung/Ordnung.', effects: ['klare Begrenzung', 'Gliederung', 'Reduktion', 'Körperdistanz', 'Kontrolle'] },
  { category: 'Linie / Form', name: 'Kurve / organische Linie', observation: 'Linien folgen weichen Bögen, Wellen oder körpernahen Schwüngen.', source: 'Gestaltungslehre; Hollander: Körperbild und Linie.', effects: ['fließende Richtung', 'Richtungswechsel', 'Rahmung des Körpers', 'Rhythmus', 'Offenheit'] },
  { category: 'Linie / Form', name: 'Raster / Wiederholung', observation: 'Linien, Module oder Motive wiederholen sich regelmäßig und erzeugen Ordnung.', source: 'Gestaltungslehre; Barthes: Detail und System/Ensemble.', effects: ['Wiederholung', 'Rhythmus', 'Gliederung', 'institutioneller Bezug', 'formale Strenge'] },

  // Farbe / Farbfamilie
  { category: 'Farbe / Farbfamilie', name: 'Schwarz', observation: 'Schwarz ist als sichtbare Farbfamilie eingesetzt.', source: 'Farbbeobachtung; Deutung nur mit Tonwert, Fläche, Material und Kontext.', effects: ['dunkle Farbfamilie', 'dunkler Tonwert', 'Konturverstärkung', 'Flächenruhe'] },
  { category: 'Farbe / Farbfamilie', name: 'Weiß', observation: 'Weiß ist als sichtbare Farbfamilie eingesetzt.', source: 'Farbbeobachtung; Deutung nur mit Tonwert, Fläche, Material und Kontext.', effects: ['helle Farbfamilie', 'heller Tonwert', 'Lichtreflexion', 'Flächenruhe'] },
  { category: 'Farbe / Farbfamilie', name: 'Grau', observation: 'Grau oder graunahe Farbtöne sind sichtbar eingesetzt.', source: 'Farbbeobachtung; Entsättigung/Tonwert beachten.', effects: ['neutrale Farbfamilie', 'geringe Sättigung', 'Flächenruhe', 'Zurückhaltung'] },
  { category: 'Farbe / Farbfamilie', name: 'Rot', observation: 'Ein roter Farbton ist sichtbar eingesetzt.', source: 'Bellantoni/Itten als Rahmen: Rot nicht als fixe Symbolik, sondern über Sättigung, Fläche und Kontext.', effects: ['rote Farbfamilie', 'warme Farbfamilie', 'warme Farbtemperatur', 'Signalwirkung'] },
  { category: 'Farbe / Farbfamilie', name: 'Blau', observation: 'Ein blauer Farbton ist sichtbar eingesetzt.', source: 'Farbbeobachtung; Wirkung abhängig von Tonwert, Sättigung und Szene.', effects: ['blaue Farbfamilie', 'kalte Farbfamilie', 'kalte Farbtemperatur', 'Distanz'] },
  { category: 'Farbe / Farbfamilie', name: 'Gelb', observation: 'Ein gelber Farbton ist sichtbar eingesetzt.', source: 'Farbbeobachtung; Wirkung abhängig von Sättigung, Fläche und Kontrast.', effects: ['gelbe Farbfamilie', 'warme Farbfamilie', 'Signalwirkung', 'Farbakzent'] },
  { category: 'Farbe / Farbfamilie', name: 'Grün', observation: 'Ein grüner Farbton ist sichtbar eingesetzt.', source: 'Farbbeobachtung; Wirkung abhängig von Natur-/Technik-/Genre-Kontext.', effects: ['grüne Farbfamilie', 'kalte Farbfamilie', 'Naturbezug', 'Ambivalenz'] },
  { category: 'Farbe / Farbfamilie', name: 'Orange', observation: 'Ein oranger Farbton ist sichtbar eingesetzt.', source: 'Farbbeobachtung; warm, flächen- und sättigungsabhängig.', effects: ['warme Farbfamilie', 'warme Farbtemperatur', 'Signalwirkung', 'Farbakzent'] },
  { category: 'Farbe / Farbfamilie', name: 'Violett / Lila', observation: 'Ein violetter oder lilafarbener Ton ist sichtbar eingesetzt.', source: 'Bellantoni vorsichtig: narrativ prüfen, keine fixe Symbolik.', effects: ['violette Farbfamilie', 'kalte Farbfamilie', 'Ambivalenz', 'Bild-/Medienwirkung'] },
  { category: 'Farbe / Farbfamilie', name: 'Rosa / Pink', observation: 'Ein rosa oder pinker Farbton ist sichtbar eingesetzt.', source: 'Farbbeobachtung; kulturelle Codierung nur kontextabhängig.', effects: ['rosa Farbfamilie', 'hohe Sättigung', 'Farbakzent', 'Identitätskonstruktion'] },
  { category: 'Farbe / Farbfamilie', name: 'Braun', observation: 'Braune oder erdnahe Farbtöne sind sichtbar eingesetzt.', source: 'Farbbeobachtung; Material-/Naturbezug prüfen.', effects: ['braune Farbfamilie', 'warme Farbfamilie', 'Naturbezug', 'geringe Sättigung'] },
  { category: 'Farbe / Farbfamilie', name: 'Beige / Nude', observation: 'Beige, hautnahe oder nude-nahe Farbtöne sind sichtbar eingesetzt.', source: 'Farbbeobachtung; Körpernähe und Tonwertkontext prüfen.', effects: ['neutrale Farbfamilie', 'helle Farbfamilie', 'geringe Sättigung', 'Körpernähe'] },
  { category: 'Farbe / Farbfamilie', name: 'Gold', observation: 'Goldfarbene oder goldähnliche Akzente/Oberflächen sind sichtbar.', source: 'Farbe + Oberfläche; nicht automatisch Luxus, aber Wertcodierung möglich.', effects: ['metallische Farbfamilie', 'warme Farbfamilie', 'Glanz', 'Markt-/Wertbezug'] },
  { category: 'Farbe / Farbfamilie', name: 'Silber', observation: 'Silberfarbene oder metallisch kühle Akzente/Oberflächen sind sichtbar.', source: 'Farbe + Oberfläche; technische oder metallische Wirkung kontextabhängig.', effects: ['metallische Farbfamilie', 'kalte Farbfamilie', 'Glanz', 'Technikbezug'] },

  // Farbwirkung / Tonwert
  { category: 'Farbwirkung / Tonwert', name: 'Dunkler Tonwert', observation: 'Große oder dominante dunkle Flächen verdichten die Silhouette.', source: 'Itten: Hell-Dunkel-Kontrast; Bellantoni: Farbe im visuellen Erzählen.', effects: ['dunkler Tonwert', 'Hell-Dunkel-Kontrast', 'Flächenruhe', 'Konturverstärkung'] },
  { category: 'Farbwirkung / Tonwert', name: 'Heller Tonwert', observation: 'Helle Flächen reflektieren Licht und lassen Formen offener wirken.', source: 'Itten: Hell-Dunkel; Hollander: Bildwirkung des bekleideten Körpers.', effects: ['heller Tonwert', 'Lichtreflexion', 'Flächenruhe', 'Offenheit'] },
  { category: 'Farbwirkung / Tonwert', name: 'Hohe Sättigung', observation: 'Die Farbe wirkt kräftig, rein oder signalhaft.', source: 'Itten: Qualitäts-/Sättigungskontrast; Bellantoni: visuelle Reaktion auf starke Farbe.', effects: ['hohe Sättigung', 'Signalwirkung', 'Kontrastfokus', 'Farbakzent'] },
  { category: 'Farbwirkung / Tonwert', name: 'Geringe Sättigung / entsättigt', observation: 'Die Farbe wirkt gebrochen, gedämpft, graunah oder erdnah.', source: 'Itten: Qualitätskontrast.', effects: ['geringe Sättigung', 'Flächenruhe', 'Gebrauchsspur', 'Zurückhaltung'] },
  { category: 'Farbwirkung / Tonwert', name: 'Warme Farbtemperatur', observation: 'Rot-, Orange-, Gelb- oder warme Erdtöne dominieren die Farbwirkung.', source: 'Itten: Warm-Kalt-Kontrast; Bellantoni: Farbe im Filmkontext.', effects: ['warme Farbtemperatur', 'warme Farbfamilie', 'Signalwirkung', 'Nähewirkung'] },
  { category: 'Farbwirkung / Tonwert', name: 'Kalte Farbtemperatur', observation: 'Blau-, Grün-, Violett- oder kühle Grauwerte dominieren die Farbwirkung.', source: 'Itten: Warm-Kalt-Kontrast; Bellantoni: Farbe im Filmkontext.', effects: ['kalte Farbtemperatur', 'kalte Farbfamilie', 'Distanz', 'Flächenruhe'] },
  { category: 'Farbwirkung / Tonwert', name: 'Farblicher Akzent', observation: 'Eine kleine Farbfläche zieht den Blick auf eine bestimmte Stelle.', source: 'Itten: Quantitätskontrast; Filmische Blicklenkung.', effects: ['Farbakzent', 'Blicklenkung', 'Kontrastfokus', 'Narrativer Farbfokus'] },
  { category: 'Farbwirkung / Tonwert', name: 'Großflächige Farbfläche', observation: 'Eine Farbe nimmt einen großen Teil des Outfits ein.', source: 'Itten: Quantität; Bellantoni: Farbfläche und emotionale Wirkung.', effects: ['große Farbfläche', 'Farbquantität', 'Flächenruhe', 'Identitätskonstruktion'] },
  { category: 'Farbwirkung / Tonwert', name: 'Starker Hell-Dunkel-Kontrast', observation: 'Sehr helle und sehr dunkle Flächen stehen sichtbar gegeneinander.', source: 'Itten: Hell-Dunkel-Kontrast.', effects: ['Hell-Dunkel-Kontrast', 'Kontrastfokus', 'Blicklenkung', 'Konturverstärkung'] },
  { category: 'Farbwirkung / Tonwert', name: 'Monochrome Farbigkeit', observation: 'Das Outfit bleibt überwiegend innerhalb einer Farbfamilie.', source: 'Farbkomposition; Reduktion und Flächenwirkung.', effects: ['monochrome Farbigkeit', 'Reduktion', 'Flächenruhe', 'Identitätskonstruktion'] },
  { category: 'Farbwirkung / Tonwert', name: 'Komplementärkontrast', observation: 'Gegensätzliche Farbbereiche stehen deutlich zueinander.', source: 'Itten: Komplementärkontrast.', effects: ['Komplementärkontrast', 'Kontrastfokus', 'Spannung', 'Blicklenkung'] },

  // Material / konkretes Material
  { category: 'Material / konkretes Material', name: 'Leder', observation: 'Leder oder eine lederartige Oberfläche ist erkennbar.', source: 'Konkretes Material zählt unterstützend; Lesart über Oberfläche, Schnitt und Kontext prüfen.', effects: ['lederartige Materialassoziation', 'Schutzwirkung des Materials', 'Blickdichte'] },
  { category: 'Material / konkretes Material', name: 'Baumwolle', observation: 'Baumwollartige textile Grundmaterialität ist erkennbar.', source: 'Udale/Jenkyn Jones: Materialwahl, Griff und Körperinteraktion.', effects: ['baumwollartige Materialassoziation', 'matte Oberfläche', 'textile Grundmaterialität'] },
  { category: 'Material / konkretes Material', name: 'Wolle', observation: 'Wolle oder wollartige Struktur ist erkennbar.', source: 'Udale: Naturfasern, Griff, Wärme und Struktur.', effects: ['wollartige Materialassoziation', 'sichtbare Textur', 'schwere Wirkung'] },
  { category: 'Material / konkretes Material', name: 'Seide / Satin', observation: 'Seidige, satinierte oder sehr glatte textile Oberfläche ist erkennbar.', source: 'Udale/Jenkyn Jones: Glanz, Fall und Griff.', effects: ['seidige Materialassoziation', 'Glanz', 'fließender Fall'] },
  { category: 'Material / konkretes Material', name: 'Denim', observation: 'Denim oder denimartige Köperstruktur ist erkennbar.', source: 'Konkretes Material; keine feste nationale Bedeutung.', effects: ['denimartige Materialassoziation', 'sichtbare Textur', 'Workwear-/Utility-Bezug'] },
  { category: 'Material / konkretes Material', name: 'Nylon / Tech-Gewebe', observation: 'Technisch wirkendes synthetisches Gewebe ist erkennbar.', source: 'Udale: synthetische Fasern und Performance-Fabrics.', effects: ['technische Materialassoziation', 'technische Funktion', 'Sport-/Performance-Bezug'] },
  { category: 'Material / konkretes Material', name: 'Mesh / Netz', observation: 'Netzartige oder perforierte textile Struktur ist sichtbar.', source: 'Udale: Netz/Transparenz/Struktur.', effects: ['netzartige Materialassoziation', 'Durchlässigkeit', 'Transparenz'] },
  { category: 'Material / konkretes Material', name: 'Strick', observation: 'Gestrickte oder maschige Struktur ist sichtbar.', source: 'Udale: Knit construction.', effects: ['strickartige Materialassoziation', 'sichtbare Textur', 'Elastizität'] },
  { category: 'Material / konkretes Material', name: 'Metall / Metallteile', observation: 'Metallische Teile, Platten, Ketten oder Beschläge sind sichtbar.', source: 'Materialassoziation + Detailfunktion; Kontext prüfen.', effects: ['metallische Materialassoziation', 'Glanz', 'Rüstungseindruck'] },
  { category: 'Material / konkretes Material', name: 'Latex / Vinyl / Kunststoff', observation: 'Kunststoffartige, beschichtete oder stark glänzende Oberfläche ist erkennbar.', source: 'Materialassoziation; Deutung nur über Oberfläche und Kontext.', effects: ['kunststoffartige Materialassoziation', 'Glanz', 'Blickdichte'] },
  { category: 'Material / konkretes Material', name: 'Leinen', observation: 'Leinenartige, trocken strukturierte textile Oberfläche ist erkennbar.', source: 'Udale: Naturfasern, Griff, Webstruktur.', effects: ['leinenartige Materialassoziation', 'sichtbare Textur', 'matte Oberfläche'] },
  { category: 'Material / konkretes Material', name: 'Fell / Pelzoptik', observation: 'Fellartige oder pelzähnliche Oberfläche ist sichtbar.', source: 'Materialassoziation; Natur-/Status-/Schutzbezug kontextabhängig.', effects: ['fellartige Materialassoziation', 'sichtbare Textur', 'schwere Wirkung'] },

  // Material / Oberfläche
  { category: 'Material / Oberfläche', name: 'Fließender Stoff', observation: 'Material fällt weich, reagiert auf Bewegung und bildet weiche Falten.', source: 'Udale/Jenkyn Jones: Drape, Handle und Stoff-Körper-Interaktion.', effects: ['fließender Fall', 'Leichtigkeit', 'fließende Richtung', 'Körpernähe'] },
  { category: 'Material / Oberfläche', name: 'Steifer Stoff', observation: 'Material hält Abstand zum Körper und bildet klare, stabile Formen.', source: 'Udale/Jenkyn Jones: Steifigkeit, Konstruktion, Volumen.', effects: ['Steifigkeit', 'Körperdistanz', 'Volumenbildung', 'formale Strenge'] },
  { category: 'Material / Oberfläche', name: 'Schweres Material', observation: 'Material wirkt dicht, schwer oder stark belastend auf die Silhouette.', source: 'Textil- und Materialanalyse: Gewicht und Fall.', effects: ['schwere Wirkung', 'Körperdistanz', 'Blickdichte', 'Schutz'] },
  { category: 'Material / Oberfläche', name: 'Leichtes Material', observation: 'Material wirkt luftig, dünn oder beweglich.', source: 'Textil- und Materialanalyse: Gewicht und Transparenz.', effects: ['Leichtigkeit', 'Durchlässigkeit', 'fließender Fall', 'Offenheit'] },
  { category: 'Material / Oberfläche', name: 'Glänzende Oberfläche', observation: 'Oberfläche reflektiert Licht und verändert sich je nach Bewegung oder Beleuchtung.', source: 'Udale: Finish/Laminate; Jenkyn Jones: Texturkontrast; Bellantoni: Licht/Farbe im Bild.', effects: ['Glanz', 'Oberflächenkontrast', 'Lichtreflexion', 'Blicklenkung'] },
  { category: 'Material / Oberfläche', name: 'Matte Oberfläche', observation: 'Oberfläche absorbiert Licht, wirkt ruhiger und weniger reflektierend.', source: 'Udale: Surface/Fabric; Hollander: Wahrnehmung durch Bildstil.', effects: ['matte Oberfläche', 'Flächenruhe', 'sichtbare Textur', 'Zurückhaltung'] },
  { category: 'Material / Oberfläche', name: 'Rau / texturiert', observation: 'Oberfläche zeigt fühlbare oder sichtbare Struktur.', source: 'Udale: Texture/Manipulation; Jenkyn Jones: taktile Erfahrung.', effects: ['sichtbare Textur', 'haptischer Eindruck', 'Oberflächenkontrast', 'Gebrauchsspur'] },
  { category: 'Material / Oberfläche', name: 'Transparent / transluzent', observation: 'Darunterliegende Schichten oder Körperpartien bleiben teilweise sichtbar.', source: 'Udale: transparente Textilien; Jenkyn Jones: Körper/Fabric-Grenze.', effects: ['Transparenz', 'Durchlässigkeit', 'Körperexponierung', 'Grenzmarkierung', 'Verletzlichkeit'] },
  { category: 'Material / Oberfläche', name: 'Elastisch / Stretch', observation: 'Material dehnt sich über den Körper und hält oder begleitet Bewegung.', source: 'Udale: Spandex/Stretch; Jenkyn Jones: Körperinteraktion.', effects: ['Elastizität', 'Körpernähe', 'Konturbetonung', 'technische Funktion', 'Sport-/Performance-Bezug'] },
  { category: 'Material / Oberfläche', name: 'Gebrauchsspuren / Patina', observation: 'Material zeigt Abrieb, Alterung, Flecken, Risse oder reparierte Stellen.', source: 'Materialanalyse; Kleidung als Gebrauchsspur und Narrativ.', effects: ['Gebrauchsspur', 'haptischer Eindruck', 'Workwear-/Utility-Bezug', 'Alltagscodierung'] },

  // Detail / Konstruktion
  { category: 'Detail / Konstruktion', name: 'Sichtbare Nähte', observation: 'Konstruktionslinien bleiben sichtbar und gliedern die Oberfläche.', source: 'Jenkyn Jones: Schnitt/Pattern; Barthes: Detail im Ensemble.', effects: ['sichtbare Konstruktion', 'handwerkliche Spur', 'Gliederung', 'Blicklenkung', 'Schnittlinie'] },
  { category: 'Detail / Konstruktion', name: 'Sichtbarer Reißverschluss', observation: 'Eine technische Öffnungs- und Schließlinie wird sichtbar ausgestellt.', source: 'Konstruktionsanalyse; Jenkyn Jones: Detail/Fastening.', effects: ['Öffnen/Schließen', 'sichtbare Funktionalität', 'Blicklenkung', 'Technikbezug'] },
  { category: 'Detail / Konstruktion', name: 'Schnallen / Riemen / Gurte', observation: 'Verstell- oder Fixierelemente strukturieren den Körper oder begrenzen Bewegung.', source: 'Konstruktionsanalyse; Bruzzi: Kostümdetail als Identitätsmarker.', effects: ['Fixierung', 'Eindruck von Bewegungseinschränkung', 'sichtbare Funktionalität', 'Schutzfunktion', 'Kontrolle'] },
  { category: 'Detail / Konstruktion', name: 'Hoher Kragen / Gesichtseinfassung', observation: 'Der Hals- und Gesichtsbereich wird eingefasst, verlängert oder abgeschirmt.', source: 'Jenkyn Jones: Neckline/Detail; Hollander: Körperbild im Kleid.', effects: ['Rahmung des Körpers', 'Schutzfunktion', 'Körperdistanz', 'Aufrichtung', 'Distanz'] },
  { category: 'Detail / Konstruktion', name: 'Taschen / Utility-Elemente', observation: 'Funktionale Zusatzräume erweitern Kleidung praktisch und visuell.', source: 'Udale/Jenkyn Jones: Konstruktion/Funktion; Workwear-Code.', effects: ['sichtbare Funktionalität', 'modulare Ordnung', 'Workwear-/Utility-Bezug', 'Sport-/Performance-Bezug', 'Alltagscodierung'] },
  { category: 'Detail / Konstruktion', name: 'Falten / Pleats', observation: 'Regelmäßige Stoffbrüche erzeugen Rhythmus, Volumen und Bewegungsreserve.', source: 'Jenkyn Jones: Rhythmus/Designlinie; Udale: Fabric Manipulation.', effects: ['Rhythmus', 'Wiederholung', 'Volumenbildung', 'gerichtete Bewegung', 'formale Strenge'] },
  { category: 'Detail / Konstruktion', name: 'Stickerei / Applikation / Oberflächenarbeit', observation: 'Zusätzliche textile Arbeit erhöht Oberflächenkomplexität und Wertanmutung.', source: 'Udale: Embroidery/Embellishment; Barthes: Detail und Ensemble.', effects: ['Ornament', 'Komplexität', 'handwerkliche Spur', 'Luxus-/Couture-Bezug', 'Ritual-/Zeremonialbezug'] },
  { category: 'Detail / Konstruktion', name: 'Emblem / Abzeichen / Rangzeichen', observation: 'Zeichenhafte Details verweisen auf Gruppe, Rang, Institution oder Zugehörigkeit.', source: 'Barthes/Barnard: Kleidung als Zeichen; Bruzzi: Identität durch Kostüm.', effects: ['institutioneller Bezug', 'Uniformbezug', 'Hierarchie', 'Zugehörigkeit', 'Status'] },
  { category: 'Detail / Konstruktion', name: 'Wiederholtes Detail / Modul', observation: 'Ein Detailtyp wiederholt sich sichtbar und erzeugt ein System auf der Oberfläche.', source: 'Barthes: Zeichen/System; Jenkyn Jones: Wiederholung/Rhythmus.', effects: ['Detail-Wiederholung', 'Wiederholung', 'Rhythmus', 'modulare Ordnung', 'Bild-/Medienwirkung'] },

  // Referenz / Kontext
  { category: 'Referenz / Kontext', name: 'Uniformcode', observation: 'Wiedererkennbare Elemente institutioneller Gleichförmigkeit, Rangordnung oder Gruppenzugehörigkeit.', source: 'Barnard/Barthes: Kleidung als Code; Bruzzi: Kostüm und Identität.', effects: ['Uniformbezug', 'institutioneller Bezug', 'Hierarchie', 'Zugehörigkeit', 'Autorität'] },
  { category: 'Referenz / Kontext', name: 'Arbeitskleidungscode / Utility', observation: 'Material, Schnitt oder Detail verweisen auf Arbeit, Gebrauch, Funktion oder Belastbarkeit.', source: 'Udale/Jenkyn Jones: Funktion und Material; Kawamura: Kleidung vs. Fashion.', effects: ['Workwear-/Utility-Bezug', 'sichtbare Funktionalität', 'Gebrauchsspur', 'handwerkliche Spur', 'Alltagscodierung'] },
  { category: 'Referenz / Kontext', name: 'Sport-/Performance-Code', observation: 'Material, Körpernähe, Stretch oder technische Details verweisen auf Bewegung und Leistung.', source: 'Udale: Performance Fabrics; Jenkyn Jones: Körper und Bewegung.', effects: ['Sport-/Performance-Bezug', 'Körpernähe', 'sichtbare Funktionalität', 'technische Funktion', 'Technikbezug'] },
  { category: 'Referenz / Kontext', name: 'Luxus-/Couture-Code', observation: 'Material, Verarbeitung, Glanz, Ornament oder Seltenheit verweisen auf hohe Wertigkeit.', source: 'Udale: Marktlevel/Couture; Kawamura: Fashion als institutionell erzeugter Wert.', effects: ['Luxus-/Couture-Bezug', 'Ornament', 'Status', 'Markt-/Wertbezug'] },
  { category: 'Referenz / Kontext', name: 'Rüstungscode / Schutzcode', observation: 'Material, Volumen, Kanten oder Details erinnern an Panzerung, Abschirmung oder Kampfbereitschaft.', source: 'Bruzzi: Kostüm und Identität; Material-/Konstruktionsanalyse.', effects: ['Rüstungseindruck', 'Schutzfunktion', 'Schutz', 'Körperdistanz', 'Bedrohung'] },
  { category: 'Referenz / Kontext', name: 'Ritual-/Zeremonialcode', observation: 'Formale, ornamentale oder symbolisch aufgeladene Elemente verweisen auf besondere Handlungen.', source: 'Barthes/Barnard: Kleidung als Zeichen; Bruzzi: filmische Kostümfunktion.', effects: ['Ritual-/Zeremonialbezug', 'formale Strenge', 'Hierarchie', 'Ornament', 'Status'] },
  { category: 'Referenz / Kontext', name: 'Subkulturelle Codierung', observation: 'Materialien, Schnitte oder Zeichen markieren Abgrenzung von Mainstream-Codes.', source: 'Barnard: Mode als Kommunikation; Barthes: Subversion/Recuperation als methodische Vorsicht.', effects: ['Subkulturbezug', 'Abgrenzung', 'Gebrauchsspur', 'Fragmentierung', 'Identitätskonstruktion'] },
  { category: 'Referenz / Kontext', name: 'Anime-/Genre-Codierung', observation: 'Outfitmerkmale verweisen auf Genre, Figurentyp, Medienlogik oder stilisierte Anime-Konvention.', source: 'LaMarre: Anime als bewegtes materielles Bild; Denison: Anime als hybrides kontextabhängiges Feld.', effects: ['Genrebezug', 'Bild-/Medienwirkung', 'Narrativer Farbfokus', 'Identitätskonstruktion', 'Transformation'] }
];

// ── STATE ────────────────────────────────────────────────

const DEFAULT_STATE = {
  categories: [],
  effects: [],
  elements: [],
  selectedElementIds: [],
  uploadedImageDataUrl: null,
  activeAdminTab: 'elements',
  activeMobileStep: 0
};

let state = structuredClone(DEFAULT_STATE);
let history = [];
let historyIndex = -1;
let _skipHistory = false;

const adminFormState = {
  loadedElementId: null,
  loadedEffectId: null,
  loadedCategoryId: null
};

// ── DOM REFS ─────────────────────────────────────────────

const els = {
  adminOpen: document.getElementById('adminOpen'),
  adminClose: document.getElementById('adminClose'),
  adminModal: document.getElementById('adminModal'),
  methodologyOpen: document.getElementById('methodologyOpen'),
  methodologyClose: document.getElementById('methodologyClose'),
  methodologyModal: document.getElementById('methodologyModal'),
  methodologyContent: document.getElementById('methodologyContent'),
  adminTabs: document.getElementById('adminTabs'),
  adminForm: document.getElementById('adminForm'),
  adminList: document.getElementById('adminList'),
  categoryList: document.getElementById('categoryList'),
  selectionView: document.getElementById('selectionView'),
  analysisView: document.getElementById('analysisView'),
  clearSelection: document.getElementById('clearSelection'),
  randomAll: document.getElementById('randomAll'),
  randomByCategory: document.getElementById('randomByCategory'),
  imageUpload: document.getElementById('imageUpload'),
  clearImage: document.getElementById('clearImage'),
  mergeStarter: document.getElementById('mergeStarter'),
  applyGroups: document.getElementById('applyGroups'),
  exportData: document.getElementById('exportData'),
  importTrigger: document.getElementById('importTrigger'),
  importFile: document.getElementById('importFile'),
  undoBtn: document.getElementById('undoBtn'),
  redoBtn: document.getElementById('redoBtn'),
  stepper: document.getElementById('stepper'),
  mainLayout: document.getElementById('mainLayout')
};

// ── UTILS ────────────────────────────────────────────────

function createId(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
function slugify(value) { return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || createId('id'); }
function normalize(value) { return String(value || '').trim().toLowerCase(); }
function escapeHtml(value) { return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;'); }

let toastTimer = null;
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

// ── HISTORY (UNDO / REDO) ────────────────────────────────

function snapshotForHistory() {
  const snap = JSON.parse(JSON.stringify({
    categories: state.categories,
    effects: state.effects,
    elements: state.elements,
    selectedElementIds: state.selectedElementIds
  }));
  return snap;
}

function pushHistory() {
  if (_skipHistory) return;
  const snap = snapshotForHistory();
  if (historyIndex < history.length - 1) history = history.slice(0, historyIndex + 1);
  history.push(snap);
  if (history.length > HISTORY_MAX) history.shift();
  historyIndex = history.length - 1;
  updateUndoRedoBtns();
}

function undo() {
  if (historyIndex <= 0) return;
  historyIndex -= 1;
  restoreSnapshot(history[historyIndex]);
  showToast('↩ Undo');
}

function redo() {
  if (historyIndex >= history.length - 1) return;
  historyIndex += 1;
  restoreSnapshot(history[historyIndex]);
  showToast('↪ Redo');
}

function restoreSnapshot(snap) {
  _skipHistory = true;
  state.categories = snap.categories;
  state.effects = snap.effects;
  state.elements = snap.elements;
  state.selectedElementIds = snap.selectedElementIds;
  saveState();
  renderApp();
  _skipHistory = false;
  updateUndoRedoBtns();
}

function updateUndoRedoBtns() {
  els.undoBtn.disabled = historyIndex <= 0;
  els.redoBtn.disabled = historyIndex >= history.length - 1;
}

// ── PERSISTENCE ──────────────────────────────────────────

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    state = structuredClone(DEFAULT_STATE);
    mergeStarterData(false);
    pushHistory();
    return;
  }
  try {
    const parsed = JSON.parse(saved);
    state = { ...structuredClone(DEFAULT_STATE), ...parsed };
    state.categories = Array.isArray(state.categories) ? state.categories : [];
    state.effects = Array.isArray(state.effects) ? state.effects : [];
    state.elements = Array.isArray(state.elements) ? state.elements : [];
    state.selectedElementIds = Array.isArray(state.selectedElementIds) ? state.selectedElementIds : [];
    ensureCoreCategories();
    applyEffectGroups(false);
    cleanInvalidSelections();
    saveState();
    pushHistory();
  } catch (error) {
    console.error(error);
    state = structuredClone(DEFAULT_STATE);
    mergeStarterData(false);
    pushHistory();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('localStorage full, image not persisted', e);
    const stateWithoutImage = { ...state, uploadedImageDataUrl: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithoutImage));
  }
}

// ── EXPORT / IMPORT ──────────────────────────────────────

function exportData() {
  const exportState = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: state.categories,
    effects: state.effects,
    elements: state.elements,
    selectedElementIds: state.selectedElementIds
  };
  const blob = new Blob([JSON.stringify(exportState, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mik-tool-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Export gespeichert');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed.categories || !parsed.effects || !parsed.elements) throw new Error('Invalid format');
      if (!confirm('Import überschreibt aktuelle Daten (ohne Bild). Fortfahren?')) return;
      state.categories = Array.isArray(parsed.categories) ? parsed.categories : state.categories;
      state.effects = Array.isArray(parsed.effects) ? parsed.effects : state.effects;
      state.elements = Array.isArray(parsed.elements) ? parsed.elements : state.elements;
      state.selectedElementIds = Array.isArray(parsed.selectedElementIds) ? parsed.selectedElementIds : [];
      ensureCoreCategories();
      sortEffectsByGroup();
      cleanInvalidSelections();
      saveState();
      pushHistory();
      renderApp();
      showToast('Import erfolgreich');
    } catch (error) {
      alert('Import fehlgeschlagen: Ungültiges Format.');
    }
  };
  reader.readAsText(file);
  els.importFile.value = '';
}

// ── DATA HELPERS ─────────────────────────────────────────

function ensureCoreCategories() {
  CORE_CATEGORIES.forEach(name => {
    const id = slugify(name);
    let existing = state.categories.find(c => normalize(c.id) === id || normalize(c.name) === normalize(name));
    if (!existing) state.categories.push({ id, name, type: 'core' });
    else { existing.id = id; existing.name = name; existing.type = 'core'; }
  });
}

function getEffectGroupForName(effectName) {
  const id = slugify(effectName);
  return EFFECT_GROUPS.find(g => g.effects.some(n => slugify(n) === id)) || null;
}

function applyEffectGroups(showAlert = true) {
  let updated = 0;
  state.effects.forEach(effect => {
    const group = getEffectGroupForName(effect.name);
    if (!group) return;
    const prev = effect.color + effect.group + effect.layer + effect.theory;
    effect.id = slugify(effect.name);
    effect.color = group.color;
    effect.group = group.name;
    effect.layer = group.layer;
    effect.theory = group.theory;
    if (prev !== effect.color + effect.group + effect.layer + effect.theory) updated++;
  });
  sortEffectsByGroup();
  saveState();
  renderApp();
  if (showAlert) showToast(`Gruppen-Farben angewendet (${updated} aktualisiert)`);
}

function mergeStarterData(showAlert = true) {
  let addedC = 0, addedE = 0, addedEl = 0;
  if (!Array.isArray(state.categories)) state.categories = [];
  if (!Array.isArray(state.effects)) state.effects = [];
  if (!Array.isArray(state.elements)) state.elements = [];
  if (!Array.isArray(state.selectedElementIds)) state.selectedElementIds = [];

  CORE_CATEGORIES.forEach(name => {
    const id = slugify(name);
    let existing = state.categories.find(c => normalize(c.id) === id || normalize(c.name) === normalize(name));
    if (!existing) { state.categories.push({ id, name, type: 'core' }); addedC++; }
    else { existing.id = id; existing.name = name; existing.type = 'core'; }
  });

  EFFECT_GROUPS.forEach(group => {
    group.effects.forEach(name => {
      const id = slugify(name);
      let existing = state.effects.find(e => normalize(e.id) === id || normalize(e.name) === normalize(name));
      if (!existing) { state.effects.push({ id, name, color: group.color, group: group.name, layer: group.layer, theory: group.theory }); addedE++; }
      else { existing.id = id; existing.name = name; existing.color = group.color; existing.group = group.name; existing.layer = group.layer; existing.theory = group.theory; }
    });
  });

  STARTER_ELEMENTS.forEach(item => {
    const categoryId = slugify(item.category);
    const effectIds = item.effects.map(n => slugify(n));
    let existing = state.elements.find(el => normalize(el.name) === normalize(item.name) && normalize(el.categoryId) === categoryId);
    if (!existing) { state.elements.push({ id: createId('element'), name: item.name, categoryId, effectIds, observation: item.observation || '', source: item.source || '' }); addedEl++; }
    else { existing.effectIds = [...new Set([...(existing.effectIds || []), ...effectIds])]; existing.observation = item.observation || existing.observation || ''; existing.source = item.source || existing.source || ''; }
  });

  sortEffectsByGroup();
  cleanInvalidSelections();
  saveState();
  pushHistory();
  renderApp();
  if (showAlert) showToast(`Merge: +${addedC} Kat., +${addedE} Eff., +${addedEl} Elem.`);
}

function sortEffectsByGroup() {
  const groupOrder = new Map(EFFECT_GROUPS.map((g, i) => [g.name, i]));
  const effectOrder = new Map();
  EFFECT_GROUPS.forEach(g => g.effects.forEach((n, i) => effectOrder.set(slugify(n), i)));
  state.effects.sort((a, b) => {
    const gA = groupOrder.has(a.group) ? groupOrder.get(a.group) : 999;
    const gB = groupOrder.has(b.group) ? groupOrder.get(b.group) : 999;
    if (gA !== gB) return gA - gB;
    const eA = effectOrder.has(a.id) ? effectOrder.get(a.id) : 999;
    const eB = effectOrder.has(b.id) ? effectOrder.get(b.id) : 999;
    if (eA !== eB) return eA - eB;
    return a.name.localeCompare(b.name, 'de');
  });
}

function cleanInvalidSelections() {
  const ids = new Set(state.elements.map(e => e.id));
  state.selectedElementIds = state.selectedElementIds.filter(id => ids.has(id));
}

function getCategoryName(categoryId) { return state.categories.find(c => c.id === categoryId)?.name || 'Uncategorized'; }
function getEffectName(effectId) { return state.effects.find(e => e.id === effectId)?.name || effectId; }

function groupEffects(effects) {
  const grouped = new Map();
  effects.forEach(e => {
    const g = e.group || 'Eigene Effekte';
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g).push(e);
  });
  return grouped;
}

// ── ANALYSIS ─────────────────────────────────────────────

function categoryWeight(categoryName) {
  if (categoryName === 'Material / konkretes Material') return 0.6;
  if (categoryName === 'Farbe / Farbfamilie') return 0.8;
  if (categoryName === 'Referenz / Kontext') return 0.9;
  return 1;
}

function formatCount(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',');
}

function analyzeSelection() {
  const selectedMerkmale = state.selectedElementIds.map(id => state.elements.find(e => e.id === id)).filter(Boolean);
  const effectMap = new Map();
  selectedMerkmale.forEach(el => {
    const catName = getCategoryName(el.categoryId);
    const weight = categoryWeight(catName);
    (el.effectIds || []).forEach(effectId => {
      const effect = state.effects.find(e => e.id === effectId);
      if (!effect) return;
      if (!effectMap.has(effectId)) effectMap.set(effectId, { effectId, name: effect.name, color: effect.color, group: effect.group || 'Andere', layer: effect.layer || 'Nicht zugeordnet', theory: effect.theory || 'Eigene Zuordnung', count: 0, sources: [] });
      const entry = effectMap.get(effectId);
      entry.count += weight;
      if (!entry.sources.includes(el.name)) entry.sources.push(el.name);
    });
  });
  return [...effectMap.values()].sort((a, b) => b.count !== a.count ? b.count - a.count : a.name.localeCompare(b.name, 'de'));
}

function analyzeByGroup(analysis) {
  const groupMap = new Map();
  analysis.forEach(item => {
    const g = item.group;
    if (!groupMap.has(g)) groupMap.set(g, { name: g, count: 0, color: item.color, layer: item.layer, theory: item.theory });
    groupMap.get(g).count += item.count;
  });
  return [...groupMap.values()].sort((a, b) => b.count - a.count);
}

// ── RENDER: MAIN ─────────────────────────────────────────

function renderApp() {
  renderElementSelection();
  renderSelection();
  renderAnalysis();
  renderAdmin();
  renderMobileStepper();
}

function renderMobileStepper() {
  const panels = els.mainLayout.querySelectorAll('[data-panel]');
  const isMobile = window.innerWidth <= 768;
  panels.forEach(panel => {
    if (isMobile) {
      const panelIndex = parseInt(panel.dataset.panel, 10);
      panel.classList.toggle('is-active', panelIndex === state.activeMobileStep);
    } else {
      panel.classList.remove('is-active');
    }
  });
  els.stepper.querySelectorAll('[data-step]').forEach(btn => {
    btn.classList.toggle('is-active', parseInt(btn.dataset.step, 10) === state.activeMobileStep);
  });
}

// ── RENDER: ELEMENT SELECTION ────────────────────────────

function renderElementSelection() {
  if (!state.elements.length) {
    els.categoryList.innerHTML = '<div class="empty-state">Noch keine Merkmale. Lege Merkmale im Datenbereich an.</div>';
    return;
  }
  const selectedSet = new Set(state.selectedElementIds);
  els.categoryList.innerHTML = state.categories.map(cat => {
    const elements = state.elements.filter(e => e.categoryId === cat.id).sort((a, b) => a.name.localeCompare(b.name, 'de'));
    const selectedCount = elements.filter(e => selectedSet.has(e.id)).length;
    return `
      <details class="category" ${selectedCount > 0 ? 'open' : ''}>
        <summary>
          <span class="category-title"><span class="chevron">›</span><span class="category-name">${escapeHtml(cat.name)}</span></span>
          <span class="count-pill">${elements.length}</span>
        </summary>
        <div class="element-list">
          ${elements.length
            ? elements.map(el => {
                const isSel = selectedSet.has(el.id);
                return `<div class="element-row ${isSel ? 'is-selected' : ''}" data-toggle-element="${el.id}" role="button" tabindex="0">
                  <span class="fake-checkbox">${isSel ? '✓' : ''}</span>
                  <span class="element-name">${escapeHtml(el.name)}</span>
                </div>`;
              }).join('')
            : '<div class="element-row"><span></span><span class="element-name" style="color:var(--muted)">Keine Merkmale</span></div>'
          }
        </div>
      </details>`;
  }).join('');
}

// ── RENDER: SELECTION VIEW ───────────────────────────────

function renderSelection() {
  const selected = state.selectedElementIds.map(id => state.elements.find(e => e.id === id)).filter(Boolean);

  const imageBlock = state.uploadedImageDataUrl ? `
    <div class="analysis-card" style="margin-bottom:14px;padding:10px;">
      <img src="${state.uploadedImageDataUrl}" alt="Referenzbild" style="width:100%;max-height:360px;object-fit:contain;border-radius:14px;display:block;background:var(--surface-soft);border:1px solid var(--line);">
    </div>` : '';

  if (!selected.length) {
    els.selectionView.innerHTML = `${imageBlock}<div class="empty-state">Keine Elemente ausgewählt.</div>`;
    return;
  }

  els.selectionView.innerHTML = `
    ${imageBlock}
    <div class="chips">${selected.map(el => `<div class="chip" data-remove-selection="${el.id}" role="button" tabindex="0"><span>${escapeHtml(el.name)}</span><span class="remove">×</span></div>`).join('')}</div>
  `;
}

// ── RENDER: ANALYSIS ─────────────────────────────────────

function renderAnalysis() {
  const analysis = analyzeSelection();
  if (!analysis.length) {
    els.analysisView.innerHTML = `
      <div class="dominant-card">
        <div class="dominant-label">Gesamtlesart</div>
        <div class="dominant-value">–</div>
        <div class="dominant-meta">Wähle beobachtbare Merkmale aus. Die App trennt Beobachtung, Gestaltungswirkung und mögliche Kontextlesart.</div>
      </div>`;
    return;
  }

  const groupData = analyzeByGroup(analysis);
  const selectedMerkmale = state.selectedElementIds.map(id => state.elements.find(e => e.id === id)).filter(Boolean);
  const formalEffects = analysis.filter(i => i.layer === 'Gestaltungswirkung');
  const readingEffects = analysis.filter(i => i.layer === 'Kontextlesart');
  const supportEffects = analysis.filter(i => i.layer === 'Materialhinweis' || i.layer === 'Beobachtungsmerkmal');
  const theoryData = analyzeByTheory(analysis);

  els.analysisView.innerHTML = `
    <div class="dominant-card quick-profile-card">
      <div class="dominant-label">Kurzprofil</div>
      <div class="dominant-value">${escapeHtml(buildInterpretiveHeadline(groupData, formalEffects, readingEffects))}</div>
      ${renderProfileGroups(selectedMerkmale, formalEffects, readingEffects, supportEffects)}
    </div>

    ${renderCentralReadingsSection(readingEffects, formalEffects)}

    <div class="analysis-card meaning-card statement-card">
      <div class="card-title-row">
        <h3>Kernaussage</h3>
        <span class="badge">Interpretation</span>
      </div>
      <p>${escapeHtml(buildInterpretiveSentence(groupData, formalEffects, readingEffects, selectedMerkmale))}</p>
    </div>

    <div class="analysis-note">
      <strong>Hinweis zur Lesart</strong>
      <span>Diese Auswertung ist eine vorläufige Bedeutungstendenz. Eine eindeutige Deutung entsteht erst durch Figur, Szene, Körperhaltung, Bildkomposition und narrative Funktion.</span>
    </div>

    <div class="analysis-card visual-summary-card">
      <h3>Von Beobachtung zu Wirkung</h3>
      <p class="section-intro">Links steht, welche Analysebereiche durch deine Auswahl besonders vertreten sind. Rechts steht, welche Wirkungsbereiche daraus abgeleitet werden. Die Werte sind Orientierungen, keine Messwerte.</p>
      <div class="summary-grid">
        <div><h4>Ausgewählte Analysebereiche</h4>${renderCategoryBars(selectedMerkmale)}</div>
        <div><h4>Abgeleitete Wirkungsbereiche</h4>${renderGroupBars(groupData.slice(0, 8))}</div>
      </div>
      <div class="small-note weight-note"><strong>Gewichtung:</strong> Form, Silhouette und Konstruktion prägen die sichtbare Körperwirkung stärker. Konkrete Farben und Materialien werden unterstützend gewertet, weil ihre Bedeutung stärker vom Kontext abhängt.</div>
    </div>

    <details class="analysis-disclosure effect-disclosure" open>
      <summary>Gestalterische Effekte</summary>
      <div class="analysis-card inner-card">${formalEffects.length ? renderEffectsCards(formalEffects) : '<div class="small-note">Noch keine gestalterischen Effekte ausgewählt.</div>'}</div>
    </details>
    <details class="analysis-disclosure">
      <summary>Beobachtungsebene</summary>
      <div class="analysis-card inner-card">${renderObservationTable(selectedMerkmale)}</div>
    </details>
    <details class="analysis-disclosure">
      <summary>Farb- und Materialhinweise</summary>
      <div class="analysis-card inner-card"><p class="section-intro">Konkrete Farben und Materialien werden als Hinweise berücksichtigt. Ihre Bedeutung entsteht erst in Kombination mit Form, Schnitt, Oberfläche und Kontext.</p>${supportEffects.length ? renderSupportTable(supportEffects.slice(0, 14)) : '<div class="small-note">Keine zusätzlichen Farb- oder Materialhinweise.</div>'}</div>
    </details>
    <details class="analysis-disclosure">
      <summary>Methodik und Theoriebezug</summary>
      <div class="analysis-card inner-card method-summary-card">
        <div class="card-title-row">
          <h3>Methodik der Analysefelder</h3>
          <button type="button" class="mini-button" data-open-methodology>vollständig anzeigen</button>
        </div>
        ${renderMethodologySummary(selectedMerkmale)}
        <h3 style="margin-top:16px;">Theoriebezug</h3>
        ${renderTheoryList(theoryData)}
      </div>
    </details>`;
}


function renderMethodologySummary(selectedMerkmale) {
  const selectedCategoryNames = new Set(selectedMerkmale.map(el => getCategoryName(el.categoryId)));
  const relevant = METHODOLOGY_FIELDS.filter(field => selectedCategoryNames.has(field.title));
  const fields = relevant.length ? relevant : METHODOLOGY_FIELDS.slice(0, 3);
  return `<div class="method-summary-grid">${fields.map(field => `
    <div class="method-mini-card">
      <strong>${escapeHtml(field.title)}</strong>
      <p>${escapeHtml(field.question)}</p>
      <div class="small-note">${escapeHtml(field.terms.slice(0, 4).join(' · '))}</div>
    </div>`).join('')}</div>
    <div class="small-note method-note">Die App behandelt Bedeutungen als Arbeitshypothesen: sichtbares Merkmal → Gestaltungswirkung → mögliche Kontextlesart.</div>`;
}

function renderMethodologyModal() {
  if (!els.methodologyContent) return;
  els.methodologyContent.innerHTML = `
    <div class="method-intro">
      <h3>Methodisches Prinzip</h3>
      <p>Dieses Tool bewertet Outfits nicht über feste Symboltabellen. Es zerlegt ein Kostüm in beobachtbare Merkmale und leitet daraus formale Gestaltungswirkungen sowie vorsichtige Kontextlesarten ab.</p>
      <ol>
        <li><strong>Beobachtung:</strong> Was ist sichtbar?</li>
        <li><strong>Gestaltungswirkung:</strong> Welche formale, farbliche, materielle oder konstruktive Wirkung entsteht?</li>
        <li><strong>Kontextlesart:</strong> Welche mögliche Bedeutung ergibt sich erst im Zusammenhang mit Figur, Szene, Medium und Narration?</li>
      </ol>
    </div>
    <div class="method-grid">${METHODOLOGY_FIELDS.map(field => `
      <article class="method-card">
        <h3>${escapeHtml(field.title)}</h3>
        <div class="method-question">${escapeHtml(field.question)}</div>
        <p>${escapeHtml(field.method)}</p>
        <div class="method-chip-list">${field.terms.map(term => `<span>${escapeHtml(term)}</span>`).join('')}</div>
        <div class="method-source"><strong>Theoriebezug:</strong> ${escapeHtml(field.source)}</div>
        <div class="method-caution"><strong>Prüfung:</strong> ${escapeHtml(field.caution)}</div>
      </article>`).join('')}</div>
    <div class="method-references">
      <h3>Quellengewichtung</h3>
      <div class="method-grid compact">${SOURCE_TIERS.map(tier => `
        <article class="method-card">
          <h3>${escapeHtml(tier.tier)}</h3>
          <p>${escapeHtml(tier.role)}</p>
          <div class="method-chip-list">${tier.sources.map(source => `<span>${escapeHtml(source)}</span>`).join('')}</div>
        </article>`).join('')}</div>
      <h3>Quellenrahmen</h3>
      <ul>${METHODOLOGY_REFERENCES.map(ref => `<li>${escapeHtml(ref)}</li>`).join('')}</ul>
    </div>`;
}

function openMethodology() {
  renderMethodologyModal();
  els.methodologyModal.classList.add('is-open');
}

function closeMethodology() {
  els.methodologyModal.classList.remove('is-open');
}

function analyzeByTheory(analysis) {
  const theoryMap = new Map();
  analysis.forEach(item => {
    const key = item.theory || 'Eigene Zuordnung';
    if (!theoryMap.has(key)) theoryMap.set(key, { name: key, count: 0, items: [] });
    const entry = theoryMap.get(key);
    entry.count += item.count;
    entry.items.push(displayEffectName(item.name));
  });
  return [...theoryMap.values()].sort((a, b) => b.count - a.count);
}

function getEffectMeta(name) {
  return EFFECT_META[name] || { label: name, type: 'Gestaltungswirkung', desc: '', caution: '' };
}

function displayEffectName(name) {
  return getEffectMeta(name).label || name;
}

function displayEffectType(item) {
  const meta = getEffectMeta(item.name);
  if (item.layer === 'Kontextlesart') return 'Mögliche Lesart';
  if (item.layer === 'Materialhinweis' || item.layer === 'Beobachtungsmerkmal') return 'Beobachtung / Hinweis';
  return meta.type || 'Gestaltungswirkung';
}

function plainSentence(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function readableList(items, max = 3) {
  const list = items.slice(0, max).map(i => typeof i === 'string' ? i : displayEffectName(i.name));
  if (!list.length) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} und ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} und ${list[list.length - 1]}`;
}

function strengthLabel(value, max) {
  const safeMax = max || 1;
  const ratio = value / safeMax;
  if (ratio >= 0.72) return { label: 'hoch', cls: 'high' };
  if (ratio >= 0.42) return { label: 'mittel', cls: 'medium' };
  return { label: 'niedrig', cls: 'low' };
}

function renderStrength(value, max) {
  const s = strengthLabel(value, max);
  return `<span class="strength-inline"><span class="strength-pill ${s.cls}">${escapeHtml(s.label)}</span><strong>${formatCount(value)}</strong></span>`;
}


function buildInterpretiveHeadline(groupData, formalEffects, readingEffects) {
  const topFormal = formalEffects.slice(0, 2);
  const topReading = readingEffects.slice(0, 1);
  const f = topFormal.map(i => displayEffectName(i.name).toLowerCase());
  if (!f.length) return 'noch keine auswertbare Gestaltungswirkung';

  // More human headline patterns for common cases
  const hasLight = formalEffects.some(i => ['heller Tonwert', 'Flächenruhe', 'Lichtreflexion'].includes(i.name));
  const hasBody = formalEffects.some(i => ['Körpernähe', 'Konturbetonung', 'Körperexponierung'].includes(i.name));
  const hasFix = formalEffects.some(i => ['Fixierung', 'Eindruck von Bewegungseinschränkung'].includes(i.name));
  const hasDirection = formalEffects.some(i => ['Blicklenkung', 'vertikale Streckung', 'Achsenbetonung', 'diagonale Spannung'].includes(i.name));

  if (hasLight && hasDirection) return 'helle, ruhige Gestaltung mit gezieltem Blickverlauf';
  if (hasFix && hasBody) return 'körpernahe Gestaltung mit fixierenden Details';
  if (hasFix) return 'funktionale Gestaltung mit fixierenden Details';
  if (hasBody) return 'körperbezogene Gestaltung mit klar lesbarer Silhouette';

  const reading = topReading.length ? `; mögliche Lesart: ${displayEffectName(topReading[0].name).toLowerCase()}` : '';
  return `${f.join(' + ')}${reading}`;
}

function explainEffect(name) {
  return getEffectMeta(name).desc || '';
}

function buildInterpretiveSentence(groupData, formalEffects, readingEffects, selectedMerkmale) {
  const sourceText = readableList(selectedMerkmale.map(e => e.name), 5) || 'den ausgewählten Merkmalen';
  const primary = formalEffects.slice(0, 3);
  const readings = readingEffects.slice(0, 3);

  const overview = describeOverallEffect(formalEffects);
  const effectText = primary.map(i => effectClause(i.name)).filter(Boolean).slice(0, 3).join(' ');
  const readingText = readings.length
    ? `Als mögliche Lesarten kommen ${readableList(readings.map(r => displayEffectName(r.name)), 3)} in Frage. Ohne konkreten Szenenkontext bleiben diese Deutungen offen.`
    : 'Eine eindeutige Kontextlesart entsteht aus dieser Auswahl noch nicht.';

  return `Ausgehend von ${sourceText} zeigt sich ${overview}. ${effectText} ${readingText}`.replace(/\s+/g, ' ').trim();
}

function describeOverallEffect(formalEffects) {
  const names = new Set(formalEffects.map(i => i.name));
  const hasLight = ['heller Tonwert', 'Flächenruhe', 'Lichtreflexion'].some(n => names.has(n));
  const hasBody = ['Körpernähe', 'Konturbetonung', 'Körperexponierung'].some(n => names.has(n));
  const hasDirection = ['Blicklenkung', 'vertikale Streckung', 'Achsenbetonung', 'diagonale Spannung'].some(n => names.has(n));
  const hasFix = ['Fixierung', 'Eindruck von Bewegungseinschränkung'].some(n => names.has(n));
  const hasMaterial = ['Glanzgrad', 'Gebrauchsspur', 'haptischer Eindruck', 'Steifigkeit', 'fließender Fall'].some(n => names.has(n));

  const parts = [];
  if (hasLight) parts.push('eine helle, ruhige Flächenwirkung');
  if (hasBody) parts.push('eine klar lesbare Körperkontur');
  if (hasDirection) parts.push('ein gerichteter Blickverlauf');
  if (hasFix) parts.push('eine fixierende oder kontrollierende Detailwirkung');
  if (hasMaterial) parts.push('eine betonte Materialoberfläche');

  if (parts.length) return readableList(parts, 3);
  const labels = formalEffects.slice(0, 2).map(i => displayEffectName(i.name).toLowerCase());
  return labels.length ? `eine Wirkung aus ${readableList(labels, 2)}` : 'noch keine klar dominierende Gestaltungswirkung';
}

function effectClause(name) {
  const label = displayEffectName(name);
  const clauses = {
    'Flächenruhe': 'Die Flächen wirken reduziert und weniger unruhig, wodurch das Outfit optisch ruhiger erscheint.',
    'heller Tonwert': 'Helle Tonwerte öffnen die Form und nehmen ihr optische Schwere.',
    'Lichtreflexion': 'Lichtreflexe lenken Aufmerksamkeit auf die Oberfläche und können sie glatter, technischer oder heller erscheinen lassen.',
    'Blicklenkung': 'Linien, Nähte oder Kontraste führen den Blick gezielt über den Körper.',
    'Körpernähe': 'Die körpernahe Form macht Proportionen und Haltung deutlicher lesbar.',
    'Konturbetonung': 'Die Außenform des Körpers tritt klarer hervor.',
    'Körperexponierung': 'Die Körperform wird stärker sichtbar, ohne dass daraus allein eine feste Bedeutung entsteht.',
    'Fixierung': 'Schnallen, Gurte oder Riemen lassen Kleidung und Körper optisch gehalten oder begrenzt erscheinen.',
    'Eindruck von Bewegungseinschränkung': 'Fixierende Details können den Eindruck erzeugen, dass Bewegung kontrolliert oder eingeschränkt wird.',
    'Achsenbetonung': 'Eine vertikale Achse ordnet die Figur und lässt sie aufgerichteter wirken.',
    'Aufrichtung': 'Die Figur erscheint aufrechter und präsenter.',
    'Gebrauchsspur': 'Abnutzung oder Patina lassen das Material getragen, benutzt oder erzählerisch aufgeladen wirken.',
    'haptischer Eindruck': 'Die Oberfläche wirkt greifbar und materiell präsent.',
    'Gliederung': 'Nähte, Kanten oder Teilungen strukturieren die Fläche und machen Konstruktion sichtbar.',
    'handwerkliche Spur': 'Sichtbare Verarbeitung kann den Eindruck von Herstellung, Reparatur oder Gebrauch verstärken.'
  };
  return clauses[name] || (explainEffect(name) ? `${label}: ${plainSentence(explainEffect(name))}` : '');
}

function renderInfoDetails(item, mode = 'effect') {
  const meta = getEffectMeta(item.name);
  const desc = meta.desc || 'Für diesen Begriff ist noch keine Erklärung hinterlegt.';
  const caution = meta.caution || 'Die Deutung bleibt kontextabhängig.';
  const label = displayEffectName(item.name);
  return `<details class="term-details"><summary>${escapeHtml(label)}</summary><div>${escapeHtml(desc)}</div><div class="small-note"><strong>Vorsicht:</strong> ${escapeHtml(caution)}</div></details>`;
}

function renderProfileGroups(selectedMerkmale, formalEffects, readingEffects, supportEffects) {
  const triggers = selectedMerkmale.slice(0, 5).map(el => el.name);
  const effectLabels = formalEffects.slice(0, 3).map(i => displayEffectName(i.name));
  const readingLabels = readingEffects.slice(0, 3).map(i => displayEffectName(i.name));
  const hintLabels = supportEffects.slice(0, 2).map(i => displayEffectName(i.name));
  return `<div class="profile-logic-strip"><strong>Leselogik</strong><span>Ausgewählte Merkmale</span><b>→</b><span>Gestalterische Wirkung</span><b>→</b><span>Mögliche Lesart</span></div><div class="profile-flow">
    ${renderProfileLine('Ausgewählte Merkmale', triggers, 'trigger')}
    ${renderProfileLine('Gestalterische Wirkung', effectLabels, 'effect')}
    ${renderProfileLine('Mögliche Lesart', readingLabels, 'reading')}
    ${hintLabels.length ? renderProfileLine('Unterstützende Hinweise', hintLabels, 'support') : ''}
  </div>`;
}

function renderProfileLine(title, labels, tone = '') {
  if (!labels.length) return '';
  return `<div class="profile-line ${tone}"><span>${escapeHtml(title)}</span><div>${labels.map(label => `<em>${escapeHtml(label)}</em>`).join('')}</div></div>`;
}


const DONUT_PALETTE = ['#5D7F93', '#8F6B82', '#B98763', '#6F846A'];

function renderCentralReadingsSection(readingEffects, formalEffects) {
  const hasReadings = readingEffects.length > 0;
  const allEqual = readingEffects.length > 1 && readingEffects.every(i => i.count === readingEffects[0].count);
  const introTitle = hasReadings
    ? (allEqual ? 'Mehrere gleich starke Lesarten' : 'Zentrale Kontextlesarten')
    : 'Noch keine Kontextlesart';
  const introText = hasReadings
    ? (allEqual
      ? 'Die Auswahl stützt mehrere mögliche Bedeutungsrichtungen. Ohne konkreten Szenenkontext lässt sich noch keine eindeutig stärkere Lesart bestimmen.'
      : 'Diese Karten zeigen die wichtigsten möglichen Bedeutungsrichtungen der aktuellen Auswahl. Sie sind das interpretative Ergebnis, keine endgültige Symbolik.')
    : 'Die App zeigt hier Kontextlesarten, sobald ausgewählte Merkmale eine mögliche Bedeutungstendenz stützen.';
  return `<div class="analysis-card central-readings-card">
    <div class="card-title-row">
      <div>
        <h3>Zentrale Kontextlesarten</h3>
        <p class="section-intro no-margin">${escapeHtml(introText)}</p>
      </div>
      <span class="badge">${escapeHtml(introTitle)}</span>
    </div>
    <div class="central-readings-grid">
      <div>${hasReadings ? renderReadingsCards(readingEffects, true) : '<div class="small-note">Noch keine kontextuellen Lesarten ausgewählt.</div>'}</div>
      <div class="meaning-visual central-donut">
        <h4>Lesartprofil</h4>
        ${renderMeaningDonut(formalEffects, readingEffects)}
      </div>
    </div>
  </div>`;
}

function renderMeaningDonut(formalEffects, readingEffects) {
  const hasReadings = readingEffects.length > 0;
  const sourceItems = hasReadings ? readingEffects : formalEffects;
  const data = sourceItems.slice(0, 4).map((item, index) => ({
    ...item,
    displayKind: hasReadings ? 'Lesart' : 'Effekt',
    chartColor: DONUT_PALETTE[index % DONUT_PALETTE.length]
  }));

  if (!data.length) {
    return `<div class="empty-state compact-empty">Noch keine Lesarten oder Effekte auswertbar.</div>`;
  }

  const total = data.reduce((s, i) => s + i.count, 0) || 1;
  let startAngle = -90;
  const paths = data.map(item => {
    const angle = (item.count / total) * 360;
    const endAngle = startAngle + angle;
    const path = describeArc(92, 92, 72, startAngle, endAngle);
    startAngle = endAngle;
    return `<path d="${path}" fill="${escapeHtml(item.chartColor)}"></path>`;
  }).join('');

  const allEqual = data.length > 1 && data.every(item => item.count === data[0].count);
  const top = data[0];
  const centerSmall = hasReadings ? 'Lesartprofil' : 'Effektprofil';
  const centerLabel = allEqual ? 'kein Schwerpunkt' : displayEffectName(top.name);
  const inputLabel = hasReadings
    ? 'Es fließen nur mögliche Kontextlesarten ein.'
    : 'Es liegen noch zu wenige Kontextlesarten vor; deshalb zeigt das Diagramm gestalterische Effekte.';
  const legendTitle = hasReadings ? 'Mögliche Kontextlesarten' : 'Gestalterische Effekte';
  const legend = data.map((item, index) => {
    const ratio = Math.round((item.count / total) * 100);
    const strength = allEqual ? 'gleich stark' : `${ratio}% Anteil`;
    return `<div class="donut-legend-row">
      <span class="dot" style="background:${escapeHtml(item.chartColor)}"></span>
      <span class="donut-legend-text"><strong>${escapeHtml(displayEffectName(item.name))}</strong><small>${escapeHtml(item.displayKind)} · ${escapeHtml(strength)}</small></span>
      <em>${formatCount(item.count)}</em>
    </div>`;
  }).join('');

  return `<div class="donut-explainer">
    <div><strong>Diagramm zeigt:</strong> ${escapeHtml(legendTitle)}</div>
    <div>${escapeHtml(inputLabel)}</div>
    <div><strong>Farben:</strong> Jede Farbe steht nur für eine Zeile der Legende, nicht für feste Symbolik.</div>
  </div>
  <div class="meaning-donut-wrap improved-donut">
    <svg class="meaning-donut" viewBox="0 0 184 184" role="img" aria-label="${escapeHtml(legendTitle)} als Kreisdiagramm">
      ${paths}
      <circle cx="92" cy="92" r="43" fill="var(--surface)"></circle>
      <text x="92" y="84" text-anchor="middle" class="donut-center-small">${escapeHtml(centerSmall)}</text>
      <text x="92" y="101" text-anchor="middle" class="donut-center-label">${escapeHtml(shortenLabel(centerLabel, 18))}</text>
    </svg>
    <div class="donut-legend"><div class="donut-legend-title">${escapeHtml(allEqual ? 'Mehrere gleich starke Lesarten' : 'Stärkste Tendenzen')}</div>${legend}</div>
  </div>
  <div class="small-note donut-note">Visuelle Orientierung, keine feste Bedeutung. Die Lesart bleibt kontextabhängig.</div>`;
}

function shortenLabel(value, max = 18) {
  const text = String(value || '');
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function renderCategoryBars(selectedMerkmale) {
  const map = new Map();
  selectedMerkmale.forEach(el => {
    const cat = getCategoryName(el.categoryId);
    const val = categoryWeight(cat);
    if (!map.has(cat)) map.set(cat, { name: cat, count: 0 });
    map.get(cat).count += val;
  });
  const data = [...map.values()].sort((a, b) => b.count - a.count);
  const max = Math.max(...data.map(d => d.count), 1);
  return `<div class="scale-note">Links: was ausgewählt wurde. Die Werte zeigen, welche Analysefelder die Auswahl tragen.</div><div class="bar-list compact-bars">${data.map(d => `
    <div class="bar-row">
      <div class="bar-label"><span></span><span>${escapeHtml(d.name)}</span>${renderStrength(d.count, max)}</div>
      <div class="bar-track"><span style="width:${Math.max(6, Math.round((d.count / max) * 100))}%;"></span></div>
    </div>`).join('')}</div>`;
}

function renderObservationTable(selectedMerkmale) {
  return `<table>
    <thead><tr><th>Sichtbares Merkmal</th><th>Analysefeld</th><th>Beobachtung</th><th>Theoriebezug</th></tr></thead>
    <tbody>${selectedMerkmale.map(el => `<tr>
      <td><strong>${escapeHtml(el.name)}</strong></td>
      <td>${escapeHtml(getCategoryName(el.categoryId))}</td>
      <td class="sources">${escapeHtml(el.observation || 'Eigene Beobachtung ergänzen.')}</td>
      <td class="sources">${escapeHtml(el.source || 'Eigene Zuordnung / Admin-Daten')}</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function renderTheoryList(theoryData) {
  const frameByLabel = new Map(THEORY_FRAMES.map(f => [f.label, f]));
  return `<div class="theory-list">${theoryData.map(t => {
    const frame = frameByLabel.get(t.name);
    const note = frame ? `${frame.source}: ${frame.note}` : t.name;
    return `<div class="theory-item">
      <div><strong>${escapeHtml(t.name)}</strong> <span class="badge">${formatCount(t.count)}</span></div>
      <div class="small-note">${escapeHtml(note)}</div>
      <div class="sources">${escapeHtml([...new Set(t.items)].slice(0, 8).join(', '))}</div>
    </div>`;
  }).join('')}</div>`;
}

function renderGroupBars(groupData) {
  const max = Math.max(...groupData.map(g => g.count), 1);
  return `<div class="scale-note">Rechts: welche Wirkungsbereiche daraus entstehen. „hoch/mittel/niedrig“ sind Lesehilfen, keine festen Messwerte.</div><div class="bar-list">${groupData.map(g => `
    <div class="bar-row">
      <div class="bar-label"><span class="dot" style="background:${escapeHtml(g.color)}"></span><span>${escapeHtml(g.name)}</span>${renderStrength(g.count, max)}</div>
      <div class="bar-track"><span style="width:${Math.max(6, Math.round((g.count / max) * 100))}%;background:${escapeHtml(g.color)}"></span></div>
    </div>`).join('')}</div>`;
}

function renderEffectsCards(analysis) {
  const max = Math.max(...analysis.map(i => i.count), 1);
  const top = analysis.slice(0, 5);
  const rest = analysis.slice(5);
  return `<div class="section-intro"><strong>Wichtigste Effekte</strong><br>Diese Wirkungen werden durch die aktuelle Auswahl am stärksten gestützt.</div>
    <div class="effect-card-grid">${top.map(item => renderEffectCard(item, max)).join('')}</div>
    ${rest.length ? `<details class="nested-details"><summary>Weitere ${rest.length} Effekte anzeigen</summary>${renderEffectsTable(rest)}</details>` : ''}`;
}

function renderEffectCard(item, max) {
  return `<div class="effect-card">
    <div class="effect-card-head"><span class="dot" style="background:${escapeHtml(item.color)}"></span><strong>${escapeHtml(displayEffectName(item.name))}</strong>${renderStrength(item.count, max)}</div>
    <p>${escapeHtml(explainEffect(item.name) || 'Beschreibung ergänzen.')}</p>
    <div class="effect-card-meta"><span>Ausgelöst durch</span>${escapeHtml(item.sources.join(', '))}</div>
    <details class="mini-term-details"><summary>Einordnung anzeigen</summary><div>${escapeHtml(getEffectMeta(item.name).caution || 'Die Deutung bleibt kontextabhängig.')}</div></details>
  </div>`;
}

function renderReadingsCards(analysis, compact = false) {
  const max = Math.max(...analysis.map(i => i.count), 1);
  const allEqual = analysis.length > 1 && analysis.every(i => i.count === analysis[0].count);
  const sorted = analysis.slice(0, compact ? 4 : 8);
  const intro = compact ? '' : `<div class="reading-intro">
    <strong>${escapeHtml(allEqual ? 'Mehrere gleich starke Lesarten' : 'Zentrale Kontextlesarten')}</strong>
    <span>Diese Karten sind das interpretative Ergebnis der Auswahl. Sie zeigen mögliche Bedeutungsrichtungen, keine endgültige Symbolik.</span>
  </div>`;
  const rest = compact && analysis.length > 4
    ? `<details class="nested-details compact-more"><summary>Weitere ${analysis.length - 4} Lesarten anzeigen</summary><div class="reading-card-grid">${analysis.slice(4).map(item => renderReadingCard(item, max, false)).join('')}</div></details>`
    : '';
  return `${intro}<div class="reading-card-grid ${compact ? 'compact-reading-cards' : ''} ${allEqual ? 'equal-readings' : ''}">${sorted.map((item, index) => renderReadingCard(item, max, index === 0 && !allEqual)).join('')}</div>${rest}`;
}

function renderReadingCard(item, max, featured = false) {
  return `<div class="reading-card ${featured ? 'is-featured' : ''}">
    <div class="reading-card-head"><span class="dot" style="background:${escapeHtml(item.color)}"></span><strong>${escapeHtml(displayEffectName(item.name))}</strong>${renderStrength(item.count, max)}</div>
    <p>${escapeHtml(explainEffect(item.name) || 'Lesart nur im Kontext prüfen.')}</p>
    <div class="effect-card-meta"><span>Ausgelöst durch</span>${escapeHtml(item.sources.join(', '))}</div>
    <details class="mini-term-details"><summary>Vorsicht bei der Deutung</summary><div>${escapeHtml(getEffectMeta(item.name).caution || 'Diese Lesart ist eine Arbeitshypothese.')}</div></details>
  </div>`;
}

function renderEffectsTable(analysis) {
  const max = Math.max(...analysis.map(i => i.count), 1);
  return `<table>
    <thead><tr><th>Gestalterischer Effekt</th><th>Was bedeutet das?</th><th>Stärke</th><th>Ausgelöst durch</th></tr></thead>
    <tbody>${analysis.map(item => `<tr>
      <td><span class="effect-cell"><span class="dot" style="background:${escapeHtml(item.color)}"></span>${renderInfoDetails(item)}</span></td>
      <td class="sources">${escapeHtml(explainEffect(item.name) || 'Beschreibung ergänzen.')}</td>
      <td>${renderStrength(item.count, max)}</td>
      <td class="sources">${escapeHtml(item.sources.join(', '))}</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function renderReadingsTable(analysis) {
  const max = Math.max(...analysis.map(i => i.count), 1);
  return `<table>
    <thead><tr><th>Mögliche Lesart</th><th>Warum möglich?</th><th>Gewichtung</th><th>Ausgelöst durch</th></tr></thead>
    <tbody>${analysis.map(item => `<tr>
      <td><span class="effect-cell"><span class="dot" style="background:${escapeHtml(item.color)}"></span>${renderInfoDetails(item)}</span></td>
      <td class="sources">${escapeHtml(explainEffect(item.name) || 'Lesart nur im Kontext prüfen.')}</td>
      <td>${renderStrength(item.count, max)}</td>
      <td class="sources">${escapeHtml(item.sources.join(', '))}</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function renderSupportTable(analysis) {
  const max = Math.max(...analysis.map(i => i.count), 1);
  return `<table>
    <thead><tr><th>Beobachteter Hinweis</th><th>Art</th><th>Gewichtung</th><th>Rolle / ausgelöst durch</th></tr></thead>
    <tbody>${analysis.map(item => `<tr>
      <td><span class="effect-cell"><span class="dot" style="background:${escapeHtml(item.color)}"></span>${renderInfoDetails(item)}</span></td>
      <td><span class="badge">${escapeHtml(item.group)}</span><div class="small-note">${escapeHtml(item.theory || '')}</div></td>
      <td>${renderStrength(item.count, max)}</td>
      <td class="sources">${escapeHtml(explainEffect(item.name) || 'Unterstützender Hinweis.')}<br><span class="small-note">Ausgelöst durch: ${escapeHtml(item.sources.join(', '))}</span></td>
    </tr>`).join('')}</tbody>
  </table>`;
}


// ── ARC MATH ──────────────────────────────────────────────

function polarToCartesian(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(x, y, r, start, end) {
  if (end - start >= 359.99) {
    const p1 = polarToCartesian(x, y, r, start);
    const p2 = polarToCartesian(x, y, r, start + 180);
    return `M ${x} ${y} L ${p1.x} ${p1.y} A ${r} ${r} 0 1 1 ${p2.x} ${p2.y} A ${r} ${r} 0 1 1 ${p1.x} ${p1.y} Z`;
  }
  const s = polarToCartesian(x, y, r, end);
  const e = polarToCartesian(x, y, r, start);
  const large = end - start <= 180 ? '0' : '1';
  return `M ${x} ${y} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} Z`;
}

// ── RENDER: ADMIN ─────────────────────────────────────────

function renderAdmin() {
  renderAdminTabs();
  if (state.activeAdminTab === 'elements') renderElementsAdmin();
  if (state.activeAdminTab === 'effects') renderEffectsAdmin();
  if (state.activeAdminTab === 'categories') renderCategoriesAdmin();
}

function renderAdminTabs() {
  els.adminTabs.querySelectorAll('[data-tab]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.tab === state.activeAdminTab));
}

function renderGroupedEffectCheckboxes(loadedElement) {
  sortEffectsByGroup();
  const grouped = groupEffects(state.effects);
  return [...grouped.entries()].map(([gName, effects]) =>
    `<div class="group-title">${escapeHtml(gName)}</div>` +
    effects.map(e => `<label class="check-item"><input type="checkbox" name="effectIds" value="${e.id}" ${loadedElement?.effectIds?.includes(e.id) ? 'checked' : ''}><span class="dot" style="background:${escapeHtml(e.color)}"></span><span>${escapeHtml(e.name)}</span></label>`).join('')
  ).join('');
}

function renderElementsAdmin() {
  const loaded = state.elements.find(e => e.id === adminFormState.loadedElementId) || null;
  els.adminForm.innerHTML = `<form class="form-grid" id="elementForm">
    <div class="field"><label for="elementName">Merkmal</label><input id="elementName" name="name" value="${escapeHtml(loaded?.name || '')}" placeholder="z. B. Rot" required></div>
    <div class="field"><label for="elementKategorie">Kategorie</label><select id="elementKategorie" name="categoryId">${state.categories.map(c => `<option value="${c.id}" ${loaded?.categoryId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</select></div>
    <div class="field"><label for="elementObservation">Beobachtung</label><textarea id="elementObservation" name="observation" placeholder="Beschreibe sichtbar und neutral, was am Outfit zu erkennen ist.">${escapeHtml(loaded?.observation || '')}</textarea></div>
    <div class="field"><label>Wirkungen verknüpfen</label><div class="checkbox-list">${state.effects.length ? renderGroupedEffectCheckboxes(loaded) : '<div class="small-note">Keine Wirkungen yet.</div>'}</div></div>
    <div class="form-actions"><button class="primary" type="submit">Merkmal speichern</button><button class="danger" type="button" id="deleteElement" ${loaded ? '' : 'disabled'}>Löschen</button><button type="button" id="newElement">Neu</button></div>
  </form>`;
  els.adminList.innerHTML = `<div class="admin-list">${state.elements.length
    ? state.elements.map(el => `<div class="list-item ${loaded?.id === el.id ? 'is-active' : ''}" data-load-element="${el.id}"><div class="list-title">${escapeHtml(el.name)}</div><div class="list-meta">${escapeHtml(getCategoryName(el.categoryId))} · ${(el.effectIds || []).map(getEffectName).map(escapeHtml).join(', ') || 'Keine Wirkungen'}</div></div>`).join('')
    : '<div class="empty-state">Keine Merkmale yet.</div>'}</div>`;
}

function renderEffectsAdmin() {
  const loaded = state.effects.find(e => e.id === adminFormState.loadedEffectId) || null;
  sortEffectsByGroup();
  els.adminForm.innerHTML = `<form class="form-grid" id="effectForm">
    <div class="field"><label for="effectName">Wirkung</label><input id="effectName" name="name" value="${escapeHtml(loaded?.name || '')}" placeholder="z. B. Dynamik" required></div>
    <div class="field"><label for="effectFarbe">Farbe</label><input id="effectFarbe" name="color" type="color" value="${escapeHtml(loaded?.color || '#8f8a82')}"></div>
    <div class="form-actions"><button class="primary" type="submit">Wirkung speichern</button><button class="danger" type="button" id="deleteEffect" ${loaded ? '' : 'disabled'}>Löschen</button><button type="button" id="newEffect">Neu</button></div>
  </form>`;
  if (!state.effects.length) { els.adminList.innerHTML = '<div class="empty-state">Keine Wirkungen yet.</div>'; return; }
  const grouped = groupEffects(state.effects);
  els.adminList.innerHTML = `<div class="admin-list">${[...grouped.entries()].map(([gName, effects]) =>
    `<div class="group-title">${escapeHtml(gName)}</div>` +
    effects.map(e => `<div class="list-item ${loaded?.id === e.id ? 'is-active' : ''}" data-load-effect="${e.id}"><div class="list-title"><span class="dot" style="background:${escapeHtml(e.color)}"></span> ${escapeHtml(e.name)}</div><div class="list-meta">${escapeHtml(e.color)}${e.group ? ' · ' + escapeHtml(e.group) : ''}${e.layer ? ' · ' + escapeHtml(e.layer) : ''}${e.theory ? ' · ' + escapeHtml(e.theory) : ''}</div></div>`).join('')
  ).join('')}</div>`;
}

function renderCategoriesAdmin() {
  const loaded = state.categories.find(c => c.id === adminFormState.loadedCategoryId) || null;
  const isCustom = loaded?.type === 'custom';
  const hasMerkmale = loaded ? state.elements.some(e => e.categoryId === loaded.id) : false;
  els.adminForm.innerHTML = `<form class="form-grid" id="categoryForm">
    <div class="field"><label for="categoryName">Kategorie Name</label><input id="categoryName" name="name" value="${escapeHtml(loaded?.name || '')}" placeholder="z. B. Subkultur" ${loaded?.type === 'core' ? 'disabled' : ''} required></div>
    ${loaded?.type === 'core' ? '<div class="small-note">Core-Kategorien können nicht bearbeitet oder gelöscht werden.</div>' : ''}
    <div class="form-actions"><button class="primary" type="submit" ${loaded?.type === 'core' ? 'disabled' : ''}>Kategorie speichern</button><button class="danger" type="button" id="deleteCategory" ${isCustom && !hasMerkmale ? '' : 'disabled'}>Löschen</button><button type="button" id="newCategory">Neu</button></div>
  </form>`;
  els.adminList.innerHTML = `<div class="admin-list">${state.categories.map(c => `<div class="list-item ${loaded?.id === c.id ? 'is-active' : ''}" data-load-category="${c.id}"><div class="list-title">${escapeHtml(c.name)}</div><div class="list-meta"><span class="badge">${c.type}</span> · ${state.elements.filter(e => e.categoryId === c.id).length} Elemente</div></div>`).join('')}</div>`;
}

// ── INTERACTIONS ─────────────────────────────────────────

function openAdmin() { els.adminModal.classList.add('is-open'); renderAdmin(); }
function closeAdmin() { els.adminModal.classList.remove('is-open'); }

function toggleElement(elementId) {
  pushHistory();
  const idx = state.selectedElementIds.indexOf(elementId);
  if (idx >= 0) state.selectedElementIds.splice(idx, 1); else state.selectedElementIds.push(elementId);
  saveState(); renderApp();
}

function removeSelection(elementId) {
  pushHistory();
  state.selectedElementIds = state.selectedElementIds.filter(id => id !== elementId);
  saveState(); renderApp();
}

function clearSelection() {
  pushHistory();
  state.selectedElementIds = [];
  saveState(); renderApp();
}

function shuffleArray(arr) { return arr.map(v => ({ v, s: Math.random() })).sort((a, b) => a.s - b.s).map(({ v }) => v); }

function randomAll() {
  pushHistory();
  const shuffled = shuffleArray([...state.elements]);
  state.selectedElementIds = shuffled.slice(0, Math.min(5, shuffled.length)).map(e => e.id);
  saveState(); renderApp();
}

function randomByCategory() {
  pushHistory();
  const selected = [];
  state.categories.forEach(cat => {
    const elements = state.elements.filter(e => e.categoryId === cat.id);
    if (!elements.length) return;
    const amount = elements.length === 1 ? 1 : Math.floor(Math.random() * 2) + 1;
    selected.push(...shuffleArray(elements).slice(0, amount).map(e => e.id));
  });
  state.selectedElementIds = selected;
  saveState(); renderApp();
}

function saveElement(event) {
  event.preventDefault();
  const form = new FormData(event.target.closest('#elementForm'));
  const name = String(form.get('name') || '').trim();
  const categoryId = String(form.get('categoryId') || '').trim();
  const effectIds = form.getAll('effectIds').map(String);
  const observation = String(form.get('observation') || '').trim();
  if (!name || !categoryId) return showToast('Bitte Name und Kategorie ausfüllen.');
  pushHistory();
  if (adminFormState.loadedElementId) {
    const existing = state.elements.find(e => e.id === adminFormState.loadedElementId);
    if (existing) { existing.name = name; existing.categoryId = categoryId; existing.effectIds = effectIds; existing.observation = observation; }
  } else {
    const id = createId('element');
    state.elements.push({ id, name, categoryId, effectIds, observation });
    adminFormState.loadedElementId = id;
  }
  saveState(); renderApp(); showToast('Merkmal gespeichert');
}

function deleteElement() {
  const id = adminFormState.loadedElementId;
  const el = state.elements.find(e => e.id === id);
  if (!id || !el || !confirm(`Merkmal „${el.name}" wirklich löschen?`)) return;
  pushHistory();
  state.elements = state.elements.filter(e => e.id !== id);
  state.selectedElementIds = state.selectedElementIds.filter(i => i !== id);
  adminFormState.loadedElementId = null;
  saveState(); renderApp(); showToast('Merkmal gelöscht');
}

function saveEffect(event) {
  event.preventDefault();
  const form = new FormData(event.target.closest('#effectForm'));
  const name = String(form.get('name') || '').trim();
  const color = String(form.get('color') || '').trim();
  if (!name || !/^#[0-9a-fA-F]{6}$/.test(color)) return showToast('Bitte gültigen Namen und Farbe eingeben.');
  const group = getEffectGroupForName(name);
  pushHistory();
  if (adminFormState.loadedEffectId) {
    const existing = state.effects.find(e => e.id === adminFormState.loadedEffectId);
    if (existing) { existing.name = name; existing.id = slugify(name); existing.color = group ? group.color : color; existing.group = group ? group.name : existing.group; existing.layer = group ? group.layer : existing.layer; existing.theory = group ? group.theory : existing.theory; }
  } else {
    const id = slugify(name);
    state.effects.push({ id, name, color: group ? group.color : color, group: group ? group.name : undefined, layer: group ? group.layer : 'Eigene Wirkung', theory: group ? group.theory : 'Eigene Zuordnung' });
    adminFormState.loadedEffectId = id;
  }
  sortEffectsByGroup(); saveState(); renderApp(); showToast('Wirkung gespeichert');
}

function deleteEffect() {
  const id = adminFormState.loadedEffectId;
  const ef = state.effects.find(e => e.id === id);
  if (!id || !ef || !confirm(`Wirkung „${ef.name}" wirklich löschen?`)) return;
  pushHistory();
  state.effects = state.effects.filter(e => e.id !== id);
  state.elements.forEach(el => { el.effectIds = (el.effectIds || []).filter(eid => eid !== id); });
  adminFormState.loadedEffectId = null;
  saveState(); renderApp(); showToast('Wirkung gelöscht');
}

function saveKategorie(event) {
  event.preventDefault();
  const form = new FormData(event.target.closest('#categoryForm'));
  const name = String(form.get('name') || '').trim();
  if (!name) return showToast('Bitte Kategorie-Namen eingeben.');
  pushHistory();
  if (adminFormState.loadedCategoryId) {
    const existing = state.categories.find(c => c.id === adminFormState.loadedCategoryId);
    if (existing && existing.type === 'custom') existing.name = name;
  } else {
    const id = createId('category');
    state.categories.push({ id, name, type: 'custom' });
    adminFormState.loadedCategoryId = id;
  }
  saveState(); renderApp(); showToast('Kategorie gespeichert');
}

function deleteCategory() {
  const id = adminFormState.loadedCategoryId;
  const cat = state.categories.find(c => c.id === id);
  if (!id || !cat || cat.type !== 'custom' || state.elements.some(e => e.categoryId === id) || !confirm(`Kategorie „${cat.name}" wirklich löschen?`)) return;
  pushHistory();
  state.categories = state.categories.filter(c => c.id !== id);
  adminFormState.loadedCategoryId = null;
  saveState(); renderApp(); showToast('Kategorie gelöscht');
}

// ── IMAGE ─────────────────────────────────────────────────

function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 1200;
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      state.uploadedImageDataUrl = canvas.toDataURL('image/jpeg', 0.82);
      saveState(); renderApp();
    };
    img.onerror = () => showToast('Bild konnte nicht geladen werden.');
    img.src = reader.result;
  };
  reader.onerror = () => showToast('Datei konnte nicht gelesen werden.');
  reader.readAsDataURL(file);
  event.target.value = '';
}

function clearUploadedImage() { state.uploadedImageDataUrl = null; saveState(); renderApp(); }

// ── EVENT BINDING ─────────────────────────────────────────

function bindEvents() {
  els.adminOpen.addEventListener('click', openAdmin);
  els.adminClose.addEventListener('click', closeAdmin);
  els.methodologyOpen.addEventListener('click', openMethodology);
  els.methodologyClose.addEventListener('click', closeMethodology);
  els.methodologyModal.addEventListener('click', event => { if (event.target === els.methodologyModal) closeMethodology(); });
  els.imageUpload.addEventListener('change', handleImageUpload);
  els.clearImage.addEventListener('click', clearUploadedImage);
  els.mergeStarter.addEventListener('click', () => mergeStarterData(true));
  els.applyGroups.addEventListener('click', () => applyEffectGroups(true));
  els.clearSelection.addEventListener('click', clearSelection);
  els.randomAll.addEventListener('click', randomAll);
  els.randomByCategory.addEventListener('click', randomByCategory);
  els.exportData.addEventListener('click', exportData);
  els.importTrigger.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', e => importData(e.target.files?.[0]));
  els.undoBtn.addEventListener('click', undo);
  els.redoBtn.addEventListener('click', redo);

  // Mobile stepper
  els.stepper.addEventListener('click', event => {
    const btn = event.target.closest('[data-step]');
    if (!btn) return;
    state.activeMobileStep = parseInt(btn.dataset.step, 10);
    saveState();
    renderMobileStepper();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && els.adminModal.classList.contains('is-open')) { closeAdmin(); return; }
    if (event.key === 'Escape' && els.methodologyModal.classList.contains('is-open')) { closeMethodology(); return; }
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const ctrl = isMac ? event.metaKey : event.ctrlKey;
    if (ctrl && event.key === 'z' && !event.shiftKey) { event.preventDefault(); undo(); return; }
    if (ctrl && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) { event.preventDefault(); redo(); return; }
  });

  // Element rows — keyboard support (Enter / Space)
  els.categoryList.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      const row = event.target.closest('[data-toggle-element]');
      if (row) { event.preventDefault(); toggleElement(row.dataset.toggleElement); }
    }
  });

  els.categoryList.addEventListener('click', event => {
    const row = event.target.closest('[data-toggle-element]');
    if (row) toggleElement(row.dataset.toggleElement);
  });

  els.selectionView.addEventListener('click', event => {
    const chip = event.target.closest('[data-remove-selection]');
    if (chip) removeSelection(chip.dataset.removeSelection);
  });

  els.analysisView.addEventListener('click', event => {
    if (event.target.closest('[data-open-methodology]')) openMethodology();
  });

  els.adminTabs.addEventListener('click', event => {
    const tab = event.target.closest('[data-tab]');
    if (!tab) return;
    state.activeAdminTab = tab.dataset.tab;
    saveState(); renderAdmin();
  });

  els.adminForm.addEventListener('submit', event => {
    const form = event.target.closest('form'); if (!form) return;
    if (form.id === 'elementForm') saveElement(event);
    if (form.id === 'effectForm') saveEffect(event);
    if (form.id === 'categoryForm') saveKategorie(event);
  });

  els.adminForm.addEventListener('click', event => {
    if (event.target.matches('#deleteElement')) deleteElement();
    if (event.target.matches('#deleteEffect')) deleteEffect();
    if (event.target.matches('#deleteCategory')) deleteCategory();
    if (event.target.matches('#newElement')) { adminFormState.loadedElementId = null; renderAdmin(); }
    if (event.target.matches('#newEffect')) { adminFormState.loadedEffectId = null; renderAdmin(); }
    if (event.target.matches('#newCategory')) { adminFormState.loadedCategoryId = null; renderAdmin(); }
  });

  els.adminList.addEventListener('click', event => {
    const el = event.target.closest('[data-load-element]');
    const ef = event.target.closest('[data-load-effect]');
    const cat = event.target.closest('[data-load-category]');
    if (el) { adminFormState.loadedElementId = el.dataset.loadElement; renderAdmin(); }
    if (ef) { adminFormState.loadedEffectId = ef.dataset.loadEffect; renderAdmin(); }
    if (cat) { adminFormState.loadedCategoryId = cat.dataset.loadCategory; renderAdmin(); }
  });

  // Resize: re-evaluate stepper visibility
  window.addEventListener('resize', () => renderMobileStepper());
}

// ── SERVICE WORKER ────────────────────────────────────────

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration failed:', err));
  });
}

// ── INIT ──────────────────────────────────────────────────

loadState();
bindEvents();
renderApp();
