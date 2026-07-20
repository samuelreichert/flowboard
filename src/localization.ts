import type { CardPriority } from './types';

const LANGUAGE_PREFERENCES = ['system', 'en', 'pt-BR'] as const;
const RESOLVED_LANGUAGES = ['en', 'pt-BR'] as const;

export type LanguagePreference = (typeof LANGUAGE_PREFERENCES)[number];
export type ResolvedLanguage = (typeof RESOLVED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = 'flowboardLanguagePreference';

export const DEFAULT_LANGUAGE_PREFERENCE: LanguagePreference = 'system';
export const DEFAULT_RESOLVED_LANGUAGE: ResolvedLanguage = 'en';

export const isLanguagePreference = (
  value: unknown
): value is LanguagePreference =>
  typeof value === 'string' &&
  LANGUAGE_PREFERENCES.includes(value as LanguagePreference);

export const isResolvedLanguage = (value: unknown): value is ResolvedLanguage =>
  typeof value === 'string' &&
  RESOLVED_LANGUAGES.includes(value as ResolvedLanguage);

const normalizeLanguageTag = (value: string) => value.trim().toLowerCase();

export const resolveBrowserLanguage = (
  languages: readonly string[] = getBrowserLanguages()
): ResolvedLanguage => {
  for (const language of languages) {
    const normalizedLanguage = normalizeLanguageTag(language);

    if (normalizedLanguage === 'en' || normalizedLanguage.startsWith('en-')) {
      return 'en';
    }

    if (
      normalizedLanguage === 'pt' ||
      normalizedLanguage === 'pt-br' ||
      normalizedLanguage.startsWith('pt-')
    ) {
      return 'pt-BR';
    }
  }

  return DEFAULT_RESOLVED_LANGUAGE;
};

export const getBrowserLanguages = (): readonly string[] => {
  if (typeof navigator === 'undefined') {
    return [];
  }

  const languages = Array.isArray(navigator.languages)
    ? navigator.languages.filter(Boolean)
    : [];

  if (languages.length > 0) {
    return languages;
  }

  return navigator.language ? [navigator.language] : [];
};

export const resolveLanguagePreference = (
  preference: LanguagePreference,
  browserLanguage: ResolvedLanguage = resolveBrowserLanguage()
): ResolvedLanguage => (preference === 'system' ? browserLanguage : preference);

export const fetchLanguagePreference = (): LanguagePreference => {
  try {
    const value = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguagePreference(value) ? value : DEFAULT_LANGUAGE_PREFERENCE;
  } catch {
    return DEFAULT_LANGUAGE_PREFERENCE;
  }
};

export const updateLanguagePreference = (preference: LanguagePreference) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, preference);
  } catch {
    // The app remains usable if browser storage is unavailable.
  }
};

