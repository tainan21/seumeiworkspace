export default {
  header: {
    changelog: "Mises à jour",
    about: "À propos de Seumei",
    login: "Se connecter",
    dashboard: "Tableau de bord",
  },
  hero: {
    top: "Présentation de",
    main: "Seumei — Le système universel pour les micro-entrepreneurs",
    sub: "Tout ce dont vous avez besoin pour gérer votre entreprise en un seul endroit.",
    firstButton: "Commencer",
    tools: "Construit avec des technologies modernes",
    on: "avec",
    badge: "Présentation de Seumei v2.0 — Maintenant avec IA",
    headline1: "Gérez mieux.",
    headline2: "Croissez plus vite.",
    subheadline: "La plateforme tout-en-un qui aide les micro-entrepreneurs à organiser, automatiser et développer leurs activités. Pas de complexité, juste des résultats.",
    ctaPrimary: "Commencer gratuitement",
    ctaSecondary: "Voir comment ça fonctionne",
    socialProof: "Fait confiance par",
    trustedBy: "10 000+ entrepreneurs",
  },
  features: {
    top: "Fonctionnalités",
    details:
      "Seumei centralise l'authentification, la gestion, les APIs, le téléversement de fichiers, les paiements et l'automatisation dans une plateforme unique et évolutive.",
    sectionTag: "Fonctionnalités",
    title: "Tout ce dont vous avez besoin pour réussir",
    subtitle: "Des fonctionnalités puissantes conçues pour vous aider à mieux gérer votre entreprise, plus rapidement.",
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
    cards: {
      dashboard: {
        title: "Tableau de bord en temps réel",
        description: "Suivez toutes les métriques importantes avec des tableaux de bord personnalisables.",
        metrics: {
          users: "Utilisateurs",
          revenue: "Revenus",
          totalUsers: "Total des utilisateurs",
          conversion: "Conversion",
        },
      },
      performance: {
        title: "Ultra rapide",
        description: "Optimisé pour la vitesse à toute échelle.",
        uptime: "disponibilité",
      },
      keyboard: {
        title: "Raccourcis clavier",
        description: "Chaque action est à une seule touche de distance.",
      },
      integrations: {
        title: "100+ Intégrations",
        description: "Connectez-vous aux outils que vous utilisez déjà quotidiennement.",
        viewAll: "Voir toutes les intégrations",
      },
    },
  },
  impact: {
    sectionTag: "Notre Impact",
    title: "Fait confiance par les entrepreneurs dans tout le pays",
    subtitle: "Des chiffres qui parlent d'eux-mêmes. Découvrez pourquoi des milliers choisissent Seumei.",
    metrics: {
      "0": { label: "Disponibilité SLA", description: "Fiabilité entreprise" },
      "1": { label: "Requêtes API/Jour", description: "Prouvé à grande échelle" },
      "2": { label: "Temps de réponse moyen", description: "Ultra rapide" },
      "3": { label: "Pays", description: "Portée mondiale" },
    },
  },
  testimonials: {
    sectionTag: "Témoignages",
    title: "Ce que disent nos utilisateurs",
    subtitle: "Découvrez ce que nos clients ont à dire sur nous.",
    trustedBy: "Fait confiance par les leaders de l'industrie",
    companies: ["TechCorp", "Innovate", "NextGen", "Quantum", "Velocity", "Apex"],
    items: [
      {
        text: "Cette plateforme a complètement transformé notre façon de construire des produits. Nous avons livré notre MVP en 2 semaines au lieu de 2 mois.",
        name: "Sarah Chen",
        role: "CTO chez TechFlow",
      },
      {
        text: "Le meilleur investissement que nous ayons fait pour notre équipe d'ingénierie. Le retour sur investissement a été immédiat et substantiel.",
        name: "Marcus Johnson",
        role: "VP Ingénierie chez Scale",
      },
      {
        text: "Enfin, un outil qui tient vraiment ses promesses. Notre temps de déploiement est passé de heures à minutes.",
        name: "Emily Rodriguez",
        role: "Développeuse principale chez Nexus",
      },
      {
        text: "La mise en œuvre a été fluide et rapide. L'interface personnalisable a rendu l'intégration de l'équipe sans effort.",
        name: "David Park",
        role: "Responsable IT",
      },
      {
        text: "L'équipe de support est exceptionnelle, nous guidant dans la configuration et fournissant une assistance continue.",
        name: "Aisha Patel",
        role: "Responsable Succès Client",
      },
      {
        text: "L'intégration transparente a amélioré nos opérations et notre efficacité. Je recommande fortement.",
        name: "James Wilson",
        role: "PDG chez Quantum",
      },
      {
        text: "Ses fonctionnalités robustes et son support rapide ont transformé significativement notre flux de travail.",
        name: "Lisa Thompson",
        role: "Chef de projet",
      },
      {
        text: "La mise en œuvre fluide a dépassé les attentes. Elle a rationalisé tout notre processus commercial.",
        name: "Michael Brown",
        role: "Analyste commercial",
      },
      {
        text: "La productivité de notre équipe s'est améliorée de façon spectaculaire grâce à la conception conviviale et aux fonctionnalités puissantes.",
        name: "Rachel Kim",
        role: "Directrice marketing",
      },
    ],
  },
  pricing: {
    sectionTag: "Tarification",
    title: "Tarification simple et transparente",
    subtitle: "Pas de frais cachés. Pas de surprises. Choisissez le plan qui vous convient.",
    plans: [
      {
        name: "Starter",
        description: "Parfait pour les projets secondaires et les petites équipes",
        price: "0 €",
        period: "pour toujours",
        features: ["Jusqu'à 3 membres d'équipe", "5 projets", "Analyses de base", "Support communautaire", "1 Go de stockage"],
        cta: "Commencer",
      },
      {
        name: "Pro",
        description: "Pour les équipes en croissance qui ont besoin de plus de puissance",
        price: "29 €",
        period: "/mois",
        features: [
          "Membres d'équipe illimités",
          "Projets illimités",
          "Analyses avancées",
          "Support prioritaire",
          "100 Go de stockage",
          "Intégrations personnalisées",
          "Accès API",
        ],
        cta: "Commencer l'essai gratuit",
      },
      {
        name: "Enterprise",
        description: "Pour les grandes organisations avec des besoins personnalisés",
        price: "Personnalisé",
        period: "",
        features: [
          "Tout dans Pro",
          "Gestionnaire de compte dédié",
          "SLA personnalisé",
          "Déploiement sur site",
          "Stockage illimité",
          "Sécurité avancée",
          "Formation et intégration",
        ],
        cta: "Contacter les ventes",
      },
    ],
  },
  cta: {
    title: "Prêt à commencer ?",
    subtitle: "Rejoignez des milliers d'équipes qui construisent déjà de meilleurs produits avec notre plateforme. Commencez votre essai gratuit aujourd'hui.",
    ctaPrimary: "Commencer l'essai gratuit",
    ctaSecondary: "Planifier une démo",
  },
  footer: {
    brand: "Seumei",
    tagline: "Gérez mieux, croissez plus vite. La plateforme pour les micro-entrepreneurs modernes.",
    sections: {
      product: {
        title: "Produit",
        links: [
          { label: "Fonctionnalités", href: "#features" },
          { label: "Tarification", href: "#pricing" },
          { label: "Journal des modifications", href: "#" },
          { label: "Documentation", href: "#" },
        ],
      },
      company: {
        title: "Entreprise",
        links: [
          { label: "À propos", href: "#" },
          { label: "Blog", href: "#" },
          { label: "Carrières", href: "#" },
          { label: "Contact", href: "#" },
        ],
      },
      legal: {
        title: "Légal",
        links: [
          { label: "Confidentialité", href: "#" },
          { label: "Conditions", href: "#" },
          { label: "Sécurité", href: "#" },
        ],
      },
    },
    copyright: "© {year} Seumei. Tous droits réservés.",
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
