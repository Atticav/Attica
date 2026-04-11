export type Language = 'pt-BR' | 'en' | 'es' | 'fr' | 'it'

export interface Translations {
  nav: {
    home: string
    overview: string
    itinerary: string
    map: string
    financial: string
    documents: string
    packing: string
    checklist: string
    strategic: string
    guide: string
    gallery: string
    restaurants: string
    photography: string
    culture: string
    vocabulary: string
    contract: string
    logout: string
    currentTrip: string
    selectTrip: string
    settings: string
  }
  dashboard: {
    welcome: string
    welcomeSubtitle: string
    yourTrips: string
    noTrips: string
    noTripsDesc: string
    travelNotebook: string
    daysUntil: string
    destinationInfo: string
    sections: {
      itinerary: string
      itineraryDesc: string
      financial: string
      financialDesc: string
      documents: string
      documentsDesc: string
      packing: string
      packingDesc: string
      checklist: string
      checklistDesc: string
      strategic: string
      strategicDesc: string
      guide: string
      guideDesc: string
      gallery: string
      galleryDesc: string
      restaurants: string
      restaurantsDesc: string
      photography: string
      photographyDesc: string
      culture: string
      cultureDesc: string
      vocabulary: string
      vocabularyDesc: string
      contract: string
      contractDesc: string
    }
    destination: string
    date: string
    language: string
    currency: string
    voltage: string
    timezone: string
    bestSeason: string
  }
  packing: {
    title: string
    noItems: string
    packed: string
    notPacked: string
    addItem: string
    itemName: string
    category: string
    quantity: string
    notes: string
    bag: string
    restricted: string
    noRestrictions: string
    noRestrictionsDesc: string
    allCategories: string
    itemsReady: string
    addItemModal: string
    categories: {
      clothing: string
      toiletries: string
      electronics: string
      documents: string
      health: string
      accessories: string
      other: string
    }
  }
  checklist: {
    title: string
    noItems: string
    noItemsDesc: string
    completed: string
    pending: string
    addTask: string
    taskTitle: string
    section: string
    sectionHint: string
    description: string
    deadline: string
    tasksCompleted: string
    addTaskModal: string
  }
  common: {
    loading: string
    error: string
    save: string
    cancel: string
    edit: string
    delete: string
    back: string
    noData: string
    language: string
    changeLanguage: string
    optional: string
    required: string
    of: string
    days: string
  }
  settings: {
    title: string
    languageSection: string
    profileSection: string
    fullName: string
    phone: string
    saved: string
    saving: string
  }
  hero: {
    welcome: string
    subtitle: string
  }
}

