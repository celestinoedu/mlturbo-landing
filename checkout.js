// ML TURBO — checkout do site público.
// O botão "Ir para pagamento" é um <a target="_blank"> com href apontando
// pro link do Mercado Pago. Isso evita o popup blocker — diferente de
// window.open(), o clique direto num <a target="_blank"> nunca é bloqueado
// pelos navegadores. Após o clique, redirecionamos a aba atual pra
// aguardando.html (com um pequeno delay pra garantir que a nova aba abra
// primeiro).

const PLAN_LINKS = {
  mensal: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=1a8a7062285443cb92c0f07b41cad24e',
  trimestral: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=57dadfca256347d1933a134e57bee9ef'
};

const PLAN_DATA = {
  mensal: {
    title: 'Plano Mensal',
    price: 'R$ 19,90',
    description: 'cobrado todo mês'
  },
  trimestral: {
    title: 'Plano Trimestral',
    price: 'R$ 49,90',
    description: 'cobrado a cada 3 meses'
  }
};

const params = new URLSearchParams(location.search);
const plan = params.get('plan') === 'trimestral' ? 'trimestral' : 'mensal';
const planInfo = PLAN_DATA[plan];
const planLink = PLAN_LINKS[plan];

if (params.get('status') === 'retorno') {
  location.replace('aguardando.html?plan=' + encodeURIComponent(plan));
}

const planName = document.getElementById('checkout-plan-name');
const planPrice = document.getElementById('checkout-plan-price');
const planDescription = document.getElementById('checkout-plan-description');
const emailInput = document.getElementById('email');
const botaoPagamento = document.getElementById('botao-pagamento');

planName.textContent = planInfo.title;
planPrice.textContent = planInfo.price;
planDescription.textContent = planInfo.description;
botaoPagamento.href = planLink;

const emailSalvo = localStorage.getItem('mlt-email');
if (emailSalvo) {
  emailInput.value = emailSalvo;
}

botaoPagamento.addEventListener('click', (event) => {
  const email = emailInput.value.trim();
  if (!email || !emailInput.checkValidity()) {
    event.preventDefault();
    emailInput.focus();
    emailInput.reportValidity();
    return;
  }

  localStorage.setItem('mlt-email', email);

  // Não chamamos preventDefault — o navegador abre o link em nova aba
  // naturalmente (target="_blank"). Em paralelo, redirecionamos a aba
  // atual pra aguardando.html. O delay de 100ms dá tempo do navegador
  // disparar a nova aba antes da aba atual mudar.
  setTimeout(() => {
    location.href = 'aguardando.html?plan=' + encodeURIComponent(plan);
  }, 100);
});

emailInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    botaoPagamento.click();
  }
});