const enMessages = {
  app: {
    auth: {
      ariaLabel: 'Sign in to Flowboard',
      checkingSession: 'Checking your session...',
      description:
        'Continue with your account. If you are new, Flowboard will create one for you.',
      divider: 'or',
      email: 'Email',
      opening: 'Opening...',
      openingBoard: 'Opening your board...',
      openingFlowboardLabel: 'Opening Flowboard',
      sendMagicLink: 'Send magic link',
      sending: 'Sending...',
      signIn: 'Sign in',
      socialOptionsLabel: 'Social sign-in options',
      appleDisabledReason:
        'Apple sign-in needs Apple Developer and production redirect setup first.',
      continueWith: (provider: string) => `Continue with ${provider}`,
      magicLinkFailure: 'Unable to send a sign-in link right now.',
      magicLinkSuccess: 'Check your email for a sign-in link.',
      socialFailure: (provider: string) =>
        `Unable to start ${provider} sign-in right now.`,
      socialOpening: (provider: string) => `Opening ${provider} sign-in...`,
    },
    navigation: {
      board: 'Board',
      closeNavigation: 'Close navigation',
      collapseSidebar: 'Collapse sidebar',
      columns: 'Columns',
      expandSidebar: 'Expand sidebar',
      flowboardNavigation: 'Flowboard navigation',
      history: 'History',
      manageColumns: 'Manage columns',
      manageTags: 'Manage tags',
      openAccountMenu: 'Open account menu',
      openNavigation: 'Open navigation',
      primaryNavigation: 'Primary navigation',
      settings: 'Settings',
      signOut: 'Log out',
      tags: 'Tags',
    },
    notFound: {
      ariaLabel: 'Route not found',
      body: 'The link points to a Flowboard route that does not exist anymore.',
      eyebrow: 'Page not found',
      openBoard: 'Open board',
      title: 'That page is off the board',
      viewHistory: 'View history',
    },
    persistence: {
      loadingLocalBoard: 'Loading local board...',
      localDatabaseUnavailable:
        'Local database is unavailable. Changes are not durably saved yet.',
      loadingBoard: 'Loading your board...',
      importingBoard: 'Importing your local board...',
      boardUnavailable:
        'Your cloud board is unavailable. Check your connection and try again.',
      profileUnavailable: 'Your profile is unavailable. Try again in a moment.',
      saving: 'Saving...',
      unsaved:
        'Changes are not durably saved yet. Check your connection and try again.',
      profileSaveFailure: 'Unable to save profile.',
    },
    workspace: {
      boardAriaLabel: 'Flowboard board',
      boardWorkspace: 'Board workspace',
      completeWork: 'Complete work',
      completedWork: 'Completed work',
      completeWorkNeedsCards:
        'Add cards to the completed column before completing work',
      completeWorkNeedsColumn:
        'Choose a completed column in settings before completing work',
      history: 'History',
      workCompleted: 'Work completed',
      workspace: 'Workspace',
    },
  },
  board: {
    addAnotherColumn: 'Add another column',
    addColumn: 'Add column',
    addColumnDescription: 'Give the next stage of your workflow a clear name.',
    cardNotFound: 'Card not found.',
    columnActions: (columnTitle: string) =>
      `Open ${columnTitle} column actions`,
    columnTitle: 'Column title',
    columnTitleRequired: 'Enter a column title.',
    columnTitlesUnique: 'Column titles must be unique.',
    closeColumnManager: 'Close column manager',
    deleteColumn: 'Delete column',
    deleteColumnAction: (columnTitle: string) => `Delete ${columnTitle} column`,
    deleteColumnDescription: (cardCount: number, columnTitle: string) =>
      `This will permanently delete ${cardCount} ${cardCount === 1 ? 'card' : 'cards'} in ${columnTitle}.`,
    deleteColumnTitle: 'Delete this column?',
    dropCardHere: 'Drop card here',
    emptyColumnManager: 'Create a column before arranging this board.',
    manageColumns: 'Manage columns',
    manageColumnsDescription: 'Reorder and edit the columns on this board.',
    moveColumnDown: (columnTitle: string) => `Move ${columnTitle} down`,
    moveColumnToBottom: (columnTitle: string) =>
      `Move ${columnTitle} to bottom`,
    moveColumnToTop: (columnTitle: string) => `Move ${columnTitle} to top`,
    moveColumnUp: (columnTitle: string) => `Move ${columnTitle} up`,
    readyForReview: 'Ready for review',
    renameColumn: 'Rename column',
    renameColumnAction: (columnTitle: string) => `Rename ${columnTitle} column`,
    renameColumnDescription: 'Choose a clear name for this workflow stage.',
    cardCount: (cardCount: number) =>
      `${cardCount} ${cardCount === 1 ? 'card' : 'cards'}`,
  },
  card: {
    card: 'Card',
    cardTitle: 'Card title',
    closeCard: 'Close card',
    column: 'Column',
    content: 'Content',
    created: (date: string) => `Created ${date}`,
    deleteCard: 'Delete card',
    deleteDescription: (cardTitle: string) =>
      `This will permanently delete ${cardTitle}.`,
    deleteTitle: 'Delete this card?',
    editCardTitle: 'Edit card title',
    hasContent: 'Has content',
    loadingEditor: 'Loading editor...',
    noTags: 'No tags',
    openCard: (cardTitle: string) => `Open ${cardTitle}`,
    priority: 'Priority',
    tagNamesUnique: 'Tag names must be unique.',
    tagNameRequired: 'Enter a tag name.',
    tags: 'Tags',
    thisCard: 'this card',
    titleRequired: 'Enter a card title.',
    untitledCard: 'Untitled card',
  },
  common: {
    cancel: 'Cancel',
    chooseColumn: 'Choose column',
    choosePriority: 'Choose priority',
    copied: 'Copied',
    done: 'Done',
    loadMore: 'Load more',
    save: 'Save',
    saving: 'Saving...',
  },
  composer: {
    addCard: 'Add card',
    addColumnBeforeCapturing: 'Add a column before capturing cards.',
    addColumnBeforeCapturingPlaceholder: 'Add a column before capturing cards',
    addColumnFirst: 'Add column first',
    ariaLabel: 'Card composer',
    captureCard: 'Capture a card...',
    createTag: 'Create tag',
    destinationColumn: 'Destination column',
    newCard: 'New card',
    newTagName: 'New tag name',
    noTagsYet: 'No tags yet',
  },
  contentEditor: {
    alignCenter: 'Align center',
    alignLeft: 'Align left',
    alignRight: 'Align right',
    apply: 'Apply',
    applyAssetEdit: (assetLabel: string) => `Apply ${assetLabel} edit`,
    bold: 'Bold',
    bulletList: 'Bullet list',
    cancelAssetEdit: (assetLabel: string) => `Cancel ${assetLabel} edit`,
    codeBlock: 'Code block',
    contentFormatting: 'Content formatting',
    copyMarkdown: 'Copy Markdown',
    editAsset: (assetLabel: string) => `Edit ${assetLabel}`,
    heading1: 'Heading 1',
    heading2: 'Heading 2',
    heading3: 'Heading 3',
    heading4: 'Heading 4',
    image: 'Image',
    imageUrl: 'Image URL',
    imageUrlRequired: 'Enter an image URL.',
    inlineCode: 'Inline code',
    insert: 'Insert',
    insertImageUrl: 'Insert image URL',
    italic: 'Italic',
    justify: 'Justify',
    link: 'Link',
    linkUrl: 'Link URL',
    secureImageUrlRequired: 'Enter a secure HTTPS image URL.',
    secureLinkRequired: 'Enter a secure HTTPS or mailto link.',
    listStyle: 'List style',
    openAsset: (assetLabel: string) => `Open ${assetLabel}`,
    orderedList: 'Ordered list',
    paragraph: 'Paragraph',
    quote: 'Quote',
    redo: 'Redo',
    removeAsset: (assetLabel: string) => `Remove ${assetLabel}`,
    strike: 'Strike',
    taskList: 'Task list',
    taskCheckboxLabel: (checked: boolean, text: string) =>
      `${checked ? 'Completed' : 'Incomplete'} task: ${text || 'empty task item'}`,
    textAlignment: 'Text alignment',
    textStyle: 'Text style',
    undo: 'Undo',
  },
  history: {
    archived: (date: string) => `Archived ${date}`,
    archivedCard: 'Archived card',
    archivedCardNotFound: 'Archived card not found.',
    archivedCardNotFoundTitle: 'Archived card not found',
    archivedCardNotFoundBody:
      'This history link does not match a completed work card.',
    archivedCardNoContent: 'This archived card has no content.',
    closeArchivedCard: 'Close archived card',
    completedHistory: 'Completed work history',
    completedWithoutCards: 'Completed without archived cards.',
    copyMarkdown: 'Copy Markdown',
    created: (date: string) => `Created ${date}`,
    grid: 'Grid',
    gridView: 'Grid view',
    historyLayout: 'History layout',
    list: 'List',
    listView: 'List view',
    noCompletedWorkBody:
      'Complete work from the board to start building your history.',
    noCompletedWorkTitle: 'No completed work yet',
    workCycle: 'Work cycle',
    cardCount: (count: number) => `${count} ${count === 1 ? 'card' : 'cards'}`,
  },
  language: {
    english: 'English',
    portugueseBrazil: 'Português (Brasil)',
    preferenceLabel: 'Language preference',
    title: 'Language',
    useLanguage: (language: string) => `Use ${language}`,
    browserOption: (language: string) => `Browser language (${language})`,
    languageName: {
      en: 'English',
      'pt-BR': 'Português (Brasil)',
    },
  },
  priority: {
    high: 'High',
    low: 'Low',
    medium: 'Medium',
  } satisfies Record<CardPriority, string>,
  profile: {
    chooseImage: 'Choose profile image',
    closeProfile: 'Close profile',
    displayName: 'Display name',
    editProfile: 'Edit profile',
    email: 'Email',
    imageFile: 'Profile image file',
    removeImage: 'Remove image',
    hint: 'Your profile helps identify your Flowboard workspace.',
  },
  settings: {
    appearance: 'Appearance',
    board: 'Board',
    clearBoard: 'Clear board',
    clearBoardAriaLabel: 'Clear board',
    clearBoardDescription:
      'Permanently delete all columns and cards from this board.',
    closeSettings: 'Close settings',
    completedColumn: 'Completed column',
    createColumnBeforeCompleted:
      'Create a column before choosing where completed work lives.',
    noCompletedColumn: 'No completed column',
    chooseCompletedColumn: 'Choose completed column',
    themePreference: 'Theme preference',
    title: 'Settings',
  },
  confirmations: {
    clearBoardConfirm: 'Clear board',
    clearBoardDescription: (columnCount: number) =>
      `This will permanently delete ${columnCount} ${columnCount === 1 ? 'column' : 'columns'} and all of their cards.`,
    clearBoardTitle: 'Clear this board?',
    completeWorkConfirm: 'Complete work',
    completeWorkDescription: (
      cardCount: number,
      completedColumnTitle: string
    ) =>
      `This will archive ${cardCount} ${cardCount === 1 ? 'card' : 'cards'} from ${completedColumnTitle} and start a new work cycle.`,
    completeWorkTitle: 'Complete work?',
  },
  tagManager: {
    close: 'Close tag manager',
    createDescription: 'Create reusable tags for cards on this board.',
    editTag: (tagName: string) => `Edit ${tagName} tag`,
    manageTags: 'Manage tags',
    newTag: 'New tag',
    noTagsYet: 'No tags yet.',
    removeTag: 'Remove tag',
    removeTagAction: (tagName: string) => `Remove ${tagName} tag`,
    removeTagDescription: (tagName: string, count: number) =>
      `${tagName} is assigned to ${count} ${count === 1 ? 'card' : 'cards'}. Removing it will clear the tag from ${count === 1 ? 'that card' : 'those cards'}.`,
    removeTagTitle: 'Remove this tag?',
    renameTag: (tagName: string) => `Rename ${tagName} tag`,
    usage: (count: number) => `${count} ${count === 1 ? 'card' : 'cards'}`,
  },
  theme: {
    dark: 'Dark',
    light: 'Light',
    system: 'System',
    useTheme: (theme: string) => `Use ${theme.toLowerCase()} theme`,
  },
};

