import api from './api';

// Candidatos (rotas /api/candidatos do back).
// Os campos já vêm com os nomes que a tela usa:
// { id, fullName, age, photoInitials, email, phone, city, workArea, registrationDate }
// Qualquer conta lista; só GERENTE/ADMIN criam, editam e apagam (o back confere).
export const candidatoService = {
  async listar(filtro = {}, pageRequest = { page: 0, size: 500 }) {
    const pagina = await api.get('/api/candidatos', {
      params: { ...filtro, ...pageRequest },
    });
    return pagina?.itens || [];
  },

  async buscarPorId(id) {
    return await api.get(`/api/candidatos/${id}`);
  },

  async criar(candidato) {
    return await api.post('/api/candidatos', paraApi(candidato));
  },

  async atualizar(id, candidato) {
    return await api.put(`/api/candidatos/${id}`, paraApi(candidato));
  },

  async deletar(id) {
    return await api.delete(`/api/candidatos/${id}`);
  },
};

// Só envia o que o back grava (o id vai na URL e as iniciais o back calcula)
function paraApi(c) {
  return {
    fullName: c.fullName?.trim(),
    age: c.age === '' || c.age == null ? null : Number(c.age),
    email: c.email?.trim() || null,
    phone: c.phone?.trim() || null,
    city: c.city?.trim() || null,
    workArea: c.workArea?.trim() || null,
    registrationDate: c.registrationDate || null, // dd/MM/aaaa
  };
}
