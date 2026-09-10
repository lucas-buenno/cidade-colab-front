export const messages = {
  appName: "Cidade Colab",
  appTagline:
    "Registre ocorrências urbanas, compartilhe com a comunidade e acompanhe o que acontece na sua cidade.",
  skipToContent: "Ir para o conteúdo",

  theme: {
    toggleTo: {
      light: "Alternar para modo claro",
      dark: "Alternar para modo escuro",
      system: "Usar tema automático do sistema",
    },
  },

  profile: {
    open: "Abrir perfil",
    subtitle: "Sua conta nesta comunidade.",
    backToFeed: "Voltar ao feed",
    logout: "Sair",
  },

  login: {
    title: "Entrar",
    subtitle: "Acesse sua conta para registrar e apoiar ocorrências.",
    submit: "Entrar",
    submitting: "Entrando…",
    noAccount: "Ainda não tem conta?",
    goToRegister: "Criar conta",
  },

  register: {
    title: "Criar conta",
    subtitle: "Leva menos de um minuto. Depois você já entra automaticamente.",
    submit: "Criar conta",
    submitting: "Criando conta…",
    signingIn: "Conta criada. Entrando…",
    hasAccount: "Já tem uma conta?",
    goToLogin: "Entrar",
    success: "Conta criada com sucesso",
    createdButLoginFailed:
      "Conta criada, mas não foi possível entrar automaticamente. Tente fazer login.",
  },

  fields: {
    username: "Nome de usuário",
    email: "E-mail",
    password: "Senha",
    confirmPassword: "Confirmar senha",
  },

  placeholders: {
    username: "seu.usuario",
    email: "voce@email.com",
  },

  validation: {
    required: "Este campo é obrigatório",
    email: "Informe um e-mail válido",
    passwordMin: "A senha deve ter no mínimo 8 caracteres",
    passwordMismatch: "As senhas não coincidem",
  },

  password: {
    show: "Mostrar senha",
    hide: "Ocultar senha",
    strengthLabel: "Força da senha",
    weak: "Fraca",
    medium: "Média",
    strong: "Forte",
    hint: "Use pelo menos 8 caracteres. Letras, números e símbolos deixam a senha mais forte.",
  },

  errors: {
    summaryTitle: "Há um problema no formulário",
    invalidCredentials: "Usuário ou senha inválidos",
    validationGeneric: "Revise os dados informados e tente novamente.",
    conflictUsername: "Este nome de usuário já está em uso",
    conflictEmail: "Este e-mail já está em uso",
    conflictGeneric:
      "Não foi possível criar a conta com estes dados. Tente outro nome de usuário ou e-mail.",
    unavailable: "O serviço está temporariamente indisponível. Tente novamente.",
    timeout: "Tempo esgotado. Tente novamente.",
    offline: "Sem conexão com a internet. Verifique sua rede e tente novamente.",
    network: "Não foi possível conectar ao servidor. Tente novamente.",
    unexpected: "Não foi possível concluir. Tente novamente.",
    unchangedAfterError:
      "Altere os dados do formulário antes de enviar novamente.",
    forbidden: "Você não tem permissão para publicar ocorrências.",
    notFound: "Ocorrência não encontrada.",
  },

  actions: {
    retry: "Tentar novamente",
    retryWhenOnline: "Tentar novamente quando estiver online",
  },

  feed: {
    title: "Feed",
    guestHint: "Entre para registrar ocorrências e apoiar a comunidade.",
    signedInHint: "Você está autenticado. Veja abaixo as ocorrências da cidade.",
    empty: "Nenhuma ocorrência encontrada ainda.",
    endOfList: "Você chegou ao fim do feed",
    support: {
      loginTooltip: "Entre para apoiar esta ocorrência",
      noPermissionTooltip: "Você não tem permissão para apoiar",
      supportLabel: "Apoiar ocorrência",
      unsupportLabel: "Remover apoio",
    },
    createCta: "Registrar ocorrência",
    loginToCreate: "Entre para registrar uma ocorrência",
  },

  create: {
    title: "Nova ocorrência",
    subtitle: "Descreva o problema, anexe uma foto e marque o local.",
    backToFeed: "Voltar ao feed",
    selectCategory: "Selecionar categoria",
    selectCategoryAria: "Selecionar categorias da ocorrência",
    searchCategory: "Buscar categoria",
    noCategories: "Nenhuma categoria encontrada.",
    categoriesLoading: "Carregando categorias…",
    addTags: "Adicionar tags",
    removeCategory: "Remover categoria",
    drafts: "Rascunhos",
    draftSaved: "Rascunho salvo",
    draftLoaded: "Rascunho carregado",
    noDraft: "Nenhum rascunho salvo",
    fieldTitle: "Título",
    titlePlaceholder: "Resumo da ocorrência",
    descriptionLabel: "Descrição",
    descriptionPlaceholder: "Descreva o problema (obrigatório)",
    descriptionRequired: "Descreva o problema para publicar.",
    categoryRequired: "Selecione pelo menos uma categoria.",
    streetRequired: "Informe a rua.",
    neighborhoodRequired: "Informe o bairro.",
    coordinatesRequired: "Marque o local no mapa.",
    imageLabel: "Foto da ocorrência",
    imageHint: "JPEG, PNG, WEBP, HEIC, HEIF, GIF ou BMP. Máximo 10 MB.",
    imageDrop: "Arraste uma imagem ou clique para selecionar",
    imageChange: "Trocar foto",
    imageRemove: "Remover foto",
    imageRequired: "Envie uma foto da ocorrência.",
    imageEmpty: "O arquivo selecionado está vazio.",
    imageTooLarge: "A imagem deve ter no máximo 10 MB.",
    imageTypeInvalid: "Tipo de arquivo não suportado. Use JPEG, PNG, WEBP, HEIC, HEIF, GIF ou BMP.",
    imageUploading: "Enviando foto…",
    imageUploaded: "Foto enviada",
    imagePreviewUnavailable: "Pré-visualização indisponível. A foto será enviada normalmente.",
    locationLabel: "Localização",
    locationName: "Nome do local",
    locationNameHint: "Preenchido automaticamente com o endereço.",
    reference: "Ponto de referência",
    referencePlaceholder: "Ex.: próximo ao mercado X",
    street: "Rua",
    number: "Número",
    neighborhood: "Bairro",
    postalCode: "CEP",
    mapHint: "Clique no mapa para marcar o ponto.",
    useMyLocation: "Usar minha localização",
    locating: "Obtendo localização…",
    fillingAddress: "Preenchendo endereço…",
    enterAddressManually: "Inserir endereço manualmente",
    hideAddressForm: "Ocultar endereço",
    geoDenied: "Não foi possível obter sua localização. Marque o ponto no mapa.",
    reverseGeoFailed:
      "Local marcado. Abra o endereço manual se quiser complementar os dados.",
    saveDraft: "Salvar rascunho",
    publish: "Postar",
    publishing: "Publicando…",
    noPermissionBanner:
      "Sua conta está autenticada, mas ainda não pode publicar ocorrências.",
    forbiddenTitle: "Acesso não permitido",
    forbiddenBody:
      "Você está logado, mas não tem permissão para criar ocorrências. Entre em contato com a administração se isso for um engano.",
    forbiddenClose: "Entendi",
    imageProgress: "Progresso do envio da imagem",
  },

  detail: {
    backToFeed: "Voltar ao feed",
    notFoundTitle: "Ocorrência não encontrada",
    notFoundBody: "Ela pode ter sido removida ou o endereço está incorreto.",
    location: "Local",
  },
} as const;

export type Messages = typeof messages;
