import { absoluteUrl } from '@/lib/site';
import type { JsonLdNode } from '@/components/Seo';

import { siteContent } from './site';

export type HomeStat = {
  value: string;
  label: string;
};

export type HomeCard = {
  title: string;
  description: string;
  points: string[];
};

export type HomeContent = {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  stats: HomeStat[];
  study: {
    title: string;
    paragraphs: string[];
    values: HomeCard[];
  };
  domains: {
    title: string;
    intro: string;
    cards: HomeCard[];
  };
  fees: {
    title: string;
    intro: string;
    rows: { label: string; detail: string }[];
    notice: string;
  };
  contact: {
    title: string;
    intro: string;
    note: string;
  };
};

export const homeContent: HomeContent = {
  hero: {
    eyebrow: 'Étude notariale de démonstration',
    title: 'Un notariat de proximité, au service de vos projets',
    lead: "Conseil, actes authentiques et accompagnement des familles, des entreprises et des projets immobiliers. Ce site est une démonstration technique : toutes les situations présentées sont fictives.",
    primaryCta: { label: "Découvrir l'étude", href: '#etude' },
    secondaryCta: { label: 'Nous contacter', href: '#contact' },
  },
  stats: [
    { value: '4', label: 'domaines d’intervention' },
    { value: '2', label: 'notaires associés fictifs' },
    { value: '100 %', label: 'données de démonstration' },
  ],
  study: {
    title: "L'étude",
    paragraphs: [
      "L'Étude notariale de l'Exemple est un office fictif imaginé pour illustrer un parcours de démonstration. Elle réunit deux notaires associés et une équipe de collaborateurs, tous fictifs.",
      "Le contenu de cette page est statique et généré au build. Il ne dépend d'aucune donnée réelle, d'aucun appel à l'API métier et d'aucun formulaire.",
    ],
    values: [
      {
        title: 'Proximité',
        description: 'Un accompagnement lisible, des rendez-vous expliqués à l’avance.',
        points: ['Accueil physique et téléphonique', 'Documents remis avant signature'],
      },
      {
        title: 'Clarté',
        description: 'Des honoraires présentés simplement, sans surprise.',
        points: ['Devis écrit avant toute mission', 'Détail des frais et taxes'],
      },
      {
        title: 'Rigueur',
        description: 'Des actes vérifiés et conservés selon les règles du notariat.',
        points: ['Contrôle des pièces', 'Traçabilité des échanges'],
      },
    ],
  },
  domains: {
    title: 'Domaines d’intervention',
    intro:
      'Quatre familles de missions structurent l’activité de l’étude fictive. Chaque domaine renvoie à un accompagnement décrit en quelques lignes.',
    cards: [
      {
        title: 'Famille',
        description: 'Successions, donations et organisation du patrimoine familial.',
        points: ['Testaments et donations', 'Règlement de succession', 'Protection du conjoint'],
      },
      {
        title: 'Immobilier',
        description: 'Ventes, achats et opérations immobilières courantes.',
        points: ['Compromis et actes de vente', 'Prêts et garanties', 'Copropriété'],
      },
      {
        title: 'Entreprise',
        description: 'Création, transmission et vie statutaire des sociétés.',
        points: ['Statuts et assemblées', 'Cession de parts', 'Baux commerciaux'],
      },
      {
        title: 'Patrimoine',
        description: 'Conseil en organisation et transmission du patrimoine.',
        points: ['Diagnostic patrimonial', 'Démembrement', 'Pacte successoral'],
      },
    ],
  },
  fees: {
    title: 'Honoraires',
    intro:
      'Les montants ci-dessous sont des exemples fictifs destinés à montrer la présentation d’une grille tarifaire. Ils ne constituent pas une offre réelle.',
    rows: [
      { label: 'Consultation d’orientation', detail: 'Forfait de démonstration : 60 € TTC' },
      { label: 'Acte de vente immobilière', detail: 'Émoluments proportionnels simulés' },
      { label: 'Statuts de société', detail: 'Forfait de démonstration : 450 € TTC' },
      { label: 'Dossier de succession', detail: 'Devis écrit après étude des pièces' },
    ],
    notice:
      'Aucun paiement, aucune réservation et aucune transmission de document ne sont possibles sur cette démonstration.',
  },
  contact: {
    title: 'Contact',
    intro:
      'Les coordonnées affichées sont fictives. Aucun formulaire de contact n’est proposé dans cette version du site.',
    note: 'Pour une démonstration, utilisez uniquement les informations ci-dessous.',
  },
};

/**
 * JSON-LD de l'accueil : Organization, Notary (LocalBusiness) et WebSite.
 * Construit au build pour ne pas embarquer la logique dans le bundle navigateur.
 */
export function buildHomeJsonLd(): JsonLdNode[] {
  const url = absoluteUrl('/');
  const organizationId = `${url}#organization`;
  const websiteId = `${url}#website`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': organizationId,
      name: siteContent.siteName,
      description: siteContent.description,
      url,
      email: siteContent.contact.email,
      telephone: siteContent.contact.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: siteContent.contact.address,
        addressCountry: 'FR',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Notary',
      '@id': `${url}#notary`,
      name: siteContent.siteName,
      parentOrganization: { '@id': organizationId },
      url,
      telephone: siteContent.contact.phone,
      openingHours: 'Mo-Fr 09:00-12:00,14:00-17:00',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      name: siteContent.siteName,
      url,
      inLanguage: 'fr-FR',
      publisher: { '@id': organizationId },
    },
  ];
}
