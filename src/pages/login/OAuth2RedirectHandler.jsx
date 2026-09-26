import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// O backend (OAuth2SuccessHandler/OAuth2FailureHandler) redireciona para
// esta mesma rota com ?token=... em caso de sucesso, ou ?error=oauth2 em
// caso de falha - ver app.oauth2.redirect-uri no application.yml.
export function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [done, setDone] = useState(false);

  const token = searchParams.get('token');
  const error = searchParams.get('error');

  useEffect(() => {
    if (token) {
      login(token);
    }
    setDone(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (error) {
    return <Navigate to="/login?erro=oauth2" replace />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!done) {
    return null;
  }

  return <Navigate to="/" replace />;
}
