// ML TURBO — página de aguardando confirmação de pagamento.
// Mostra info do plano + email salvo. No clique de "Já assinei",
// chama o Supabase pra confirmar que o webhook já liberou o email.
// Sucesso → boas-vindas.html. Erro → estado de retry com novo email.

const PLAN_LINKS = {
  mensal: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=1a8a7062285443cb92c0f07b41cad24e',
  trimestral: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=57dadfca256347d1933a134e57bee9ef'
};

const PLAN_DATA = {
  mensal: {
    title: 'Plano Mensal',
    price: 'R$ 4,99',
    description: 'cobrado todo mês'
  },
  trimestral: {
    title: 'Plano Trimestral',
    price: 'R$ 9,99',
    description: 'cobrado a cada 3 meses'
  }
};

const SUPABASE_URL = 'https://rwcmjfyknmnskzwwhjyy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_W_rGoYv7pjW-Vrxt0bwSsg_ZnHo0eni';

const params = new URLSearchParams(location.search);
const plan = params.get('plan') === 'trimestral' ? 'trimestral' : 'mensal';
const planInfo = PLAN_DATA[plan];
const planLink = PLAN_LINKS[plan];

const el = {
  estados: {
    aguardando: document.getElementById('estado-aguardando'),
    erro: document.getElementById('estado-erro')
  },
  planName: document.getElementById('checkout-plan-name'),
  planPrice: document.getElementById('checkout-plan-price'),
  planDescription: document.getElementById('checkout-plan-description'),
  aguardandoEmail: document.getElementById('aguardando-email-valor'),
  botaoJaAssinei: document.getElementById('botao-ja-assinei'),
  reabrirCheckout: document.getElementById('reabrir-checkout'),
  formReenviar: document.getElementById('form-reenviar'),
  emailRetry: document.getElementById('email-retry'),
  erroMensagem: document.getElementById('erro-mensagem')
};

el.planName.textContent = planInfo.title;
el.planPrice.textContent = planInfo.price;
el.planDescription.textContent = planInfo.description;

let emailEmValidacao = (localStorage.getItem('mlt-email') || '').trim();

if (!emailEmValidacao) {
  // Sem email salvo, não há o que aguardar — manda de volta pro checkout.
  location.replace('checkout.html?plan=' + encodeURIComponent(plan));
}

el.aguardandoEmail.textContent = emailEmValidacao;
el.reabrirCheckout.href = planLink;

function mostrarEstado(nome) {
  for (const [chave, elemento] of Object.entries(el.estados)) {
    elemento.classList.toggle('hidden', chave !== nome);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

el.botaoJaAssinei.addEventListener('click', () => {
  validarAssinatura(emailEmValidacao, el.botaoJaAssinei);
});

el.formReenviar.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = el.emailRetry.value.trim();
  if (!email) {
    el.emailRetry.focus();
    return;
  }
  const botaoSubmit = event.target.querySelector('button[type="submit"]');
  validarAssinatura(email, botaoSubmit);
});

async function validarAssinatura(email, botao) {
  const textoOriginal = botao.textContent;
  botao.disabled = true;
  botao.textContent = 'Validando...';

  try {
    const resposta = await fetch(SUPABASE_URL + '/auth/v1/otp', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, create_user: false })
    });

    if (resposta.ok) {
      localStorage.setItem('mlt-email', email);
      const url = 'boas-vindas.html?email=' + encodeURIComponent(email);
      location.href = url;
      return;
    }

    const erro = await resposta.json().catch(() => ({}));
    el.erroMensagem.textContent = mensagemDeErro(erro);
    el.emailRetry.value = email;
    emailEmValidacao = email;
    mostrarEstado('erro');
  } catch (_) {
    el.erroMensagem.textContent = 'Sem conexão com a internet. Confira sua rede e tente de novo.';
    el.emailRetry.value = email;
    mostrarEstado('erro');
  } finally {
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
}

function mensagemDeErro(erro) {
  const msg = (erro && (erro.msg || erro.message || erro.error_description)) || '';
  const txt = String(msg).toLowerCase();

  if (txt.includes('signups not allowed') || txt.includes('user not found') ||
      txt.includes('not allowed for otp') || txt.includes('not allowed')) {
    return 'Ainda não recebemos a confirmação do Mercado Pago. Aguarde alguns minutos e tente novamente. Se você usou outro email no pagamento, digite ele abaixo.';
  }
  if (txt.includes('rate limit') || txt.includes('too many')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
  }
  return 'Não conseguimos confirmar seu acesso agora. Tente novamente em alguns minutos.';
}
