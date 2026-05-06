const PLAN_LINKS = {
  mensal: 'https://invoice.infinitepay.io/plans/mlturbo/2b2nozJ3Dh',
  trimestral: 'https://invoice.infinitepay.io/plans/mlturbo/3tbVaLIcZn'
};

const planData = {
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
const planInfo = planData[plan];
const planLink = PLAN_LINKS[plan];

const planName = document.getElementById('checkout-plan-name');
const planPrice = document.getElementById('checkout-plan-price');
const planDescription = document.getElementById('checkout-plan-description');
const form = document.getElementById('checkout-form');
const submitButton = document.getElementById('checkout-submit');
const emailInput = document.getElementById('email');

planName.textContent = planInfo.title;
planPrice.textContent = planInfo.price;
planDescription.textContent = planInfo.description;

const savedEmail = localStorage.getItem('mlt-email');
if (savedEmail) {
  emailInput.value = savedEmail;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  if (!email) {
    emailInput.focus();
    return;
  }

  localStorage.setItem('mlt-email', email);
  submitButton.disabled = true;
  submitButton.textContent = 'Redirecionando...';
  window.location.href = planLink;
});
