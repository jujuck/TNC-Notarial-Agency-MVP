import type { GetStaticProps, InferGetStaticPropsType } from 'next';

import type { NextPageWithLayout } from './_app';

import { Seo } from '@/components/Seo';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { buildHomeJsonLd, homeContent } from '@/content/home';
import { siteContent } from '@/content/site';

import styles from '@/styles/Home.module.css';

type HomeProps = {
  home: typeof homeContent;
  jsonLd: ReturnType<typeof buildHomeJsonLd>;
};

const title = `${siteContent.siteName} — notariat de proximité`;
const description =
  "Étude notariale fictive de démonstration : conseil, actes authentiques et accompagnement des familles, des entreprises et des projets immobiliers.";

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  return {
    props: {
      home: homeContent,
      jsonLd: buildHomeJsonLd(),
    },
    revalidate: 3600,
  };
};

const HomePage: NextPageWithLayout<InferGetStaticPropsType<typeof getStaticProps>> = ({
  home,
  jsonLd,
}) => {
  return (
    <>
      <Seo title={title} description={description} path="/" jsonLd={jsonLd} />

      <main id="contenu">
        <section className={styles.hero} aria-labelledby="accueil-titre">
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>{home.hero.eyebrow}</p>
            <h1 id="accueil-titre" className={styles.heroTitle}>
              {home.hero.title}
            </h1>
            <p className={styles.heroLead}>{home.hero.lead}</p>

            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href={home.hero.primaryCta.href}>
                {home.hero.primaryCta.label}
              </a>
              <a className={styles.secondaryAction} href={home.hero.secondaryCta.href}>
                {home.hero.secondaryCta.label}
              </a>
            </div>

            <dl className={styles.stats}>
              {home.stats.map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  <dt className={styles.statLabel}>{stat.label}</dt>
                  <dd className={styles.statValue}>{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="etude" className={styles.section} aria-labelledby="etude-titre">
          <div className={styles.sectionInner}>
            <h2 id="etude-titre" className={styles.sectionTitle}>
              {home.study.title}
            </h2>

            <div className={styles.studyIntro}>
              {home.study.paragraphs.map((paragraph) => (
                <p key={paragraph} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>

            <ul className={styles.cardGrid}>
              {home.study.values.map((value) => (
                <li key={value.title} className={styles.card}>
                  <h3 className={styles.cardTitle}>{value.title}</h3>
                  <p className={styles.cardText}>{value.description}</p>
                  <ul className={styles.pointList}>
                    {value.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="domaines"
          className={`${styles.section} ${styles.sectionAlt}`}
          aria-labelledby="domaines-titre"
        >
          <div className={styles.sectionInner}>
            <h2 id="domaines-titre" className={styles.sectionTitle}>
              {home.domains.title}
            </h2>
            <p className={styles.sectionIntro}>{home.domains.intro}</p>

            <ul className={styles.cardGrid}>
              {home.domains.cards.map((card) => (
                <li key={card.title} className={styles.card}>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardText}>{card.description}</p>
                  <ul className={styles.pointList}>
                    {card.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="honoraires" className={styles.section} aria-labelledby="honoraires-titre">
          <div className={styles.sectionInner}>
            <h2 id="honoraires-titre" className={styles.sectionTitle}>
              {home.fees.title}
            </h2>
            <p className={styles.sectionIntro}>{home.fees.intro}</p>

            <dl className={styles.feeList}>
              {home.fees.rows.map((row) => (
                <div key={row.label} className={styles.feeRow}>
                  <dt className={styles.feeLabel}>{row.label}</dt>
                  <dd className={styles.feeDetail}>{row.detail}</dd>
                </div>
              ))}
            </dl>

            <p className={styles.notice}>{home.fees.notice}</p>
          </div>
        </section>

        <section
          id="contact"
          className={`${styles.section} ${styles.sectionAlt}`}
          aria-labelledby="contact-titre"
        >
          <div className={styles.sectionInner}>
            <h2 id="contact-titre" className={styles.sectionTitle}>
              {home.contact.title}
            </h2>
            <p className={styles.sectionIntro}>{home.contact.intro}</p>

            <div className={styles.contactGrid}>
              <address className={styles.contactCard}>
                <p className={styles.contactLabel}>Adresse</p>
                <p>{siteContent.contact.address}</p>
                <p className={styles.contactLabel}>Téléphone</p>
                <p>
                  <a href={`tel:${siteContent.contact.phone.replace(/\s/g, '')}`}>
                    {siteContent.contact.phone}
                  </a>
                </p>
                <p className={styles.contactLabel}>Courriel</p>
                <p>
                  <a href={`mailto:${siteContent.contact.email}`}>{siteContent.contact.email}</a>
                </p>
              </address>

              <div className={styles.contactCard}>
                <p className={styles.contactLabel}>Horaires</p>
                <p>{siteContent.contact.hours}</p>
                <p className={styles.notice}>{home.contact.note}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

HomePage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default HomePage;