const ptBR: Translations = {
  nav: {
    home: 'Início',
    overview: 'Visão Geral',
    itinerary: 'Roteiro',
    map: 'Mapa',
    financial: 'Financeiro',
    documents: 'Documentos',
    packing: 'Mala Inteligente',
    checklist: 'Checklist',
    strategic: 'Central Estratégica',
    guide: 'Guia Attica',
    gallery: 'Galeria',
    restaurants: 'Restaurantes',
    photography: 'Fotografia',
    culture: 'Cultura',
    vocabulary: 'Vocabulário',
    contract: 'Contrato',
    logout: 'Sair',
    currentTrip: 'Viagem atual',
    selectTrip: 'Selecione uma viagem',
    settings: 'Configurações',
  },
  dashboard: {
    welcome: 'Olá',
    welcomeSubtitle: 'Bem-vindo(a) ao seu Caderno de Viagem',
    yourTrips: 'Suas viagens',
    noTrips: 'Nenhuma viagem ainda',
    noTripsDesc: 'Em breve sua consultora Attica irá preparar seu caderno de viagem personalizado.',
    travelNotebook: 'Seu caderno de viagem',
    daysUntil: 'Faltam',
    destinationInfo: 'Informações do destino',
    sections: {
      itinerary: 'Roteiro',
      itineraryDesc: 'Dia a dia da sua viagem',
      financial: 'Financeiro',
      financialDesc: 'Controle de gastos e pagamentos',
      documents: 'Documentos',
      documentsDesc: 'Passaportes, vistos e mais',
      packing: 'Mala Inteligente',
      packingDesc: 'Lista de itens para empacotar',
      checklist: 'Checklist',
      checklistDesc: 'Tarefas antes da viagem',
      strategic: 'Central Estratégica',
      strategicDesc: 'Links e informações essenciais',
      guide: 'Guia Attica',
      guideDesc: 'Vídeos e tutoriais exclusivos',
      gallery: 'Galeria',
      galleryDesc: 'Fotos e vídeos do destino',
      restaurants: 'Restaurantes',
      restaurantsDesc: 'Indicações gastronômicas',
      photography: 'Fotografia',
      photographyDesc: 'Dicas para fotos incríveis',
      culture: 'Cultura',
      cultureDesc: 'Costumes e informações locais',
      vocabulary: 'Vocabulário',
      vocabularyDesc: 'Palavras e frases essenciais',
      contract: 'Contrato',
      contractDesc: 'Documentos e acordos',
    },
    destination: 'Destino',
    date: 'Data',
    language: 'Idioma',
    currency: 'Moeda',
    voltage: 'Voltagem',
    timezone: 'Fuso horário',
    bestSeason: 'Melhor época',
  },
  packing: {
    title: 'Mala Inteligente',
    noItems: 'Nenhum item encontrado',
    packed: 'Marcar como não embalado',
    notPacked: 'Marcar como embalado',
    addItem: 'Adicionar Item',
    itemName: 'Nome do item',
    category: 'Categoria',
    quantity: 'Quantidade',
    notes: 'Notas',
    bag: 'Mala',
    restricted: 'O Que Não Levar',
    noRestrictions: 'Sem restrições cadastradas',
    noRestrictionsDesc: 'Nenhuma restrição cadastrada para este destino.',
    allCategories: 'Todos',
    itemsReady: 'itens prontos',
    addItemModal: 'Adicionar Item à Mala',
    categories: {
      clothing: 'Roupa',
      toiletries: 'Higiene',
      electronics: 'Eletrônico',
      documents: 'Documento',
      health: 'Medicamento',
      accessories: 'Acessório',
      other: 'Outro',
    },
  },
  checklist: {
    title: 'Checklist Pré-Viagem',
    noItems: 'Nenhuma tarefa ainda',
    noItemsDesc: 'Adicione tarefas de preparação para a sua viagem.',
    completed: 'Marcar como pendente',
    pending: 'Marcar como concluído',
    addTask: 'Adicionar Tarefa',
    taskTitle: 'Título',
    section: 'Seção',
    sectionHint: 'deixe em branco para usar a primeira existente',
    description: 'Descrição',
    deadline: 'Prazo',
    tasksCompleted: 'tarefas concluídas',
    addTaskModal: 'Adicionar Tarefa',
  },
  common: {
    loading: 'Carregando...',
    error: 'Erro ao carregar dados',
    save: 'Salvar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Excluir',
    back: 'Voltar',
    noData: 'Sem dados',
    language: 'Idioma',
    changeLanguage: 'Alterar idioma',
    optional: 'opcional',
    required: '*',
    of: 'de',
    days: 'dias',
  },
  settings: {
    title: 'Configurações',
    languageSection: 'Idioma da interface',
    profileSection: 'Dados pessoais',
    fullName: 'Nome completo',
    phone: 'Telefone',
    saved: 'Salvo com sucesso!',
    saving: 'Salvando...',
  },
  hero: {
    welcome: 'BEM VINDO(A)',
    subtitle: 'Planejamento exclusivo para uma experiência leve, organizada e memorável.',
  },
}

