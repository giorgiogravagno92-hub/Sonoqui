const API_BASE_URL = 'http://localhost:5000/api';

// Helper for local mock storage fallback
const getMockData = (key: string, defaultValue: any) => {
  const data = localStorage.getItem(`sono_qui_mock_${key}`);
  return data ? JSON.parse(data) : defaultValue;
};

const setMockData = (key: string, value: any) => {
  localStorage.setItem(`sono_qui_mock_${key}`, JSON.stringify(value));
};

// Initialize mock database if empty
if (!localStorage.getItem('sono_qui_mock_initialized_v2')) {
  localStorage.removeItem('sono_qui_mock_workers');
  setMockData('workers', []);
  setMockData('wp_pages', {
    home: {
      title: 'Benvenuti su Sono Qui',
      content: 'La piattaforma rivoluzionaria dove le aziende cercano direttamente te. Inserisci la tua disponibilità, compila il tuo CV strutturato in 2 minuti e lasciati trovare dai migliori datori di lavoro della tua zona.',
      seoTitle: 'Sono Qui - Trova Lavoro Subito, Fatti Cercare dalle Aziende',
      seoDescription: 'Non perdere tempo con candidature a vuoto. Su Sono Qui inserisci il tuo profilo e sono le aziende a contattarti per colloqui diretti.'
    },
    about: {
      title: 'Chi Siamo',
      content: 'Sono Qui nasce nel 2026 dall\'esigenza di semplificare l\'incontro tra domanda e offerta di lavoro. Crediamo che il modello tradizionale degli annunci sia obsoleto. Vogliamo dare centralità al lavoratore e alla sua disponibilità immediata, riducendo i tempi di selezione per le aziende da settimane a poche ore.',
      seoTitle: 'Chi Siamo - La Nostra Missione | Sono Qui',
      seoDescription: 'La storia e la missione dietro Sono Qui. Cambiamo il modo in cui cerchi lavoro e personale.'
    },
    privacy: {
      title: 'Privacy & Cookie Policy',
      content: 'In conformità con il GDPR (UE 2016/679), raccogliamo e trattiamo i tuoi dati esclusivamente per erogare il servizio di intermediazione lavorativa. I tuoi dati personali, inclusi CV e contatti, saranno visibili solo alle aziende registrate e verificate sulla piattaforma.',
      seoTitle: 'Privacy Policy e Trattamento Dati - Sono Qui',
      seoDescription: 'Informative chiare sul trattamento dei tuoi dati personali, cookie policy e diritti degli utenti.'
    }
  });
  setMockData('wp_posts', [
    {
      id: 1,
      title: 'Come ottimizzare il tuo profilo per essere assunto subito',
      slug: 'ottimizzare-profilo-assunzione-veloce',
      excerpt: 'I 5 errori da evitare nella compilazione del tuo CV digitale e come scrivere le competenze chiave.',
      content: 'Nel mercato attuale, la velocità è tutto. Le aziende che cercano su Sono Qui vogliono sapere immediatamente cosa sai fare e quando sei disponibile...',
      date: '2026-07-10T09:30:00Z',
      author: 'Redazione Sono Qui',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60'
    }
  ]);
  setMockData('wp_faqs', [
    {
      id: 1,
      question: 'Come funziona il sistema di disponibilità?',
      answer: 'Su Sono Qui puoi impostare il tuo stato su: "Disponibile subito" (se sei pronto a lavorare da oggi), "Valuto offerte" (se hai già un lavoro ma sei aperto ad altro) o "Non disponibile".',
      category: 'Candidati'
    }
  ]);
  localStorage.setItem('sono_qui_mock_initialized_v2', 'true');
}

// Check server status
let isBackendOffline = false;

const request = async (method: string, path: string, body?: any) => {
  const token = localStorage.getItem('sono_qui_token');
  const headers: any = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request failed');
    }
    isBackendOffline = false;
    return await res.json();
  } catch (error: any) {
    if (error.message === 'Failed to fetch') {
      console.warn('Backend is offline. Using mock simulated responses.');
      isBackendOffline = true;
      return handleMockFallback(method, path, body);
    }
    throw error;
  }
};

