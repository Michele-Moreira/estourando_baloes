var timerId = null; //variavel q armazena a chamada da funcao timeout
var canvas;
var ctx;
var baloes = []; // Array para armazenar os objetos dos balões
var qtde_baloes_total = 0; // Quantidade inicial de balões

// Objeto para armazenar as imagens dos balões
var imagensBaloes = {};

function carregarImagens(callback) {
    let loadedCount = 0;
    const totalImages = 3; // Quantidade de imagens a carregar

    const onLoad = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
            callback(); // Chama o callback quando todas as imagens estiverem carregadas
        }
    };

    imagensBaloes.balao_azul_pequeno = new Image();
    imagensBaloes.balao_azul_pequeno.src = 'imagens/balao_azul_pequeno.png';
    imagensBaloes.balao_azul_pequeno.onload = onLoad;
    
    imagensBaloes.balao_azul_pequeno_estourado = new Image();
    imagensBaloes.balao_azul_pequeno_estourado.src = 'imagens/balao_azul_pequeno_estourado.png';
    imagensBaloes.balao_azul_pequeno_estourado.onload = onLoad;

    imagensBaloes.cenario = new Image();
    imagensBaloes.cenario.src = 'imagens/cenario.png';
    imagensBaloes.cenario.onload = onLoad;
}


function iniciaJogo() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Carrega as imagens antes de iniciar o jogo
    carregarImagens(() => {
        ajustaTamanhoCanvas(); // Ajusta o canvas após as imagens serem carregadas
        window.addEventListener('resize', ajustaTamanhoCanvas); // Redimensiona o canvas quando a janela muda de tamanho

        var url = window.location.search;
        var nivel_jogo = url.replace("?", "");
        var tempo_segundos = 0;

        if (nivel_jogo == 1) { //1fácil -> 120 segundos
            tempo_segundos = 120;
        } else if (nivel_jogo == 2) { //2 normal -> 60 segundos
            tempo_segundos = 60;
        } else if (nivel_jogo == 3) { //3 difícil -> 30 segundos
            tempo_segundos = 30;
        }

        // A quantidade de balões agora será determinada pela grade
        // qtde_baloes_total será ajustada dentro de cria_baloes
        
        cria_baloes_em_grade(true); // Chama a nova função para criar balões em grade

        document.getElementById('cronometro').innerHTML = tempo_segundos;
        document.getElementById('baloes_estourados').innerHTML = 0; // Sempre começa com 0 estourados

        contagem_tempo(tempo_segundos + 1);

        // Adiciona event listeners para mouse e toque
        canvas.addEventListener('mousedown', function(event) {
            handleClickOrTouch(event.clientX, event.clientY);
        });
        canvas.addEventListener('touchstart', function(event) {
            event.preventDefault(); // Previne o scroll da página
            const touch = event.touches[0];
            handleClickOrTouch(touch.clientX, touch.clientY);
        });

        // Loop de desenho
        requestAnimationFrame(desenhaJogo);
    });
}

function ajustaTamanhoCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    // Recria os balões quando o tamanho do canvas muda para alinhá-los novamente
    cria_baloes_em_grade(true); // true indica que é um redesenho
    desenhaJogo(); // Redesenha para garantir que o cenário e balões se ajustem
}