export type Messages = typeof enMessages;

const ptBrMessages: Messages = {
  app: {
    auth: {
      ariaLabel: 'Entrar no Flowboard',
      checkingSession: 'Verificando sua sessão...',
      description:
        'Continue com sua conta. Se você for novo por aqui, o Flowboard criará uma conta para você.',
      divider: 'ou',
      email: 'E-mail',
      opening: 'Abrindo...',
      openingBoard: 'Abrindo seu quadro...',
      openingFlowboardLabel: 'Abrindo o Flowboard',
      sendMagicLink: 'Enviar link mágico',
      sending: 'Enviando...',
      signIn: 'Entrar',
      socialOptionsLabel: 'Opções de login social',
      appleDisabledReason:
        'O login com Apple precisa de configuração do Apple Developer e redirecionamento de produção primeiro.',
      continueWith: (provider) => `Continuar com ${provider}`,
      magicLinkFailure: 'Não foi possível enviar um link de acesso agora.',
      magicLinkSuccess: 'Confira seu e-mail para acessar pelo link.',
      socialFailure: (provider) =>
        `Não foi possível iniciar o login com ${provider} agora.`,
      socialOpening: (provider) => `Abrindo login com ${provider}...`,
    },
    navigation: {
      board: 'Quadro',
      closeNavigation: 'Fechar navegação',
      collapseSidebar: 'Recolher barra lateral',
      columns: 'Colunas',
      expandSidebar: 'Expandir barra lateral',
      flowboardNavigation: 'Navegação do Flowboard',
      history: 'Histórico',
      manageColumns: 'Gerenciar colunas',
      manageTags: 'Gerenciar tags',
      openAccountMenu: 'Abrir menu da conta',
      openNavigation: 'Abrir navegação',
      primaryNavigation: 'Navegação principal',
      settings: 'Configurações',
      signOut: 'Sair',
      tags: 'Tags',
    },
    notFound: {
      ariaLabel: 'Rota não encontrada',
      body: 'O link aponta para uma rota do Flowboard que não existe mais.',
      eyebrow: 'Página não encontrada',
      openBoard: 'Abrir quadro',
      title: 'Essa página saiu do quadro',
      viewHistory: 'Ver histórico',
    },
    persistence: {
      loadingLocalBoard: 'Carregando quadro local...',
      localDatabaseUnavailable:
        'O banco de dados local está indisponível. As alterações ainda não foram salvas de forma durável.',
      loadingBoard: 'Carregando seu quadro...',
      importingBoard: 'Importando seu quadro local...',
      boardUnavailable:
        'Seu quadro na nuvem está indisponível. Verifique sua conexão e tente novamente.',
      profileUnavailable:
        'Seu perfil está indisponível. Tente novamente em instantes.',
      saving: 'Salvando...',
      unsaved:
        'As alterações ainda não foram salvas de forma durável. Verifique sua conexão e tente novamente.',
      profileSaveFailure: 'Não foi possível salvar o perfil.',
    },
    workspace: {
      boardAriaLabel: 'Quadro do Flowboard',
      boardWorkspace: 'Área do quadro',
      completeWork: 'Concluir trabalho',
      completedWork: 'Trabalho concluído',
      completeWorkNeedsCards:
        'Adicione cartões à coluna concluída antes de concluir o trabalho',
      completeWorkNeedsColumn:
        'Escolha uma coluna concluída nas configurações antes de concluir o trabalho',
      history: 'Histórico',
      workCompleted: 'Trabalho concluído',
      workspace: 'Área de trabalho',
    },
  },
  board: {
    addAnotherColumn: 'Adicionar outra coluna',
    addColumn: 'Adicionar coluna',
    addColumnDescription: 'Dê um nome claro para a próxima etapa do seu fluxo.',
    cardNotFound: 'Cartão não encontrado.',
    columnActions: (columnTitle) => `Abrir ações da coluna ${columnTitle}`,
    columnTitle: 'Título da coluna',
    columnTitleRequired: 'Digite um título para a coluna.',
    columnTitlesUnique: 'Os títulos das colunas devem ser únicos.',
    closeColumnManager: 'Fechar gerenciador de colunas',
    deleteColumn: 'Excluir coluna',
    deleteColumnAction: (columnTitle) => `Excluir coluna ${columnTitle}`,
    deleteColumnDescription: (cardCount, columnTitle) =>
      `Isso excluirá permanentemente ${cardCount} ${cardCount === 1 ? 'cartão' : 'cartões'} em ${columnTitle}.`,
    deleteColumnTitle: 'Excluir esta coluna?',
    dropCardHere: 'Solte o cartão aqui',
    emptyColumnManager: 'Crie uma coluna antes de organizar este quadro.',
    manageColumns: 'Gerenciar colunas',
    manageColumnsDescription: 'Reordene e edite as colunas deste quadro.',
    moveColumnDown: (columnTitle) => `Mover ${columnTitle} para baixo`,
    moveColumnToBottom: (columnTitle) => `Mover ${columnTitle} para o final`,
    moveColumnToTop: (columnTitle) => `Mover ${columnTitle} para o início`,
    moveColumnUp: (columnTitle) => `Mover ${columnTitle} para cima`,
    readyForReview: 'Pronto para revisão',
    renameColumn: 'Renomear coluna',
    renameColumnAction: (columnTitle) => `Renomear coluna ${columnTitle}`,
    renameColumnDescription: 'Escolha um nome claro para esta etapa do fluxo.',
    cardCount: (cardCount) =>
      `${cardCount} ${cardCount === 1 ? 'cartão' : 'cartões'}`,
  },
  card: {
    card: 'Cartão',
    cardTitle: 'Título do cartão',
    closeCard: 'Fechar cartão',
    column: 'Coluna',
    content: 'Conteúdo',
    created: (date) => `Criado em ${date}`,
    deleteCard: 'Excluir cartão',
    deleteDescription: (cardTitle) =>
      `Isso excluirá permanentemente ${cardTitle}.`,
    deleteTitle: 'Excluir este cartão?',
    editCardTitle: 'Editar título do cartão',
    hasContent: 'Tem conteúdo',
    loadingEditor: 'Carregando editor...',
    noTags: 'Sem tags',
    openCard: (cardTitle) => `Abrir ${cardTitle}`,
    priority: 'Prioridade',
    tagNamesUnique: 'Os nomes das tags devem ser únicos.',
    tagNameRequired: 'Digite um nome para a tag.',
    tags: 'Tags',
    thisCard: 'este cartão',
    titleRequired: 'Digite um título para o cartão.',
    untitledCard: 'Cartão sem título',
  },
  common: {
    cancel: 'Cancelar',
    chooseColumn: 'Escolha uma coluna',
    choosePriority: 'Escolha uma prioridade',
    copied: 'Copiado',
    done: 'Concluído',
    loadMore: 'Carregar mais',
    save: 'Salvar',
    saving: 'Salvando...',
  },
  composer: {
    addCard: 'Adicionar cartão',
    addColumnBeforeCapturing: 'Adicione uma coluna antes de capturar cartões.',
    addColumnBeforeCapturingPlaceholder:
      'Adicione uma coluna antes de capturar cartões',
    addColumnFirst: 'Adicione uma coluna primeiro',
    ariaLabel: 'Compositor de cartão',
    captureCard: 'Capture um cartão...',
    createTag: 'Criar tag',
    destinationColumn: 'Coluna de destino',
    newCard: 'Novo cartão',
    newTagName: 'Nome da nova tag',
    noTagsYet: 'Ainda não há tags',
  },
  contentEditor: {
    alignCenter: 'Alinhar ao centro',
    alignLeft: 'Alinhar à esquerda',
    alignRight: 'Alinhar à direita',
    apply: 'Aplicar',
    applyAssetEdit: (assetLabel) => `Aplicar edição de ${assetLabel}`,
    bold: 'Negrito',
    bulletList: 'Lista com marcadores',
    cancelAssetEdit: (assetLabel) => `Cancelar edição de ${assetLabel}`,
    codeBlock: 'Bloco de código',
    contentFormatting: 'Formatação do conteúdo',
    copyMarkdown: 'Copiar Markdown',
    editAsset: (assetLabel) => `Editar ${assetLabel}`,
    heading1: 'Título 1',
    heading2: 'Título 2',
    heading3: 'Título 3',
    heading4: 'Título 4',
    image: 'Imagem',
    imageUrl: 'URL da imagem',
    imageUrlRequired: 'Digite uma URL de imagem.',
    inlineCode: 'Código inline',
    insert: 'Inserir',
    insertImageUrl: 'Inserir URL da imagem',
    italic: 'Itálico',
    justify: 'Justificar',
    link: 'Link',
    linkUrl: 'URL do link',
    secureImageUrlRequired: 'Digite uma URL de imagem HTTPS segura.',
    secureLinkRequired: 'Digite um link HTTPS ou mailto seguro.',
    listStyle: 'Estilo de lista',
    openAsset: (assetLabel) => `Abrir ${assetLabel}`,
    orderedList: 'Lista numerada',
    paragraph: 'Parágrafo',
    quote: 'Citação',
    redo: 'Refazer',
    removeAsset: (assetLabel) => `Remover ${assetLabel}`,
    strike: 'Riscado',
    taskList: 'Lista de tarefas',
    taskCheckboxLabel: (checked, text) =>
      `${checked ? 'Tarefa concluída' : 'Tarefa incompleta'}: ${text || 'item de tarefa vazio'}`,
    textAlignment: 'Alinhamento do texto',
    textStyle: 'Estilo do texto',
    undo: 'Desfazer',
  },
  history: {
    archived: (date) => `Arquivado em ${date}`,
    archivedCard: 'Cartão arquivado',
    archivedCardNotFound: 'Cartão arquivado não encontrado.',
    archivedCardNotFoundTitle: 'Cartão arquivado não encontrado',
    archivedCardNotFoundBody:
      'Este link do histórico não corresponde a um cartão concluído.',
    archivedCardNoContent: 'Este cartão arquivado não tem conteúdo.',
    closeArchivedCard: 'Fechar cartão arquivado',
    completedHistory: 'Histórico de trabalho concluído',
    completedWithoutCards: 'Concluído sem cartões arquivados.',
    copyMarkdown: 'Copiar Markdown',
    created: (date) => `Criado em ${date}`,
    grid: 'Grade',
    gridView: 'Visualização em grade',
    historyLayout: 'Layout do histórico',
    list: 'Lista',
    listView: 'Visualização em lista',
    noCompletedWorkBody:
      'Conclua trabalhos no quadro para começar a construir seu histórico.',
    noCompletedWorkTitle: 'Ainda não há trabalho concluído',
    workCycle: 'Ciclo de trabalho',
    cardCount: (count) => `${count} ${count === 1 ? 'cartão' : 'cartões'}`,
  },
  language: {
    english: 'English',
    portugueseBrazil: 'Português (Brasil)',
    preferenceLabel: 'Preferência de idioma',
    title: 'Idioma',
    useLanguage: (language) => `Usar ${language}`,
    browserOption: (language) => `Idioma do navegador (${language})`,
    languageName: {
      en: 'Inglês',
      'pt-BR': 'Português (Brasil)',
    },
  },
  priority: {
    high: 'Alta',
    low: 'Baixa',
    medium: 'Média',
  },
  profile: {
    chooseImage: 'Escolher imagem de perfil',
    closeProfile: 'Fechar perfil',
    displayName: 'Nome de exibição',
    editProfile: 'Editar perfil',
    email: 'E-mail',
    imageFile: 'Arquivo de imagem do perfil',
    removeImage: 'Remover imagem',
    hint: 'Seu perfil ajuda a identificar seu espaço de trabalho no Flowboard.',
  },
  settings: {
    appearance: 'Aparência',
    board: 'Quadro',
    clearBoard: 'Limpar quadro',
    clearBoardAriaLabel: 'Limpar quadro',
    clearBoardDescription:
      'Excluir permanentemente todas as colunas e cartões deste quadro.',
    closeSettings: 'Fechar configurações',
    completedColumn: 'Coluna concluída',
    createColumnBeforeCompleted:
      'Crie uma coluna antes de escolher onde o trabalho concluído fica.',
    noCompletedColumn: 'Nenhuma coluna concluída',
    chooseCompletedColumn: 'Escolha a coluna concluída',
    themePreference: 'Preferência de tema',
    title: 'Configurações',
  },
  confirmations: {
    clearBoardConfirm: 'Limpar quadro',
    clearBoardDescription: (columnCount) =>
      `Isso excluirá permanentemente ${columnCount} ${columnCount === 1 ? 'coluna' : 'colunas'} e todos os seus cartões.`,
    clearBoardTitle: 'Limpar este quadro?',
    completeWorkConfirm: 'Concluir trabalho',
    completeWorkDescription: (cardCount, completedColumnTitle) =>
      `Isso arquivará ${cardCount} ${cardCount === 1 ? 'cartão' : 'cartões'} de ${completedColumnTitle} e iniciará um novo ciclo de trabalho.`,
    completeWorkTitle: 'Concluir trabalho?',
  },
  tagManager: {
    close: 'Fechar gerenciador de tags',
    createDescription: 'Crie tags reutilizáveis para cartões neste quadro.',
    editTag: (tagName) => `Editar tag ${tagName}`,
    manageTags: 'Gerenciar tags',
    newTag: 'Nova tag',
    noTagsYet: 'Ainda não há tags.',
    removeTag: 'Remover tag',
    removeTagAction: (tagName) => `Remover tag ${tagName}`,
    removeTagDescription: (tagName, count) =>
      `${tagName} está atribuída a ${count} ${count === 1 ? 'cartão' : 'cartões'}. Removê-la limpará a tag ${count === 1 ? 'desse cartão' : 'desses cartões'}.`,
    removeTagTitle: 'Remover esta tag?',
    renameTag: (tagName) => `Renomear tag ${tagName}`,
    usage: (count) => `${count} ${count === 1 ? 'cartão' : 'cartões'}`,
  },
  theme: {
    dark: 'Escuro',
    light: 'Claro',
    system: 'Sistema',
    useTheme: (theme) => `Usar tema ${theme.toLowerCase()}`,
  },
};