const en: Translations = {
  nav: {
    home: 'Home',
    overview: 'Overview',
    itinerary: 'Itinerary',
    map: 'Map',
    financial: 'Financial',
    documents: 'Documents',
    packing: 'Smart Packing',
    checklist: 'Checklist',
    strategic: 'Strategic Hub',
    guide: 'Attica Guide',
    gallery: 'Gallery',
    restaurants: 'Restaurants',
    photography: 'Photography',
    culture: 'Culture',
    vocabulary: 'Vocabulary',
    contract: 'Contract',
    logout: 'Logout',
    currentTrip: 'Current trip',
    selectTrip: 'Select a trip',
    settings: 'Settings',
  },
  dashboard: {
    welcome: 'Hello',
    welcomeSubtitle: 'Welcome to your Travel Notebook',
    yourTrips: 'Your trips',
    noTrips: 'No trips yet',
    noTripsDesc: 'Your Attica consultant will soon prepare your personalized travel notebook.',
    travelNotebook: 'Your travel notebook',
    daysUntil: 'Days until trip',
    destinationInfo: 'Destination information',
    sections: {
      itinerary: 'Itinerary',
      itineraryDesc: 'Day by day of your trip',
      financial: 'Financial',
      financialDesc: 'Expense and payment tracking',
      documents: 'Documents',
      documentsDesc: 'Passports, visas and more',
      packing: 'Smart Packing',
      packingDesc: 'Packing item list',
      checklist: 'Checklist',
      checklistDesc: 'Pre-trip tasks',
      strategic: 'Strategic Hub',
      strategicDesc: 'Essential links and info',
      guide: 'Attica Guide',
      guideDesc: 'Exclusive videos and tutorials',
      gallery: 'Gallery',
      galleryDesc: 'Destination photos and videos',
      restaurants: 'Restaurants',
      restaurantsDesc: 'Dining recommendations',
      photography: 'Photography',
      photographyDesc: 'Amazing photo tips',
      culture: 'Culture',
      cultureDesc: 'Local customs and info',
      vocabulary: 'Vocabulary',
      vocabularyDesc: 'Essential words and phrases',
      contract: 'Contract',
      contractDesc: 'Documents and agreements',
    },
    destination: 'Destination',
    date: 'Date',
    language: 'Language',
    currency: 'Currency',
    voltage: 'Voltage',
    timezone: 'Timezone',
    bestSeason: 'Best season',
  },
  packing: {
    title: 'Smart Packing',
    noItems: 'No items found',
    packed: 'Mark as not packed',
    notPacked: 'Mark as packed',
    addItem: 'Add Item',
    itemName: 'Item name',
    category: 'Category',
    quantity: 'Quantity',
    notes: 'Notes',
    bag: 'Bag',
    restricted: 'What Not to Bring',
    noRestrictions: 'No restrictions registered',
    noRestrictionsDesc: 'No restrictions registered for this destination.',
    allCategories: 'All',
    itemsReady: 'items ready',
    addItemModal: 'Add Item to Bag',
    categories: {
      clothing: 'Clothing',
      toiletries: 'Toiletries',
      electronics: 'Electronics',
      documents: 'Documents',
      health: 'Medication',
      accessories: 'Accessories',
      other: 'Other',
    },
  },
  checklist: {
    title: 'Pre-Trip Checklist',
    noItems: 'No tasks yet',
    noItemsDesc: 'Add preparation tasks for your trip.',
    completed: 'Mark as pending',
    pending: 'Mark as completed',
    addTask: 'Add Task',
    taskTitle: 'Title',
    section: 'Section',
    sectionHint: 'leave blank to use the first existing one',
    description: 'Description',
    deadline: 'Deadline',
    tasksCompleted: 'tasks completed',
    addTaskModal: 'Add Task',
  },
  common: {
    loading: 'Loading...',
    error: 'Error loading data',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    noData: 'No data',
    language: 'Language',
    changeLanguage: 'Change language',
    optional: 'optional',
    required: '*',
    of: 'of',
    days: 'days',
  },
  settings: {
    title: 'Settings',
    languageSection: 'Interface language',
    profileSection: 'Personal information',
    fullName: 'Full name',
    phone: 'Phone',
    saved: 'Saved successfully!',
    saving: 'Saving...',
  },
  hero: {
    welcome: 'WELCOME',
    subtitle: 'Exclusive planning for a light, organized and memorable experience.',
  },
}