// Simulated mock fallback engine in case backend server is not running
const handleMockFallback = (method: string, path: string, body?: any) => {
  if (path.startsWith('/auth/login')) {
    const { email } = body;
    const role = email.includes('admin') ? 'ADMIN' : (email.includes('azienda') ? 'COMPANY' : 'WORKER');
    const mockUser = {
      id: role === 'ADMIN' ? 'u-admin' : (role === 'COMPANY' ? 'u-comp' : 'u-work'),
      email,
      role
    };
    localStorage.setItem('sono_qui_token', 'mock-jwt-token-1234');
    return { token: 'mock-jwt-token-1234', user: mockUser };
  }

  if (path.startsWith('/auth/register')) {
    const { email, password, role, profileData } = body;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (password && !passwordRegex.test(password)) {
      throw new Error('La password deve contenere almeno 8 caratteri, una lettera maiuscola, un numero e un simbolo.');
    }
    const mockUser = { id: `u-${Math.random()}`, email, role };
    localStorage.setItem('sono_qui_token', 'mock-jwt-token-1234');
    if (role === 'COMPANY') {
      setMockData('company_profile', {
        companyType: 'AZIENDA',
        companyName: profileData?.companyName || null,
        address: profileData?.address || null,
        city: profileData?.city || null,
        province: profileData?.province || null,
        sigla: profileData?.sigla || null,
        industry: profileData?.sector || profileData?.industry || 'Altro',
        contactPerson: profileData?.companyName || 'Referente',
        contactPhone: null
      });
    }
    return { token: 'mock-jwt-token-1234', user: mockUser };
  }

  if (path.startsWith('/auth/me')) {
    const token = localStorage.getItem('sono_qui_token');
    if (!token) throw new Error('Unauthorized');
    return { 
      id: 'u-work', 
      email: 'worker@demo.it', 
      role: 'WORKER',
      profile: {
        firstName: 'Mario',
        lastName: 'Rossi'
      }
    };
  }

  if (path.startsWith('/workers/profile')) {
    if (method === 'GET') {
      const defaultWorker = {
        id: 'w1',
        firstName: 'Mario',
        lastName: 'Rossi',
        profession: 'Elettricista',
        city: 'Roma',
        province: 'Roma',
        sigla: 'RM',
        region: 'Lazio',
        educationLevel: 'NESSUNO',
        educationField: '',
        educationTitles: '[]',
        skills: '{"computerSkills":{},"organizationalSkills":{}}',
        availabilityStatus: 'DISPONIBILE_PROPOSTE',
        availabilityRegionsProvinces: '[]',
        availabilityContracts: '[]',
        notes: '',
        workExperiences: []
      };
      return getMockData('workers', [defaultWorker])[0];
    }
    if (method === 'PUT') {
      const workers = getMockData('workers', []);
      workers[0] = { ...workers[0], ...body };
      setMockData('workers', workers);
      return workers[0];
    }
  }

  if (path.startsWith('/workers/availability')) {
    const workers = getMockData('workers', []);
    workers[0].availabilityStatus = body.status;
    if (body.status !== 'NON_DISPONIBILE') {
      workers[0].profession = body.profession || workers[0].profession;
      workers[0].city = body.city || workers[0].city;
      workers[0].maxDistanceKm = Number(body.maxDistanceKm) || workers[0].maxDistanceKm;
      workers[0].availabilityDetails = body.availabilityDetails || '';
      workers[0].availabilityRegionsProvinces = body.availabilityRegionsProvinces || workers[0].availabilityRegionsProvinces || '[]';
      workers[0].availabilityContracts = body.availabilityContracts || workers[0].availabilityContracts || '[]';
      workers[0].availabilityNotes = body.notes || '';
    }
    setMockData('workers', workers);
    return { success: true, availabilityStatus: body.status, profile: workers[0] };
  }

  if (path.startsWith('/workers/upload-cv')) {
    const workers = getMockData('workers', []);
    const fileUrl = `/uploads/mock-cv-${Date.now()}.pdf`;
    workers[0].cvPdfUrl = fileUrl;
    setMockData('workers', workers);
    return { success: true, cvPdfUrl: fileUrl };
  }

  if (path.startsWith('/workers/upload-photo')) {
    const workers = getMockData('workers', []);
    const fileUrl = body.base64Data; // Just return base64 for mock
    workers[0].photoUrl = fileUrl;
    setMockData('workers', workers);
    return { success: true, photoUrl: fileUrl };
  }

  if (path.startsWith('/companies/profile')) {
    if (method === 'GET') {
      return getMockData('company_profile', {
        companyType: 'AZIENDA',
        companyName: 'Innovate Tech S.p.A.',
        industry: 'Tecnologia & Software',
        city: 'Milano',
        contactPerson: 'Ing. Alessandro Bianchi',
        contactPhone: '+39 02 1234567'
      });
    }
    if (method === 'PUT') {
      const current = getMockData('company_profile', {});
      const updated = { ...current, ...body };
      setMockData('company_profile', updated);
      return updated;
    }
  }

  if (path.startsWith('/companies/search')) {
    const workers = getMockData('workers', []);
    // Simple filter simulation
    return workers;
  }

  if (path.startsWith('/wp/pages/')) {
    const key = path.split('/').pop() || 'home';
    const pages = getMockData('wp_pages', {});
    return pages[key] || { title: 'Not Found', content: '' };
  }

  if (path.startsWith('/wp/posts')) {
    return getMockData('wp_posts', []);
  }

  if (path.startsWith('/wp/faqs')) {
    return getMockData('wp_faqs', []);
  }

  if (path.startsWith('/admin/stats')) {
    return {
      totals: { workers: 120, companies: 45, interviews: 88, favorites: 230 },
      availabilityDistribution: { DISPONIBILE_SUBITO: 65, VALUTO_OFFERTE: 40, NON_DISPONIBILE: 15 },
      interviewStatusDistribution: { PENDING: 30, ACCEPTED: 45, DECLINED: 13 }
    };
  }

  return { success: true };
};

