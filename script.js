document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================================
     1. DADOS E CONFIGURAÇÕES DO SISTEMA
     ========================================================================== */

  // Mapeamento das redes globais de cinema (Slide 2)
  const chainsData = {
    amc: {
      title: "AMC Theatres",
      description: "Maior rede de cinemas do mundo, opera massivamente nos Estados Unidos e na Europa (sob as marcas Odeon e UCI Cinemas), oferecendo salas premium e projeção digital de última geração."
    },
    cineworld: {
      title: "Cineworld",
      description: "Uma das maiores exibidoras globais, possui forte presença no Reino Unido, Europa Oriental e nos Estados Unidos sob a icônica marca Regal Cinemas."
    },
    cinepolis: {
      title: "Cinépolis",
      description: "Líder na América Latina e quarta maior rede do mundo, é famosa pelas suas salas VIP pioneiras, projeção a laser de alta fidelidade e forte presença no mercado brasileiro."
    },
    cinemark: {
      title: "Cinemark",
      description: "Uma das redes mais consagradas das Américas, destaca-se pela alta fidelidade de projeção digital de imagem e som, e pelas salas XD com telas gigantes."
    },
    cgv: {
      title: "CGV (CJ CGV)",
      description: "A maior rede de cinemas da Coreia do Sul e uma das maiores da Ásia, famosa por introduzir conceitos de salas inovadores como 4DX, ScreenX e poltronas ergonômicas."
    },
    uci: {
      title: "UCI Cinemas",
      description: "Presente no Brasil, Portugal, Alemanha e Itália. Oferece complexos modernos integrados com as principais tecnologias de som Dolby Atmos e salas IMAX/XPLUS."
    },
    pvr: {
      title: "PVR INOX",
      description: "A maior exibidora de cinema da Índia, resultante da fusão das gigantes PVR e INOX, operando salas luxuosas focadas em serviços VIP e culinária gourmet de cinema."
    },
    vue: {
      title: "Vue Cinemas",
      description: "Uma das principais operadoras europeias, presente no Reino Unido, Alemanha e Dinamarca, conhecida por modernizar a experiência de áudio e prover assentos totalmente reclináveis."
    }
  };

  // Mapeamento dos Cinemas / Cidades (Slide 4)
  const cinemasData = {
    "belem-grao": {
      name: "UCI Shopping Grão Pará",
      city: "Belém, Brasil",
      currency: "R$",
      stdPrice: 30.00,
      vipPrice: 60.00
    },
    "belem-metro": {
      name: "UCI Shopping Metrópole",
      city: "Belém, Brasil",
      currency: "R$",
      stdPrice: 28.00,
      vipPrice: 55.00
    },
    "portland-century": {
      name: "Century Theatre 16",
      city: "Portland, EUA",
      currency: "US$",
      stdPrice: 12.00,
      vipPrice: 22.00
    },
    "milao-bicocca": {
      name: "UCI Cinemas Bicocca",
      city: "Milão, Itália",
      currency: "€",
      stdPrice: 10.50,
      vipPrice: 19.00
    }
  };

  // Mapeamento dos Nomes dos Filmes (Slide 3)
  const moviesData = {
    prada2: "O Diabo Veste Prada 2",
    michael: "Michael (IMAX)",
    mk2: "Mortal Kombat 2"
  };

  /* ==========================================================================
     2. REDES GLOBAIS - SELEÇÃO DE TABS
     ========================================================================== */

  const chainTabs = document.querySelectorAll(".chain-tab");
  const chainTitle = document.getElementById("chain-title");
  const chainDescription = document.getElementById("chain-description");

  chainTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Remover classe ativa de todas
      chainTabs.forEach(t => t.classList.remove("is-active"));
      // Adicionar na clicada
      tab.classList.add("is-active");

      const chainKey = tab.dataset.chain;
      if (chainsData[chainKey]) {
        chainTitle.textContent = chainsData[chainKey].title;
        chainDescription.textContent = chainsData[chainKey].description;
      }
    });
  });

  /* ==========================================================================
     3. EFEITO 3D PARALLAX TILT - CARD DE FILMES (WOW FEATURE)
     ========================================================================== */

  const tiltContainers = document.querySelectorAll(".movie-tilt-container");

  tiltContainers.forEach(container => {
    const card = container.querySelector(".movie-card");

    container.addEventListener("mousemove", (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left; // Posição X do mouse dentro do card
      const y = e.clientY - rect.top;  // Posição Y do mouse dentro do card

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calcula o ângulo de rotação (máximo 12 graus)
      const rotateX = ((centerY - y) / centerY) * 12;
      const rotateY = ((x - centerX) / centerX) * 12;

      // Aplica a transformação 3D com transição suave
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    container.addEventListener("mouseleave", () => {
      // Reseta a rotação suavemente
      card.style.transform = "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  });

  /* ==========================================================================
     4. SIMULADOR DE BILHETERIA INTERATIVA
     ========================================================================== */

  const selectCinema = document.getElementById("select-cinema");
  const selectMovie = document.getElementById("select-movie");
  const sessionChips = document.querySelectorAll(".chip-session");
  const seatsContainer = document.getElementById("seats-container");
  const selectedSeatsList = document.getElementById("selected-seats-list");
  const summaryCurrency = document.getElementById("summary-currency");
  const summaryTotal = document.getElementById("summary-total");
  const countInteira = document.getElementById("count-inteira");
  const countMeia = document.getElementById("count-meia");
  const labelPriceInteira = document.getElementById("label-price-inteira");
  const labelPriceMeia = document.getElementById("label-price-meia");
  const btnCheckout = document.getElementById("btn-checkout");

  // Estado atual do Simulador
  let currentCinema = selectCinema.value;
  let currentMovie = selectMovie.value;
  let currentSessionTime = "15:30";
  let currentSessionFormat = "Dublado / Standard";
  let selectedSeats = [];
  let meiaCount = 0;
  let inteiraCount = 0;

  // Gerador de mapa de ocupação fixa por cinema/sessão para manter consistência nas interações
  const occupiedSeatsMap = {};

  function getOccupiedSeatsKey() {
    return `${currentCinema}_${currentMovie}_${currentSessionTime}`;
  }

  function getOccupiedSeats() {
    const key = getOccupiedSeatsKey();
    if (!occupiedSeatsMap[key]) {
      // Gera de 10 a 18 assentos ocupados aleatoriamente
      const occupied = [];
      const rows = ["A", "B", "C", "D", "E", "F"];
      const totalToOccupy = Math.floor(Math.random() * 9) + 10;
      
      while (occupied.length < totalToOccupy) {
        const row = rows[Math.floor(Math.random() * rows.length)];
        const col = Math.floor(Math.random() * 8) + 1;
        const seatId = `${row}${col}`;
        if (!occupied.includes(seatId)) {
          occupied.push(seatId);
        }
      }
      occupiedSeatsMap[key] = occupied;
    }
    return occupiedSeatsMap[key];
  }

  // Prepara as labels de preços de ingressos baseados no cinema escolhido
  function updateTicketPricesLabels() {
    const cinema = cinemasData[currentCinema];
    const curr = cinema.currency;
    
    labelPriceInteira.textContent = `${curr} ${cinema.stdPrice.toFixed(2)} cada`;
    labelPriceMeia.textContent = `${curr} ${(cinema.stdPrice / 2).toFixed(2)} cada`;
    summaryCurrency.textContent = `${cinema.city} (${curr})`;
  }

  // Renderiza o mapa de assentos (A-F, 1-8)
  function renderSeatsMap() {
    seatsContainer.innerHTML = "";
    selectedSeats = [];
    inteiraCount = 0;
    meiaCount = 0;
    updateCounterDisplays();

    const rows = ["A", "B", "C", "D", "E", "F"];
    const occupied = getOccupiedSeats();

    rows.forEach(row => {
      for (let col = 1; col <= 8; col++) {
        const seatId = `${row}${col}`;
        const seatElement = document.createElement("button");
        seatElement.type = "button";
        seatElement.classList.add("seat");
        seatElement.textContent = seatId;
        seatElement.setAttribute("aria-label", `Poltrona ${seatId}`);

        const isOccupied = occupied.includes(seatId);
        const isVip = (row === "E" || row === "F");

        if (isOccupied) {
          seatElement.classList.add("seat-occupied");
          seatElement.disabled = true;
        } else if (isVip) {
          seatElement.classList.add("seat-vip");
        } else {
          seatElement.classList.add("seat-available");
        }

        seatElement.addEventListener("click", () => handleSeatClick(seatId, seatElement, isVip));
        seatsContainer.appendChild(seatElement);
      }
    });

    updateCalculation();
  }

  // Lógica ao clicar em um assento
  function handleSeatClick(seatId, seatElement, isVip) {
    if (selectedSeats.includes(seatId)) {
      // Deselecionar
      selectedSeats = selectedSeats.filter(id => id !== seatId);
      seatElement.classList.remove("seat-selected");
    } else {
      // Selecionar
      selectedSeats.push(seatId);
      seatElement.classList.add("seat-selected");
    }

    // Gerenciamento automático de contadores: total de ingressos = total de assentos selecionados
    const totalSelected = selectedSeats.length;
    if (totalSelected === 0) {
      inteiraCount = 0;
      meiaCount = 0;
    } else {
      // Mantém a meia-entrada no limite, ajustando a inteira
      if (meiaCount > totalSelected) {
        meiaCount = 0;
      }
      inteiraCount = totalSelected - meiaCount;
    }

    updateCounterDisplays();
    updateCalculation();
  }

  // Atualiza os contadores na UI
  function updateCounterDisplays() {
    countInteira.textContent = inteiraCount;
    countMeia.textContent = meiaCount;
  }

  // Lógica de cliques nos botões de mais/menos do contador
  document.querySelectorAll(".btn-counter").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      const action = btn.dataset.action;
      const totalSelected = selectedSeats.length;

      if (totalSelected === 0) return; // Só permite se houver assentos selecionados

      if (type === "meia") {
        if (action === "plus" && meiaCount < totalSelected) {
          meiaCount++;
          inteiraCount--;
        } else if (action === "minus" && meiaCount > 0) {
          meiaCount--;
          inteiraCount++;
        }
      } else if (type === "inteira") {
        if (action === "plus" && inteiraCount < totalSelected) {
          inteiraCount++;
          meiaCount--;
        } else if (action === "minus" && inteiraCount > 0) {
          inteiraCount--;
          meiaCount++;
        }
      }

      updateCounterDisplays();
      updateCalculation();
    });
  });

  // Calcula o valor total e atualiza na UI
  function updateCalculation() {
    const cinema = cinemasData[currentCinema];
    const currency = cinema.currency;

    if (selectedSeats.length === 0) {
      selectedSeatsList.textContent = "Nenhuma";
      summaryTotal.textContent = `${currency} 0,00`;
      btnCheckout.disabled = true;
      return;
    }

    selectedSeatsList.textContent = selectedSeats.sort().join(", ");
    btnCheckout.disabled = false;

    // Classifica os assentos em VIP e Standard para calcular preços
    let vipSeatsCount = 0;
    let stdSeatsCount = 0;

    selectedSeats.forEach(seatId => {
      const row = seatId.charAt(0);
      if (row === "E" || row === "F") {
        vipSeatsCount++;
      } else {
        stdSeatsCount++;
      }
    });

    // Distribui o desconto da Meia-entrada de forma otimizada para o usuário (aplicado primeiro nos assentos VIP)
    let tempMeia = meiaCount;
    let totalValue = 0;

    // Assentos VIP
    for (let i = 0; i < vipSeatsCount; i++) {
      if (tempMeia > 0) {
        totalValue += cinema.vipPrice / 2;
        tempMeia--;
      } else {
        totalValue += cinema.vipPrice;
      }
    }

    // Assentos Standard
    for (let i = 0; i < stdSeatsCount; i++) {
      if (tempMeia > 0) {
        totalValue += cinema.stdPrice / 2;
        tempMeia--;
      } else {
        totalValue += cinema.stdPrice;
      }
    }

    summaryTotal.textContent = `${currency} ${totalValue.toFixed(2)}`;
  }

  /* ==========================================================================
     5. DISPARADORES DE EVENTO NO SIMULADOR
     ========================================================================== */

  // Alteração de Cinema
  selectCinema.addEventListener("change", () => {
    currentCinema = selectCinema.value;
    updateTicketPricesLabels();
    renderSeatsMap();
  });

  // Alteração de Filme
  selectMovie.addEventListener("change", () => {
    currentMovie = selectMovie.value;
    renderSeatsMap();
  });

  // Alteração de Sessão (Chips de horários)
  sessionChips.forEach(chip => {
    chip.addEventListener("click", () => {
      sessionChips.forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      currentSessionTime = chip.dataset.time;
      currentSessionFormat = chip.dataset.format;
      renderSeatsMap();
    });
  });

  // Botões de Compra Rápida nos Cards de Filmes
  document.querySelectorAll("[data-select-movie]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const movieId = btn.dataset.selectMovie;
      selectMovie.value = movieId;
      currentMovie = movieId;
      renderSeatsMap();
    });
  });

  /* ==========================================================================
     6. TICKET MODAL - FECHAMENTO E EMISSÃO (CHECKOUT)
     ========================================================================== */

  const ticketModal = document.getElementById("ticket-modal");
  const btnCloseTicket = document.getElementById("btn-close-ticket");
  const btnCopyTicket = document.getElementById("btn-copy-ticket");

  // Elementos do Bilhete
  const ticketMovieTitle = document.getElementById("ticket-movie-title");
  const ticketCinemaName = document.getElementById("ticket-cinema-name");
  const ticketCinemaCity = document.getElementById("ticket-cinema-city");
  const ticketDateTime = document.getElementById("ticket-date-time");
  const ticketFormat = document.getElementById("ticket-format");
  const ticketSeatsList = document.getElementById("ticket-seats-list");
  const ticketPriceTotal = document.getElementById("ticket-price-total");
  const ticketRefCode = document.getElementById("ticket-ref-code");

  // Função para abrir o modal
  function openTicketModal() {
    const cinema = cinemasData[currentCinema];
    
    // Inserir valores dinâmicos no bilhete de vidro
    ticketMovieTitle.textContent = moviesData[currentMovie];
    ticketCinemaName.textContent = cinema.name;
    ticketCinemaCity.textContent = cinema.city;
    ticketDateTime.textContent = `Hoje • ${currentSessionTime}`;
    ticketFormat.textContent = currentSessionFormat;
    ticketSeatsList.textContent = selectedSeats.sort().join(", ");
    ticketPriceTotal.textContent = summaryTotal.textContent;

    // Gera um código de reserva fictício premium
    const randomRef = "TK-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-08";
    ticketRefCode.textContent = randomRef;

    ticketModal.classList.add("is-open");
    ticketModal.setAttribute("aria-hidden", "false");
  }

  // Fechar o modal
  function closeTicketModal() {
    ticketModal.classList.remove("is-open");
    ticketModal.setAttribute("aria-hidden", "true");
    
    // Opcional: Reinicia o mapa de assentos após fechar a compra
    renderSeatsMap();
  }

  btnCheckout.addEventListener("click", openTicketModal);
  btnCloseTicket.addEventListener("click", closeTicketModal);

  // Fecha clicando fora da caixinha (no background escuro)
  ticketModal.addEventListener("click", (e) => {
    if (e.target === ticketModal) {
      closeTicketModal();
    }
  });

  // Fecha com a tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && ticketModal.classList.contains("is-open")) {
      closeTicketModal();
    }
  });

  // Botão Copiar Código do Bilhete
  btnCopyTicket.addEventListener("click", () => {
    const code = ticketRefCode.textContent;
    const movie = ticketMovieTitle.textContent;
    const cinema = ticketCinemaName.textContent;
    const seats = ticketSeatsList.textContent;
    const total = ticketPriceTotal.textContent;

    const formattedText = `🍿 Reserva Confirmada - Equipe 08 🍿\nCódigo: ${code}\nFilme: ${movie}\nCinema: ${cinema}\nPoltronas: ${seats}\nValor: ${total}\nSite: https://albertomateus9.github.io/minihacka-2026-p3-redes-08-cinema-internacional/`;

    navigator.clipboard.writeText(formattedText).then(() => {
      btnCopyTicket.textContent = "Copiado! ✓";
      btnCopyTicket.style.borderColor = "var(--secondary)";
      btnCopyTicket.style.color = "var(--secondary)";

      setTimeout(() => {
        btnCopyTicket.textContent = "Copiar Código";
        btnCopyTicket.style.borderColor = "";
        btnCopyTicket.style.color = "";
      }, 2000);
    }).catch(err => {
      console.error("Erro ao copiar para a área de transferência: ", err);
    });
  });

  /* ==========================================================================
     7. INICIALIZAÇÃO DO SISTEMA
     ========================================================================== */
  
  updateTicketPricesLabels();
  renderSeatsMap();
});