const es: Translations = {
  nav: {
    home: 'Inicio',
    overview: 'Visión General',
    itinerary: 'Itinerario',
    map: 'Mapa',
    financial: 'Financiero',
    documents: 'Documentos',
    packing: 'Maleta Inteligente',
    checklist: 'Checklist',
    strategic: 'Central Estratégica',
    guide: 'Guía Attica',
    gallery: 'Galería',
    restaurants: 'Restaurantes',
    photography: 'Fotografía',
    culture: 'Cultura',
    vocabulary: 'Vocabulario',
    contract: 'Contrato',
    logout: 'Salir',
    currentTrip: 'Viaje actual',
    selectTrip: 'Seleccione un viaje',
    settings: 'Configuración',
  },
  dashboard: {
    welcome: 'Hola',
    welcomeSubtitle: 'Bienvenido(a) a tu Cuaderno de Viaje',
    yourTrips: 'Tus viajes',
    noTrips: 'Ningún viaje aún',
    noTripsDesc: 'Pronto tu consultora Attica preparará tu cuaderno de viaje personalizado.',
    travelNotebook: 'Tu cuaderno de viaje',
    daysUntil: 'Faltan',
    destinationInfo: 'Información del destino',
    sections: {
      itinerary: 'Itinerario',
      itineraryDesc: 'Día a día de tu viaje',
      financial: 'Financiero',
      financialDesc: 'Control de gastos y pagos',
      documents: 'Documentos',
      documentsDesc: 'Pasaportes, visas y más',
      packing: 'Maleta Inteligente',
      packingDesc: 'Lista de artículos para empacar',
      checklist: 'Checklist',
      checklistDesc: 'Tareas antes del viaje',
      strategic: 'Central Estratégica',
      strategicDesc: 'Enlaces e información esencial',
      guide: 'Guía Attica',
      guideDesc: 'Videos y tutoriales exclusivos',
      gallery: 'Galería',
      galleryDesc: 'Fotos y videos del destino',
      restaurants: 'Restaurantes',
      restaurantsDesc: 'Recomendaciones gastronómicas',
      photography: 'Fotografía',
      photographyDesc: 'Consejos para fotos increíbles',
      culture: 'Cultura',
      cultureDesc: 'Costumbres e información local',
      vocabulary: 'Vocabulario',
      vocabularyDesc: 'Palabras y frases esenciales',
      contract: 'Contrato',
      contractDesc: 'Documentos y acuerdos',
    },
    destination: 'Destino',
    date: 'Fecha',
    language: 'Idioma',
    currency: 'Moneda',
    voltage: 'Voltaje',
    timezone: 'Zona horaria',
    bestSeason: 'Mejor época',
  },
  packing: {
    title: 'Maleta Inteligente',
    noItems: 'Ningún artículo encontrado',
    packed: 'Marcar como no empacado',
    notPacked: 'Marcar como empacado',
    addItem: 'Agregar Artículo',
    itemName: 'Nombre del artículo',
    category: 'Categoría',
    quantity: 'Cantidad',
    notes: 'Notas',
    bag: 'Maleta',
    restricted: 'Qué No Llevar',
    noRestrictions: 'Sin restricciones registradas',
    noRestrictionsDesc: 'Ninguna restricción registrada para este destino.',
    allCategories: 'Todos',
    itemsReady: 'artículos listos',
    addItemModal: 'Agregar Artículo a la Maleta',
    categories: {
      clothing: 'Ropa',
      toiletries: 'Higiene',
      electronics: 'Electrónico',
      documents: 'Documento',
      health: 'Medicamento',
      accessories: 'Accesorio',
      other: 'Otro',
    },
  },
  checklist: {
    title: 'Checklist Pre-Viaje',
    noItems: 'Ninguna tarea aún',
    noItemsDesc: 'Agrega tareas de preparación para tu viaje.',
    completed: 'Marcar como pendiente',
    pending: 'Marcar como completado',
    addTask: 'Agregar Tarea',
    taskTitle: 'Título',
    section: 'Sección',
    sectionHint: 'déjalo en blanco para usar la primera existente',
    description: 'Descripción',
    deadline: 'Plazo',
    tasksCompleted: 'tareas completadas',
    addTaskModal: 'Agregar Tarea',
  },
  common: {
    loading: 'Cargando...',
    error: 'Error al cargar datos',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    back: 'Volver',
    noData: 'Sin datos',
    language: 'Idioma',
    changeLanguage: 'Cambiar idioma',
    optional: 'opcional',
    required: '*',
    of: 'de',
    days: 'días',
  },
  settings: {
    title: 'Configuración',
    languageSection: 'Idioma de la interfaz',
    profileSection: 'Datos personales',
    fullName: 'Nombre completo',
    phone: 'Teléfono',
    saved: '¡Guardado con éxito!',
    saving: 'Guardando...',
  },
  hero: {
    welcome: 'BIENVENIDO(A)',
    subtitle: 'Planificación exclusiva para una experiencia ligera, organizada y memorable.',
  },
}