export const api = {
  isOffline: () => isBackendOffline,
  auth: {
    login: (body: any) => request('POST', '/auth/login', body),
    register: (body: any) => request('POST', '/auth/register', body),
    me: () => request('GET', '/auth/me'),
    socialLogin: (body: any) => request('POST', '/auth/social-login', body)
  },
  worker: {
    getProfile: () => request('GET', '/workers/profile'),
    updateProfile: (body: any) => request('PUT', '/workers/profile', body),
    toggleAvailability: (body: any) => request('PUT', '/workers/availability', body),
    getNotifications: () => request('GET', '/workers/notifications'),
    markNotificationRead: (id: string) => request('PUT', `/workers/notifications/${id}/read`),
    getInterviews: () => request('GET', '/workers/interviews'),
    respondToInterview: (id: string, status: string) => request('PUT', `/workers/interviews/${id}/respond`, { status }),
    uploadCv: (body: any) => request('POST', '/workers/upload-cv', body),
    uploadPhoto: (body: any) => request('POST', '/workers/upload-photo', body),
    getProposals: () => request('GET', '/workers/proposals'),
    respondToProposal: (id: string, status: string) => request('POST', `/workers/proposals/${id}/respond`, { status })
  },
  company: {
    getProfile: () => request('GET', '/companies/profile'),
    updateProfile: (body: any) => request('PUT', '/companies/profile', body),
    search: (params: any) => {
      const q = new URLSearchParams(params).toString();
      return request('GET', `/companies/search?${q}`);
    },
    getWorkerDetails: (id: string) => request('GET', `/companies/workers/${id}`),
    toggleFavorite: (workerId: string) => request('POST', '/companies/favorites', { workerId }),
    getFavorites: () => request('GET', '/companies/favorites'),
    requestInterview: (body: any) => request('POST', '/companies/interviews', body),
    createProposal: (body: any) => request('POST', '/companies/proposals', body),
    getProposals: () => request('GET', '/companies/proposals'),
    updateProposal: (id: string, body: any) => request('PUT', `/companies/proposals/${id}`, body),
    deleteProposal: (id: string) => request('DELETE', `/companies/proposals/${id}`)
  },
  admin: {
    getStats: () => request('GET', '/admin/stats'),
    getUsers: () => request('GET', '/admin/users'),
    getCompanies: () => request('GET', '/admin/companies'),
    deleteUser: (id: string) => request('DELETE', `/admin/users/${id}`),
    sendNotification: (body: any) => request('POST', '/admin/notifications', body)
  },
  wp: {
    getPage: (key: string) => request('GET', `/wp/pages/${key}`),
    getPosts: () => request('GET', '/wp/posts'),
    getPost: (slug: string) => request('GET', `/wp/posts/${slug}`),
    getFAQs: () => request('GET', '/wp/faqs'),
    getSettings: () => request('GET', '/wp/settings'),
    updateSettings: (body: any) => request('PUT', '/wp/settings', body),
    updatePage: (key: string, body: any) => request('PUT', `/wp/pages/${key}`, body),
    createPost: (body: any) => request('POST', '/wp/posts', body),
    deletePost: (id: number) => request('DELETE', `/wp/posts/${id}`),
    createFAQ: (body: any) => request('POST', '/wp/faqs', body),
    deleteFAQ: (id: number) => request('DELETE', `/wp/faqs/${id}`)
  }
};
