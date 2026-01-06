export default {
  header: {
    changelog: "Mises à jour",
    about: "À propos de Seumei",
    login: "Se connecter",
    dashboard: "Tableau de bord",
  },
  hero: {
    top: "Présentation de",
    main: "Seumei — le système universel pour les petites entreprises",
    sub: "Tout ce dont vous avez besoin pour gérer votre activité en un seul endroit.",
    firstButton: "Commencer",
    tools: "Construit avec des technologies modernes",
    on: "avec",
  },
  features: {
    top: "Fonctionnalités",
    details:
      "Seumei centralise l'authentification, la gestion, les APIs, le téléversement de fichiers, les paiements et l'automatisation dans une plateforme unique et évolutive.",
    libs: {
      nextjs:
        "App Router, routage dynamique, mises en page, APIs, Server Components et Server Actions.",
      tailwindcss:
        "Interface moderne avec des composants accessibles stylisés via Tailwind CSS.",
      postgres:
        "Base de données Postgres avec ORM, conçue pour évoluer en toute sécurité.",
      lucia:
        "Authentification et autorisation sécurisées pour les utilisateurs et les espaces de travail.",
      uploadthing:
        "Téléversement et prévisualisation de fichiers simples et efficaces.",
      reactEmail:
        "Création et envoi d'e-mails transactionnels et de notifications automatisées.",
      internationalization:
        "Support complet de l'internationalisation avec un typage sécurisé.",
      stripe: "Traitement des paiements et gestion des abonnements intégrés.",
      vercel:
        "Déploiement continu avec environnements de prévisualisation et de production.",
    },
    aboutMd:
      "Seumei inclut également des pages de mises à jour et d'informations institutionnelles.",
  },
  notFound: {
    title: "Page introuvable !",
  },
  settings: {
    title: "Paramètres",
    picture: {
      label: "Photo",
      description: "Cliquez sur l'avatar pour en téléverser un nouveau.",
    },
    name: {
      label: "Nom",
      placeholder: "Votre nom",
    },
    email: {
      label: "E-mail",
      placeholder: "Votre adresse e-mail",
    },
    buttons: {
      reset: "Réinitialiser",
      update: "Mettre à jour",
      updating: "Mise à jour...",
    },
    messages: {
      updated: "Mis à jour avec succès !",
      error: "Une erreur s'est produite.",
    },
    resetModal: {
      title: "Êtes-vous sûr de vouloir annuler les modifications ?",
      confirm: "Oui",
      cancel: "Non",
    },
    imageUpload: {
      title: "Téléverser une image",
      dropOrClick: "Glissez ou cliquez ici",
      cancel: "Annuler",
      upload: "Téléverser",
      uploading: "Téléversement...",
      success: "Téléversé avec succès !",
      error: "Erreur lors du téléversement !",
      fileInfo:
        "Seuls les fichiers image sont pris en charge et la taille maximale est",
    },
  },
} as const;