const fr: Translations = {
  nav: {
    home: 'Accueil',
    overview: 'Aperçu',
    itinerary: 'Itinéraire',
    map: 'Carte',
    financial: 'Financier',
    documents: 'Documents',
    packing: 'Valise Intelligente',
    checklist: 'Checklist',
    strategic: 'Centre Stratégique',
    guide: 'Guide Attica',
    gallery: 'Galerie',
    restaurants: 'Restaurants',
    photography: 'Photographie',
    culture: 'Culture',
    vocabulary: 'Vocabulaire',
    contract: 'Contrat',
    logout: 'Déconnexion',
    currentTrip: 'Voyage actuel',
    selectTrip: 'Sélectionnez un voyage',
    settings: 'Paramètres',
  },
  dashboard: {
    welcome: 'Bonjour',
    welcomeSubtitle: 'Bienvenue dans votre Carnet de Voyage',
    yourTrips: 'Vos voyages',
    noTrips: 'Aucun voyage pour le moment',
    noTripsDesc: 'Votre consultante Attica préparera bientôt votre carnet de voyage personnalisé.',
    travelNotebook: 'Votre carnet de voyage',
    daysUntil: 'Jours restants',
    destinationInfo: 'Informations sur la destination',
    sections: {
      itinerary: 'Itinéraire',
      itineraryDesc: 'Jour par jour de votre voyage',
      financial: 'Financier',
      financialDesc: 'Suivi des dépenses et paiements',
      documents: 'Documents',
      documentsDesc: 'Passeports, visas et plus',
      packing: 'Valise Intelligente',
      packingDesc: 'Liste des articles à emporter',
      checklist: 'Checklist',
      checklistDesc: 'Tâches avant le voyage',
      strategic: 'Centre Stratégique',
      strategicDesc: 'Liens et infos essentielles',
      guide: 'Guide Attica',
      guideDesc: 'Vidéos et tutoriels exclusifs',
      gallery: 'Galerie',
      galleryDesc: 'Photos et vidéos de la destination',
      restaurants: 'Restaurants',
      restaurantsDesc: 'Recommandations gastronomiques',
      photography: 'Photographie',
      photographyDesc: 'Conseils pour des photos incroyables',
      culture: 'Culture',
      cultureDesc: 'Coutumes et informations locales',
      vocabulary: 'Vocabulaire',
      vocabularyDesc: 'Mots et phrases essentiels',
      contract: 'Contrat',
      contractDesc: 'Documents et accords',
    },
    destination: 'Destination',
    date: 'Date',
    language: 'Langue',
    currency: 'Devise',
    voltage: 'Tension',
    timezone: 'Fuseau horaire',
    bestSeason: 'Meilleure saison',
  },
  packing: {
    title: 'Valise Intelligente',
    noItems: 'Aucun article trouvé',
    packed: 'Marquer comme non emballé',
    notPacked: 'Marquer comme emballé',
    addItem: 'Ajouter un Article',
    itemName: "Nom de l'article",
    category: 'Catégorie',
    quantity: 'Quantité',
    notes: 'Notes',
    bag: 'Valise',
    restricted: 'Ce Qu\'il Ne Faut Pas Emporter',
    noRestrictions: 'Aucune restriction enregistrée',
    noRestrictionsDesc: 'Aucune restriction enregistrée pour cette destination.',
    allCategories: 'Tous',
    itemsReady: 'articles prêts',
    addItemModal: 'Ajouter un Article à la Valise',
    categories: {
      clothing: 'Vêtements',
      toiletries: 'Hygiène',
      electronics: 'Électronique',
      documents: 'Documents',
      health: 'Médicaments',
      accessories: 'Accessoires',
      other: 'Autre',
    },
  },
  checklist: {
    title: 'Checklist Pré-Voyage',
    noItems: 'Aucune tâche pour le moment',
    noItemsDesc: 'Ajoutez des tâches de préparation pour votre voyage.',
    completed: 'Marquer comme en attente',
    pending: 'Marquer comme terminé',
    addTask: 'Ajouter une Tâche',
    taskTitle: 'Titre',
    section: 'Section',
    sectionHint: 'laissez vide pour utiliser la première existante',
    description: 'Description',
    deadline: 'Échéance',
    tasksCompleted: 'tâches terminées',
    addTaskModal: 'Ajouter une Tâche',
  },
  common: {
    loading: 'Chargement...',
    error: 'Erreur lors du chargement',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    back: 'Retour',
    noData: 'Aucune donnée',
    language: 'Langue',
    changeLanguage: 'Changer de langue',
    optional: 'facultatif',
    required: '*',
    of: 'de',
    days: 'jours',
  },
  settings: {
    title: 'Paramètres',
    languageSection: 'Langue de l\'interface',
    profileSection: 'Informations personnelles',
    fullName: 'Nom complet',
    phone: 'Téléphone',
    saved: 'Enregistré avec succès !',
    saving: 'Enregistrement...',
  },
  hero: {
    welcome: 'BIENVENUE',
    subtitle: 'Planification exclusive pour une expérience légère, organisée et mémorable.',
  },
}