export const messagesByLanguage: Record<ResolvedLanguage, Messages> = {
  en: enMessages,
  'pt-BR': ptBrMessages,
};

export const getMessages = (language: ResolvedLanguage): Messages =>
  messagesByLanguage[language];

const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const defaultDateOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
} satisfies Intl.DateTimeFormatOptions;
const dateTimeOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
} satisfies Intl.DateTimeFormatOptions;
const defaultDateFormatters: Record<ResolvedLanguage, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en', defaultDateOptions),
  'pt-BR': new Intl.DateTimeFormat('pt-BR', defaultDateOptions),
};
const dateTimeFormatters: Record<ResolvedLanguage, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en', dateTimeOptions),
  'pt-BR': new Intl.DateTimeFormat('pt-BR', dateTimeOptions),
};

const isDefaultDateOptions = (options: Intl.DateTimeFormatOptions) =>
  options.day === defaultDateOptions.day &&
  options.month === defaultDateOptions.month &&
  options.year === defaultDateOptions.year &&
  !options.dateStyle &&
  !options.timeStyle;

const isDateTimeOptions = (options: Intl.DateTimeFormatOptions) =>
  options.dateStyle === dateTimeOptions.dateStyle &&
  options.timeStyle === dateTimeOptions.timeStyle;

const getDateFormatter = (
  language: ResolvedLanguage,
  options: Intl.DateTimeFormatOptions
) => {
  const cacheKey = `${language}:${JSON.stringify(options)}`;
  const cachedFormatter = dateFormatters.get(cacheKey);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = isDefaultDateOptions(options)
    ? defaultDateFormatters[language]
    : isDateTimeOptions(options)
      ? dateTimeFormatters[language]
      : null;

  if (!formatter) {
    return null;
  }

  dateFormatters.set(cacheKey, formatter);

  return formatter;
};

export const formatDate = (
  language: ResolvedLanguage,
  value: string,
  options: Intl.DateTimeFormatOptions = defaultDateOptions
) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return (
    getDateFormatter(language, options)?.format(date) ??
    date.toLocaleString(language, options)
  );
};
