"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFAQ = exports.createFAQ = exports.deletePost = exports.createPost = exports.updatePageContent = exports.updateSettings = exports.getSettings = exports.getFAQs = exports.getPostBySlug = exports.getPosts = exports.getPage = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const WP_DATA_FILE = path_1.default.join(__dirname, '../../wp-simulator-data.json');
const defaultWPData = {
    config: {
        wordpressUrl: 'https://demo.wp-api.org',
        useRealWordPress: false
    },
    pages: {
        home: {
            title: 'Benvenuti su Sono Qui',
            content: 'La piattaforma rivoluzionaria dove le aziende cercano direttamente te. Inserisci la tua disponibilità, compila il tuo CV strutturato in 2 minuti e lasciati trovare dai migliori datori di lavoro della tua zona.',
            seoTitle: 'Sono Qui - Trova Lavoro Subito, Fatti Cercare dalle Aziende',
            seoDescription: 'Non perdere tempo con candidature a vuoto. Su Sono Qui inserisci il tuo profilo e sono le aziende a contattarti per colloqui diretti.',
            lastUpdated: '2026-07-12T12:00:00Z'
        },
        about: {
            title: 'Chi Siamo',
            content: 'Sono Qui nasce nel 2026 dall\'esigenza di semplificare l\'incontro tra domanda e offerta di lavoro. Crediamo che il modello tradizionale degli annunci sia obsoleto. Vogliamo dare centralità al lavoratore e alla sua disponibilità immediata, riducendo i tempi di selezione per le aziende da settimane a poche ore.',
            seoTitle: 'Chi Siamo - La Nostra Missione | Sono Qui',
            seoDescription: 'La storia e la missione dietro Sono Qui. Cambiamo il modo in cui cerchi lavoro e personale.',
            lastUpdated: '2026-07-12T12:00:00Z'
        },
        privacy: {
            title: 'Privacy & Cookie Policy',
            content: 'In conformità con il GDPR (UE 2016/679), raccogliamo e trattiamo i tuoi dati esclusivamente per erogare il servizio di intermediazione lavorativa. I tuoi dati personali, inclusi CV e contatti, saranno visibili solo alle aziende registrate e verificate sulla piattaforma. Puoi revocare il consenso o modificare la tua visibilità in qualsiasi momento con un semplice click.',
            seoTitle: 'Privacy Policy e Trattamento Dati - Sono Qui',
            seoDescription: 'Informative chiare sul trattamento dei tuoi dati personali, cookie policy e diritti degli utenti.',
            lastUpdated: '2026-07-12T12:00:00Z'
        },
        terms: {
            title: 'Termini di Utilizzo',
            content: 'L\'utilizzo della piattaforma "Sono Qui" è riservato ad utenti maggiorenni. I candidati si impegnano a fornire informazioni veritiere sul proprio CV. Le aziende si impegnano a utilizzare i contatti esclusivamente per finalità di selezione del personale, nel rispetto delle leggi vigenti sul lavoro. L\'abuso delle funzionalità comporterà la sospensione immediata dell\'account.',
            seoTitle: 'Termini e Condizioni di Servizio - Sono Qui',
            seoDescription: 'Condizioni generali d\'uso per candidati e aziende della piattaforma.',
            lastUpdated: '2026-07-12T12:00:00Z'
        }
    },
    posts: [
        {
            id: 1,
            title: 'Come ottimizzare il tuo profilo per essere assunto subito',
            slug: 'ottimizzare-profilo-assunzione-veloce',
            excerpt: 'I 5 errori da evitare nella compilazione del tuo CV digitale e come scrivere le competenze chiave.',
            content: 'Nel mercato attuale, la velocità è tutto. Le aziende che cercano su Sono Qui vogliono sapere immediatamente cosa sai fare e quando sei disponibile. Ecco una guida dettagliata per compilare i campi del tuo profilo in modo che risalti nelle ricerche...\n\n1. Sii specifico nella professione.\n2. Inserisci competenze reali e verificabili.\n3. Mantieni attiva la disponibilità lampo se cerchi lavoro oggi.',
            date: '2026-07-10T09:30:00Z',
            author: 'Redazione Sono Qui',
            imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60'
        },
        {
            id: 2,
            title: 'Guida per le aziende: come filtrare i candidati ideali',
            slug: 'guida-aziende-filtri-ricerca-efficace',
            excerpt: 'Impara ad utilizzare al meglio la nostra ricerca avanzata per trovare elettricisti, programmatori e addetti vendita.',
            content: 'Con oltre migliaia di profili attivi, la ricerca avanzata è il tuo strumento più potente. In questa guida ti mostriamo come combinare i filtri geografici (provincia, regione e raggio di distanza) con lo stato di disponibilità per ridurre a zero i tempi di recruiting...',
            date: '2026-07-08T14:15:00Z',
            author: 'Team Supporto Aziende',
            imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60'
        }
    ],
    faqs: [
        {
            id: 1,
            question: 'Come funziona il sistema di disponibilità?',
            answer: 'Su Sono Qui puoi impostare il tuo stato su: "Disponibile subito" (se sei pronto a lavorare da oggi), "Valuto offerte" (se hai già un lavoro ma sei aperto ad altro) o "Non disponibile" (per nasconderti momentaneamente dalle ricerche delle aziende). Puoi cambiarlo con un solo pulsante dal tuo pannello.',
            category: 'Candidati'
        },
        {
            id: 2,
            question: 'Le aziende vedono i miei dati di contatto direttamente?',
            answer: 'No, i tuoi dati sensibili come telefono o indirizzo email esatto vengono mostrati all\'azienda solo dopo che hai accettato la loro richiesta di colloquio o se hai impostato il profilo come pubblico per le aziende verificate.',
            category: 'Privacy'
        },
        {
            id: 3,
            question: 'È previsto un costo per le aziende?',
            answer: 'La registrazione e la ricerca di base sono gratuite. Per sbloccare i contatti diretti illimitati e inviare più richieste di colloquio al giorno, le aziende possono sottoscrivere un abbonamento mensile.',
            category: 'Aziende'
        }
    ]
};
// Helper to read database or local simulated file
const loadWPData = () => {
    try {
        if (fs_1.default.existsSync(WP_DATA_FILE)) {
            const raw = fs_1.default.readFileSync(WP_DATA_FILE, 'utf-8');
            return JSON.parse(raw);
        }
    }
    catch (err) {
        console.error('Error reading WP Simulator JSON:', err);
    }
    return defaultWPData;
};
const saveWPData = (data) => {
    try {
        fs_1.default.writeFileSync(WP_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }
    catch (err) {
        console.error('Error saving WP Simulator JSON:', err);
    }
};
const getPage = async (req, res) => {
    const { pageKey } = req.params;
    const data = loadWPData();
    if (data.config.useRealWordPress) {
        // If real WP is configured, we could fetch from WP REST API:
        // e.g. fetch(`${data.config.wordpressUrl}/wp-json/wp/v2/pages?slug=${pageKey}`)
        // For demo purposes, we fallback to simulated data if fetch fails
    }
    const page = data.pages[pageKey];
    if (!page) {
        return res.status(404).json({ error: 'Page not found in WordPress simulator' });
    }
    res.json(page);
};
exports.getPage = getPage;
const getPosts = async (req, res) => {
    const data = loadWPData();
    res.json(data.posts);
};
exports.getPosts = getPosts;
const getPostBySlug = async (req, res) => {
    const { slug } = req.params;
    const data = loadWPData();
    const post = data.posts.find((p) => p.slug === slug);
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
};
exports.getPostBySlug = getPostBySlug;
const getFAQs = async (req, res) => {
    const data = loadWPData();
    res.json(data.faqs);
};
exports.getFAQs = getFAQs;
const getSettings = async (req, res) => {
    const data = loadWPData();
    res.json(data.config);
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        const { wordpressUrl, useRealWordPress } = req.body;
        const data = loadWPData();
        data.config.wordpressUrl = wordpressUrl || data.config.wordpressUrl;
        data.config.useRealWordPress = typeof useRealWordPress === 'boolean' ? useRealWordPress : data.config.useRealWordPress;
        saveWPData(data);
        res.json({ success: true, config: data.config });
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating WordPress settings' });
    }
};
exports.updateSettings = updateSettings;
const updatePageContent = async (req, res) => {
    try {
        const { pageKey } = req.params;
        const { title, content, seoTitle, seoDescription } = req.body;
        const data = loadWPData();
        if (!data.pages[pageKey]) {
            return res.status(404).json({ error: 'Page not found' });
        }
        data.pages[pageKey] = {
            title: title || data.pages[pageKey].title,
            content: content || data.pages[pageKey].content,
            seoTitle: seoTitle || data.pages[pageKey].seoTitle,
            seoDescription: seoDescription || data.pages[pageKey].seoDescription,
            lastUpdated: new Date().toISOString()
        };
        saveWPData(data);
        res.json({ success: true, page: data.pages[pageKey] });
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating page content' });
    }
};
exports.updatePageContent = updatePageContent;
const createPost = async (req, res) => {
    try {
        const { title, excerpt, content, imageUrl, author } = req.body;
        const data = loadWPData();
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const newPost = {
            id: Date.now(),
            title,
            slug,
            excerpt: excerpt || title,
            content,
            date: new Date().toISOString(),
            author: author || 'Amministratore',
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60'
        };
        data.posts.unshift(newPost);
        saveWPData(data);
        res.status(201).json(newPost);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating post' });
    }
};
exports.createPost = createPost;
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const data = loadWPData();
        const postId = Number(id);
        data.posts = data.posts.filter((p) => p.id !== postId);
        saveWPData(data);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting post' });
    }
};
exports.deletePost = deletePost;
const createFAQ = async (req, res) => {
    try {
        const { question, answer, category } = req.body;
        const data = loadWPData();
        const newFAQ = {
            id: Date.now(),
            question,
            answer,
            category: category || 'Generale'
        };
        data.faqs.push(newFAQ);
        saveWPData(data);
        res.status(201).json(newFAQ);
    }
    catch (error) {
        res.status(500).json({ error: 'Error creating FAQ' });
    }
};
exports.createFAQ = createFAQ;
const deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const data = loadWPData();
        const faqId = Number(id);
        data.faqs = data.faqs.filter((f) => f.id !== faqId);
        saveWPData(data);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Error deleting FAQ' });
    }
};
exports.deleteFAQ = deleteFAQ;
