import { Card, CardContent, Stack, Typography } from '@mui/material';

export function Dashboard() {
  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography component="h1" variant="h4">
        Tableau de bord de démonstration
      </Typography>

      <Card>
        <CardContent>
          <Typography component="h2" variant="h6" gutterBottom>
            Coquille d’administration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            React Admin est monté côté client avec une authentification factice.
            Aucune resource, aucun appel à l’API métier et aucune donnée réelle
            ne sont disponibles dans cette version.
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography component="h2" variant="h6" gutterBottom>
            Prochaines étapes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Le véritable fournisseur d’authentification (cookie HttpOnly
            <code> auth_token</code>) et les resources métier seront ajoutés dans
            un change dédié.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