function desenhaJogo() {
    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o cenário (a imagem de fundo já está no CSS, mas se quiser desenhar no canvas:
    // ctx.drawImage(imagensBaloes.cenario, 0, 0, canvas.width, canvas.height);

    // Desenha os balões
    for (let i = 0; i < baloes.length; i++) {
        const balao = baloes[i];
        if (balao.status === 'inteiro') {
            ctx.drawImage(imagensBaloes.balao_azul_pequeno, balao.x, balao.y, balao.width, balao.height);
        } else if (balao.status === 'estourado') {
            ctx.drawImage(imagensBaloes.balao_azul_pequeno_estourado, balao.x, balao.y, balao.width, balao.height);
        }
    }
    
    // Continua o loop de desenho
    requestAnimationFrame(desenhaJogo);
}

function contagem_tempo(segundos) {
    segundos = segundos - 1;

    if (segundos == -1) {
        clearTimeout(timerId);
        game_over();
        return false;
    }

    document.getElementById('cronometro').innerHTML = segundos;
    timerId = setTimeout("contagem_tempo(" + segundos + ")", 1000);
}

function game_over() {
    parar_jogo();

    let baloes_estourados = parseInt(document.getElementById('baloes_estourados').innerHTML);
    let pontos = baloes_estourados * 10;

    let recorde = localStorage.getItem("recorde");
    recorde = recorde ? parseInt(recorde) : 0;

    let mensagemFinal = `Sua pontuação: ${pontos} pontos`;

    if (pontos > recorde) {
        localStorage.setItem("recorde", pontos);
        mensagemFinal += `\n🎉 Novo recorde!`;
    } else {
        mensagemFinal += `\nRecorde atual: ${recorde} pontos`;
    }

    alert("Fim de jogo, você não conseguiu estourar todos os balões a tempo.\n" + mensagemFinal);
    setTimeout(voltar_inicio, 4000);
}

// NOVA FUNÇÃO: cria_baloes_em_grade
function cria_baloes_em_grade(redesenhar = false) {
    if (!redesenhar) {
        baloes = []; // Limpa o array de balões apenas se não for redesenhar
    }

    // Tamanho base do balão (pode ajustar conforme a imagem)
    const balao_width = 50; 
    const balao_height = 50;
    const espacamento_horizontal = 15; // Espaçamento entre balões na horizontal
    const espacamento_vertical = 10;   // Espaçamento entre linhas de balões

    // Calcula quantos balões cabem na largura do canvas
    const baloes_por_linha = Math.floor(canvas.width / (balao_width + espacamento_horizontal));
    
    // Calcula o espaçamento extra para centralizar os balões
    const largura_total_baloes = baloes_por_linha * (balao_width + espacamento_horizontal);
    const espaco_restante_horizontal = canvas.width - largura_total_baloes;
    const offset_x_inicial = espaco_restante_horizontal / 2;


    let current_balao_index = 0;
    // Loop para preencher o canvas de cima para baixo
    for (let y_pos = espacamento_vertical / 2; y_pos < canvas.height - balao_height; y_pos += (balao_height + espacamento_vertical)) {
        for (let x_pos = offset_x_inicial; x_pos < canvas.width - balao_width; x_pos += (balao_width + espacamento_horizontal)) {
            
            if (!redesenhar) {
                baloes.push({
                    id: 'b' + current_balao_index,
                    x: x_pos,
                    y: y_pos,
                    width: balao_width,
                    height: balao_height,
                    status: 'inteiro'
                });
            } else if (current_balao_index < baloes.length) { // Se estiver redesenhando, atualiza as posições dos balões existentes
                baloes[current_balao_index].x = x_pos;
                baloes[current_balao_index].y = y_pos;
                baloes[current_balao_index].width = balao_width;
                baloes[current_balao_index].height = balao_height;
            } else {
                // Caso o redimensionamento crie espaço para mais balões, adicione-os
                baloes.push({
                    id: 'b' + current_balao_index,
                    x: x_pos,
                    y: y_pos,
                    width: balao_width,
                    height: balao_height,
                    status: 'inteiro'
                });
            }
            current_balao_index++;
        }
    }

    // Se estiver redesenhando e o novo grid for menor, remova os balões excedentes
    if (redesenhar && current_balao_index < baloes.length) {
        baloes.splice(current_balao_index);
    }

    // Atualiza a quantidade total de balões
    qtde_baloes_total = baloes.length;
    document.getElementById('baloes_inteiros').innerHTML = qtde_baloes_total;
}

function handleClickOrTouch(clientX, clientY) {
    // Obtém a posição do canvas na tela
    const rect = canvas.getBoundingClientRect();
    
    // Converte as coordenadas do clique/toque para coordenadas relativas ao canvas
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    // Procura por um balão que foi clicado/tocado
    for (let i = baloes.length - 1; i >= 0; i--) { // Começa do último para estourar os que estão "por cima"
        const balao = baloes[i];
        if (balao.status === 'inteiro' &&
            mouseX >= balao.x &&
            mouseX <= balao.x + balao.width &&
            mouseY >= balao.y &&
            mouseY <= balao.y + balao.height) {
            
            estourar(balao);
            break; // Estoura apenas um balão por clique/toque
        }
    }
}

function estourar(balao) {
    balao.status = 'estourado';
    pontuacao(-1);
    desenhaJogo(); // Redesenha imediatamente para mostrar o balão estourado
}

function pontuacao(acao) {
    var baloes_inteiros_elem = document.getElementById('baloes_inteiros');
    var baloes_estourados_elem = document.getElementById('baloes_estourados');

    var baloes_inteiros = parseInt(baloes_inteiros_elem.innerHTML);
    var baloes_estourados = parseInt(baloes_estourados_elem.innerHTML);

    baloes_inteiros = baloes_inteiros + acao;
    baloes_estourados = baloes_estourados - acao;

    baloes_inteiros_elem.innerHTML = baloes_inteiros;
    baloes_estourados_elem.innerHTML = baloes_estourados;

    situacao_jogo(baloes_inteiros, baloes_estourados);
}

function situacao_jogo(baloes_inteiros, baloes_estourados) {
    if (baloes_inteiros == 0) {
        parar_jogo();

        let segundosRestantes = parseInt(document.getElementById('cronometro').innerHTML);
        let pontos = baloes_estourados * 10 + segundosRestantes * 5;

        let recorde = localStorage.getItem("recorde");
        recorde = recorde ? parseInt(recorde) : 0;

        let mensagemFinal = `Sua pontuação: ${pontos} pontos`;

        if (pontos > recorde) {
            localStorage.setItem("recorde", pontos);
            mensagemFinal += `\n🎉 Novo recorde!`;
        } else {
            mensagemFinal += `\nRecorde atual: ${recorde} pontos`;
        }

        alert("Parabéns! Você estourou todos os balões!\n" + mensagemFinal);
        setTimeout(voltar_inicio, 4000);
    }
}

function parar_jogo() {
    clearTimeout(timerId);
}

function voltar_inicio() {
    window.location.href = "index.html";
}