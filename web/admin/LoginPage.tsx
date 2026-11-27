import { useState, type FormEvent } from 'react';
import { useLogin } from 'react-admin';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export function LoginPage() {
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Renseignez un email et un mot de passe.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login({ username: email, password });
    } catch {
      setError('Connexion impossible. Réessayez.');
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 3,
        background: 'linear-gradient(160deg, #fbf8f2 0%, #efe8da 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Typography component="h1" variant="h5" gutterBottom>
            Administration — démonstration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Toute paire email / mot de passe non vide ouvre la coquille
            d’administration. Aucune donnée réelle n’est accessible.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Email"
                name="email"
                type="text"
                inputMode="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Mot de passe"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                fullWidth
              />

              {error ? <Alert severity="error">{error}</Alert> : null}

              <Button type="submit" variant="contained" disabled={submitting} fullWidth>
                Se connecter
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
