// Selecionando os elementos HTML
const campoTarefa = document.getElementById("campo-tarefa");

const botaoAdicionar = document.getElementById("botao-adicionar");

const listaTarefas = document.getElementById("lista-tarefas");

const mensagemAcessivel = document.getElementById("mensagem-acessivel");

const botaoCancelar = document.getElementById("botao-cancelar");

let tarefaEmEdicao = null;

let filtroAtual = "todas";

const botoesFiltro = document.querySelectorAll(".filtros button");

const totalTarefas = document.getElementById("total-tarefas");

const tarefasPendentes = document.getElementById("tarefas-pendentes");

const tarefasConcluidas = document.getElementById("tarefas-concluidas");

const anuncioContadores = document.getElementById("anuncio-contadores");

const campoBusca = document.getElementById("campo-busca");

const anuncioBusca = document.getElementById("anuncio-busca");

const mensagemVazia = document.getElementById("mensagem-vazia");

const campoData = document.getElementById("campo-data");

// Recupera as tarefas salvas no navegador
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];

// Salva as tarefas no navegador
function salvarTarefas() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// Atualizar os contadores
function atualizarContadores() {
  const total = tarefas.length;

  const concluidas = tarefas.filter(function (tarefa) {
    return tarefa.concluida;
  }).length;

  const pendentes = total - concluidas;

  totalTarefas.textContent = total;
  tarefasConcluidas.textContent = concluidas;
  tarefasPendentes.textContent = pendentes;
}

// Anunciar contadores
function anunciarContadores() {
  const total = tarefas.length;

  const concluidas = tarefas.filter(function (tarefa) {
    return tarefa.concluida;
  }).length;

  const pendentes = total - concluidas;

  anuncioContadores.textContent =
    `Resumo atualizado. Total de ${total} tarefas. ` +
    `${pendentes} pendentes e ${concluidas} concluídas.`;
}

// Função para adicionar tarefas
function adicionarTarefa() {
  const textoTarefa = campoTarefa.value.trim();

  if (tarefaEmEdicao !== null) {
    const tarefa = tarefas.find(function (item) {
      return item.id === tarefaEmEdicao;
    });

    tarefa.texto = textoTarefa;
    tarefa.dataVencimento = campoData.value;
    tarefaEmEdicao = null;

    salvarTarefas();
    renderizarTarefas();

    mensagemAcessivel.textContent = `Tarefa ${textoTarefa} atualizada.`;

    campoTarefa.value = "";
    campoData.value = "";
    botaoAdicionar.textContent = "Adicionar";

    return;
  }

  if (textoTarefa === "") {
    alert("Digite uma tarefa!");
    campoTarefa.focus();
    return;
  }

  // Criando uma nova tarefa
  const novaTarefa = {
    id: Date.now(),
    texto: textoTarefa,
    concluida: false,
    dataVencimento: campoData.value,
  };

  // Adicionando à lista de tarefas
  tarefas.push(novaTarefa);

  // Salvando automaticamente
  salvarTarefas();

  // Atualizando a tela
  renderizarTarefas();

  // Comunicando a inclusão
  mensagemAcessivel.textContent = `Tarefa ${textoTarefa} adicionada.`;
  anunciarContadores();

  // Limpando o campo
  campoTarefa.value = "";
  campoData.value = "";
}

// Evento de clique no botão
botaoAdicionar.addEventListener("click", adicionarTarefa);
botaoCancelar.addEventListener("click", cancelarEdicao);

// Evento da tecla Enter
campoTarefa.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    adicionarTarefa();
  }
});

