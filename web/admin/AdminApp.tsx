import { Admin } from 'react-admin';

import { Dashboard } from './Dashboard';
import { LoginPage } from './LoginPage';
import { fakeAuthProvider } from './fakeAuthProvider';
import { fakeDataProvider } from './fakeDataProvider';

/**
 * Coquille d'administration chargee uniquement cote client.
 * Aucune resource et aucun appel API : voir le change `add-web-platform`.
 * react-admin 5 utilise react-router en mode navigateur ; `basename` suffit,
 * la prop `history` a ete supprimee.
 */
export default function AdminApp() {
  return (
    <Admin
      basename="/admin"
      dataProvider={fakeDataProvider}
      authProvider={fakeAuthProvider}
      loginPage={<LoginPage />}
      dashboard={Dashboard}
      requireAuth
      disableTelemetry
    />
  );
}
