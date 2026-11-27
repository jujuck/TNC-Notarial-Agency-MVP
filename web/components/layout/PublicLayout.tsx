import type { ReactNode } from 'react';

import Link from 'next/link';

import { siteContent } from '@/content/site';

import styles from './PublicLayout.module.css';

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="site">
      <a className={styles.skipLink} href="#contenu">
        Aller au contenu
      </a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/" aria-label={`${siteContent.siteName} — accueil`}>
            <span className={styles.monogram} aria-hidden="true">
              EN
            </span>
            <span>
              <span className={styles.brandName}>{siteContent.siteName}</span>
              <span className={styles.brandTagline}>{siteContent.tagline}</span>
            </span>
          </Link>

          <nav aria-label="Navigation principale">
            <ul className={styles.navList}>
              {siteContent.nav.map((item) => (
                <li key={item.href}>
                  <a className={styles.navLink} href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {children}

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <p className={styles.footerBrand}>{siteContent.siteName}</p>
            <p className={styles.footerText}>{siteContent.notice}</p>
          </div>
          <address className={styles.footerAddress}>
            <span>{siteContent.contact.address}</span>
            <a href={`tel:${siteContent.contact.phone.replace(/\s/g, '')}`}>
              {siteContent.contact.phone}
            </a>
            <a href={`mailto:${siteContent.contact.email}`}>{siteContent.contact.email}</a>
          </address>
        </div>
      </footer>
    </div>
  );
}
