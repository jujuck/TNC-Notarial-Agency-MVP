# ADR 0003 — Noindex permanent du site de démonstration

- Statut : accepté
- Date : 2026-11-26
- Contexte : change `add-web-platform`

## Contexte

Le site présente une étude notariale fictive et sert de démonstration technique.
Il doit montrer un socle SEO complet : métadonnées par page, canonical, Open
Graph, Twitter card, JSON-LD, `robots.txt` et sitemap.

En même temps, la démonstration ne doit jamais apparaître dans les moteurs de
recherche : contenu fictif, coordonnées inventées, aucune donnée réelle, et un
risque de confusion avec une véritable étude notariale.

Le cadrage mentionnait initialement une variable `SITE_INDEXABLE=false`. Une
variable d'environnement rend l'indexation dépendante du déploiement : une
valeur oubliée ou modifiée suffirait à exposer le site.

## Décision

Le site est **non indexable de façon permanente**, sans aucun interrupteur.

- **Meta** : `<meta name="robots" content="noindex, nofollow">` émise par le
  composant `Seo` sur chaque page publique et par `NoIndex` sur `/admin`. La
  valeur est une constante `ROBOTS_NOINDEX`, sans prop de désactivation.
- **En-tête HTTP** : `X-Robots-Tag: noindex, nofollow` sur `/:path*` via
  `headers()` dans `web/next.config.js`, ce qui couvre pages, assets statiques,
  images, sitemap et `robots.txt`.
- **`robots.txt`** : `User-agent: *` et `Allow: /`, sans `Disallow: /` et sans
  ligne `Sitemap:`.
- **Sitemap** : généré au postbuild par `next-sitemap`, non référencé dans
  `robots.txt`, jamais soumis à Search Console ni à Bing Webmaster Tools.
- Aucune variable `INDEXABLE`, `NEXT_PUBLIC_SEO_INDEXABLE` ou `SITE_INDEXABLE`
  n'existe. La mention initiale du cadrage est remplacée par cette décision.

## Conséquences

Positives :

- L'invariant est vérifiable dans le code, les tests et le HTML rendu.
- Aucun risque d'indexation accidentelle lors d'un déploiement.
- Le socle SEO reste complet et démontrable en entretien.

Négatives et risques assumés :

- **Lighthouse SEO échoue** sur « page bloquée pour l'indexation ». C'est
  attendu et documenté dans `docs/seo.md` ; il ne faut pas retirer le noindex
  pour améliorer le score.
- **Le sitemap est inutilisé** par les moteurs : il démontre la génération, pas
  le référencement.
- **`Disallow: /` est proscrit** : un crawler bloqué ne lit pas la meta noindex
  et peut conserver l'URL à partir de liens entrants.
- **Le retrait du noindex est une décision produit**, pas une configuration :
  il exigerait un change dédié, une revue et une mise à jour de cet ADR.

## Alternatives écartées

- **Variable d'environnement (`SITE_INDEXABLE`, `NEXT_PUBLIC_SEO_INDEXABLE`)** :
  dépend du déploiement, donc fragile et contraire à l'invariant.
- **`Disallow: /`** : empêche la lecture du noindex et ne garantit pas la
  disparition des résultats.
- **Protection par basic auth ou filtrage IP** : hors périmètre, ne démontre pas
  le SEO.
- **`X-Robots-Tag` ajouté par Nginx sur toutes les réponses** : mélange les
  responsabilités et duplique l'en-tête déjà émis par Next.js. Nginx le garde
  uniquement sur `/api`.
- **Pas de sitemap** : le socle SEO doit rester complet et testable.

## Évolution prévue

- Remplacer l'image Open Graph SVG par un PNG 1200 × 630.
- Réévaluer l'indexation uniquement si le site devient un vrai site public, via
  un change dédié et un nouvel ADR.

## Retour arrière

Supprimer la constante `ROBOTS_NOINDEX`, les entrées `headers()` concernées,
`public/robots.txt`, la configuration `next-sitemap` et les tests associés.
Aucune donnée, aucune table et aucun volume ne sont concernés.