const it: Translations = {
  nav: {
    home: 'Home',
    overview: 'Panoramica',
    itinerary: 'Itinerario',
    map: 'Mappa',
    financial: 'Finanziario',
    documents: 'Documenti',
    packing: 'Valigia Intelligente',
    checklist: 'Checklist',
    strategic: 'Centro Strategico',
    guide: 'Guida Attica',
    gallery: 'Galleria',
    restaurants: 'Ristoranti',
    photography: 'Fotografia',
    culture: 'Cultura',
    vocabulary: 'Vocabolario',
    contract: 'Contratto',
    logout: 'Esci',
    currentTrip: 'Viaggio attuale',
    selectTrip: 'Seleziona un viaggio',
    settings: 'Impostazioni',
  },
  dashboard: {
    welcome: 'Ciao',
    welcomeSubtitle: 'Benvenuto/a nel tuo Quaderno di Viaggio',
    yourTrips: 'I tuoi viaggi',
    noTrips: 'Nessun viaggio ancora',
    noTripsDesc: 'La tua consulente Attica preparerà presto il tuo quaderno di viaggio personalizzato.',
    travelNotebook: 'Il tuo quaderno di viaggio',
    daysUntil: 'Giorni mancanti',
    destinationInfo: 'Informazioni sulla destinazione',
    sections: {
      itinerary: 'Itinerario',
      itineraryDesc: 'Giorno per giorno del tuo viaggio',
      financial: 'Finanziario',
      financialDesc: 'Controllo spese e pagamenti',
      documents: 'Documenti',
      documentsDesc: 'Passaporti, visti e altro',
      packing: 'Valigia Intelligente',
      packingDesc: 'Lista degli articoli da imballare',
      checklist: 'Checklist',
      checklistDesc: 'Attività prima del viaggio',
      strategic: 'Centro Strategico',
      strategicDesc: 'Link e informazioni essenziali',
      guide: 'Guida Attica',
      guideDesc: 'Video e tutorial esclusivi',
      gallery: 'Galleria',
      galleryDesc: 'Foto e video della destinazione',
      restaurants: 'Ristoranti',
      restaurantsDesc: 'Raccomandazioni gastronomiche',
      photography: 'Fotografia',
      photographyDesc: 'Consigli per foto incredibili',
      culture: 'Cultura',
      cultureDesc: 'Usanze e informazioni locali',
      vocabulary: 'Vocabolario',
      vocabularyDesc: 'Parole e frasi essenziali',
      contract: 'Contratto',
      contractDesc: 'Documenti e accordi',
    },
    destination: 'Destinazione',
    date: 'Data',
    language: 'Lingua',
    currency: 'Valuta',
    voltage: 'Tensione',
    timezone: 'Fuso orario',
    bestSeason: 'Stagione migliore',
  },
  packing: {
    title: 'Valigia Intelligente',
    noItems: 'Nessun articolo trovato',
    packed: 'Segna come non imballato',
    notPacked: 'Segna come imballato',
    addItem: 'Aggiungi Articolo',
    itemName: "Nome dell'articolo",
    category: 'Categoria',
    quantity: 'Quantità',
    notes: 'Note',
    bag: 'Valigia',
    restricted: 'Cosa Non Portare',
    noRestrictions: 'Nessuna restrizione registrata',
    noRestrictionsDesc: 'Nessuna restrizione registrata per questa destinazione.',
    allCategories: 'Tutti',
    itemsReady: 'articoli pronti',
    addItemModal: 'Aggiungi Articolo alla Valigia',
    categories: {
      clothing: 'Abbigliamento',
      toiletries: 'Igiene',
      electronics: 'Elettronica',
      documents: 'Documenti',
      health: 'Medicinali',
      accessories: 'Accessori',
      other: 'Altro',
    },
  },
  checklist: {
    title: 'Checklist Pre-Viaggio',
    noItems: 'Nessuna attività ancora',
    noItemsDesc: 'Aggiungi attività di preparazione per il tuo viaggio.',
    completed: 'Segna come in sospeso',
    pending: 'Segna come completato',
    addTask: 'Aggiungi Attività',
    taskTitle: 'Titolo',
    section: 'Sezione',
    sectionHint: 'lascia vuoto per usare la prima esistente',
    description: 'Descrizione',
    deadline: 'Scadenza',
    tasksCompleted: 'attività completate',
    addTaskModal: 'Aggiungi Attività',
  },
  common: {
    loading: 'Caricamento...',
    error: 'Errore nel caricamento dei dati',
    save: 'Salva',
    cancel: 'Annulla',
    edit: 'Modifica',
    delete: 'Elimina',
    back: 'Indietro',
    noData: 'Nessun dato',
    language: 'Lingua',
    changeLanguage: 'Cambia lingua',
    optional: 'facoltativo',
    required: '*',
    of: 'di',
    days: 'giorni',
  },
  settings: {
    title: 'Impostazioni',
    languageSection: "Lingua dell'interfaccia",
    profileSection: 'Dati personali',
    fullName: 'Nome completo',
    phone: 'Telefono',
    saved: 'Salvato con successo!',
    saving: 'Salvataggio...',
  },
  hero: {
    welcome: 'BENVENUTO/A',
    subtitle: 'Pianificazione esclusiva per un\'esperienza leggera, organizzata e memorabile.',
  },
}

export const translations: Record<Language, Translations> = {
  'pt-BR': ptBR,
  en,
  es,
  fr,
  it,
}

export const LANGUAGES = [
  { code: 'pt-BR' as Language, label: 'PT', flag: '🇧🇷' },
  { code: 'en' as Language, label: 'EN', flag: '🇺🇸' },
  { code: 'es' as Language, label: 'ES', flag: '🇪🇸' },
  { code: 'fr' as Language, label: 'FR', flag: '🇫🇷' },
  { code: 'it' as Language, label: 'IT', flag: '🇮🇹' },
]
