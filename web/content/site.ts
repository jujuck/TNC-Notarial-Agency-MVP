export type NavItem = {
  label: string;
  href: string;
};

export type SiteContent = {
  siteName: string;
  shortName: string;
  tagline: string;
  description: string;
  notice: string;
  nav: NavItem[];
  contact: {
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
};

export const siteContent: SiteContent = {
  siteName: "Étude notariale de l'Exemple",
  shortName: "L'Exemple",
  tagline: 'Un notariat de proximité, au service de vos projets',
  description:
    "Étude notariale fictive de démonstration : conseil, actes authentiques et accompagnement des familles, des entreprises et des projets immobiliers.",
  notice:
    'Site de démonstration. Toutes les données, coordonnées et situations présentées sont fictives.',
  nav: [
    { label: "L'étude", href: '#etude' },
    { label: 'Domaines', href: '#domaines' },
    { label: 'Honoraires', href: '#honoraires' },
    { label: 'Contact', href: '#contact' },
  ],
  contact: {
    address: '1 place de la Démomstration, 00000 Villefictive',
    phone: '01 99 00 12 34',
    email: 'contact@etude-notariale-demo.test',
    hours: 'Du lundi au vendredi, de 9 h à 12 h et de 14 h à 17 h',
  },
};
