// ML TURBO - landing page
// Mantemos o JS bem leve. Smooth scroll, animação de entrada
// (IntersectionObserver) e efeito tilt 3D nos cards de funcionalidade.

(function () {
  // Tilt 3D nos cards de funcionalidade — segue o mouse com inclinação leve.
  // Usa transform 3D pra GPU acelerar; quando sai do card, volta ao normal.
  const cardsTilt = document.querySelectorAll(".card-funcionalidade");
  const inclinacaoMaxima = 6; // graus

  cardsTilt.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const ret = card.getBoundingClientRect();
      const x = (e.clientX - ret.left) / ret.width - 0.5;
      const y = (e.clientY - ret.top) / ret.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateX(${(-y * inclinacaoMaxima).toFixed(2)}deg) ` +
        `rotateY(${(x * inclinacaoMaxima).toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // Smooth scroll para links internos.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length > 1) {
        const alvo = document.querySelector(id);
        if (alvo) {
          e.preventDefault();
          alvo.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  // Adiciona a classe "revelar" em seções e cards e dispara "visivel"
  // quando entram na viewport — feito com IntersectionObserver (sem libs).
  const elementosParaRevelar = document.querySelectorAll(
    ".problema-grid, .cards-funcionalidades > *, .passo, .planos > *, .faq-item, .cta-final-conteudo"
  );

  elementosParaRevelar.forEach((el) => el.classList.add("revelar"));

  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    elementosParaRevelar.forEach((el) => observador.observe(el));
  } else {
    // Fallback: navegadores muito antigos — mostra tudo direto.
    elementosParaRevelar.forEach((el) => el.classList.add("visivel"));
  }
})();
