export default function Privacy() {
  return (
    <main style={{maxWidth: 760, margin: "0 auto", padding: 24, lineHeight: 1.65}}>
      <h1>Política de Privacidade — NutriClock</h1>
      <p>O NutriClock armazena registros de alimentação, exercícios, água, cafeína e peso fornecidos pelo próprio usuário.</p>
      <p>Os dados são usados exclusivamente para exibir o acompanhamento nutricional no aplicativo e permitir a sincronização com o GPT personalizado do usuário.</p>
      <p>As credenciais privadas do Supabase não são expostas ao navegador nem ao GPT. A comunicação com a API é protegida por uma chave privada configurada pelo usuário.</p>
      <p>O usuário pode excluir registros pelo aplicativo ou diretamente no banco de dados. Não vendemos nem compartilhamos dados com terceiros.</p>
      <p>Contato do responsável: utilize o canal privado associado ao projeto NutriClock.</p>
    </main>
  );
}
