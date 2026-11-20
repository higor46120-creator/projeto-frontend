import api from './api';
import { obterTokenNotificacao } from '../../firebase';

// Liga o navegador às notificações push do back (rotas /usuarios/me/fcm-token).
export const notificacaoService = {
  // Depois do login: pega o token do Firebase e manda para o back.
  // Não lança erro: sem permissão ou sem Firebase configurado, o app segue normal.
  async registrar() {
    const fcmToken = await obterTokenNotificacao();
    if (!fcmToken) return false;
    try {
      await api.put('/usuarios/me/fcm-token', { fcmToken });
      return true;
    } catch (err) {
      console.warn('[Notificações] Não foi possível salvar o token no back', err);
      return false;
    }
  },

  // No logout: o back para de mandar push para este navegador.
  // Recebe o token JWT porque ele já pode ter sido apagado do localStorage.
  async remover(tokenJwt) {
    if (!tokenJwt) return;
    try {
      await api.delete('/usuarios/me/fcm-token', {
        headers: { Authorization: `Bearer ${tokenJwt}` },
      });
    } catch {
      /* sessão já expirada ou back fora do ar: nada a fazer */
    }
  },
};
