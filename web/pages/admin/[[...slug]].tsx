import dynamic from 'next/dynamic';

import { NoIndex } from '@/components/NoIndex';

import styles from './admin.module.css';

const AdminApp = dynamic(() => import('@/admin/AdminApp'), {
  ssr: false,
  loading: () => (
    <main className={styles.loading} role="status">
      Chargement de l’administration…
    </main>
  ),
});

export default function AdminPage() {
  return (
    <>
      <NoIndex />
      <AdminApp />
    </>
  );
}