// Renderizar as tarefas
function renderizarTarefas() {
  // Limpa a lista atual
  listaTarefas.innerHTML = "";
  atualizarContadores();

  // Percorre todas as tarefas
  const termoBusca = campoBusca.value.toLowerCase().trim();

  const tarefasFiltradas = tarefas.filter(function (tarefa) {
    const correspondeBusca = tarefa.texto.toLowerCase().includes(termoBusca);

    const correspondeFiltro =
      filtroAtual === "todas" ||
      (filtroAtual === "pendentes" && !tarefa.concluida) ||
      (filtroAtual === "concluidas" && tarefa.concluida);

    return correspondeBusca && correspondeFiltro;
  });

  mensagemVazia.hidden = tarefasFiltradas.length > 0;

  if (tarefasFiltradas.length === 0) {
    anuncioBusca.textContent = "Nenhuma tarefa encontrada.";
  } else if (tarefasFiltradas.length === 1) {
    anuncioBusca.textContent = "1 tarefa encontrada.";
  } else {
    anuncioBusca.textContent = `${tarefasFiltradas.length} tarefas encontradas.`;
  }

  tarefasFiltradas.forEach(function (tarefa) {
    const novaTarefa = document.createElement("li");

    if (tarefa.concluida) {
      novaTarefa.classList.add("concluida");
    }

    // Texto da tarefa
    const texto = document.createElement("span");

    texto.textContent = tarefa.texto;

    const data = document.createElement("small");

    if (tarefa.dataVencimento) {
      data.textContent = `Vencimento: ${tarefa.dataVencimento}`;
    }

    // Botão concluir
    const botaoConcluir = document.createElement("button");

    botaoConcluir.type = "button";
    botaoConcluir.textContent = tarefa.concluida ? "Reabrir" : "Concluir";

    botaoConcluir.classList.add("botao-concluir");

    botaoConcluir.setAttribute(
      "aria-label",
      `${tarefa.concluida ? "Reabrir" : "Concluir"} tarefa: ${tarefa.texto}`,
    );

    botaoConcluir.setAttribute("aria-pressed", String(tarefa.concluida));

    botaoConcluir.addEventListener("click", function () {
      tarefa.concluida = !tarefa.concluida;

      salvarTarefas();
      renderizarTarefas();

      mensagemAcessivel.textContent = tarefa.concluida
        ? `Tarefa ${tarefa.texto} concluída.`
        : `Tarefa ${tarefa.texto} reaberta.`;
      anunciarContadores();
    });

    // Botão Editar
    const botaoEditar = document.createElement("button");

    botaoEditar.type = "button";
    botaoEditar.textContent = "Editar";
    botaoEditar.classList.add("botao-editar");

    botaoEditar.setAttribute("aria-label", `Editar tarefa: ${tarefa.texto}`);

    botaoEditar.addEventListener("click", function () {
      tarefaEmEdicao = tarefa.id;

      campoTarefa.value = tarefa.texto;
      campoData.value = tarefa.dataVencimento || "";
      campoTarefa.focus();

      botaoAdicionar.textContent = "Salvar edição";
      botaoCancelar.hidden = false;

      mensagemAcessivel.textContent = `Editando tarefa: ${tarefa.texto}.`;
    });

    // Botão excluir
    const botaoExcluir = document.createElement("button");

    botaoExcluir.type = "button";
    botaoExcluir.textContent = "Excluir";

    botaoExcluir.classList.add("botao-excluir");

    botaoExcluir.setAttribute("aria-label", `Excluir tarefa: ${tarefa.texto}`);

    botaoExcluir.addEventListener("click", function () {
      tarefas = tarefas.filter(function (item) {
        return item.id !== tarefa.id;
      });

      salvarTarefas();
      renderizarTarefas();

      mensagemAcessivel.textContent = `Tarefa ${tarefa.texto} excluída.`;
      anunciarContadores();
    });

    // Montando o item
    novaTarefa.appendChild(texto);
    novaTarefa.appendChild(data);
    novaTarefa.appendChild(botaoConcluir);
    novaTarefa.appendChild(botaoEditar);
    novaTarefa.appendChild(botaoExcluir);
    
    listaTarefas.appendChild(novaTarefa);
  });
}

// Exibe as tarefas salvas ao abrir a aplicação
renderizarTarefas();

// Função para cancelar a edição da tarefa
function cancelarEdicao() {
  tarefaEmEdicao = null;

  campoTarefa.value = "";
  campoData.value = "";

  botaoAdicionar.textContent = "Adicionar";

  botaoCancelar.hidden = true;

  mensagemAcessivel.textContent = "Edição cancelada.";

  campoTarefa.focus();
}

// Eventos dos filtros
botoesFiltro.forEach(function (botao) {
  botao.addEventListener("click", function () {
    filtroAtual = botao.dataset.filtro;

    botoesFiltro.forEach(function (item) {
      item.setAttribute("aria-pressed", String(item === botao));
    });

    renderizarTarefas();
  });
});

campoBusca.addEventListener("input", function () {
  renderizarTarefas();
});
