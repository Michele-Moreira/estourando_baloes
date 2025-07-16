var timerId= null; //variavel q armazena a chamada da funcao timeout

function iniciaJogo(){

	var url = window.location.search;
	
	var nivel_jogo = url.replace("?", "");

	var tempo_segundos = 0;

	if(nivel_jogo == 1){ //1fácil -> 120 segundos
		tempo_segundos = 120;
	}

	if(nivel_jogo == 2){ //2 normal -> 60 segundos
		tempo_segundos = 60;
	}

	if(nivel_jogo == 3){ //3 difícil -> 30 segundos
		tempo_segundos = 30;
	}

	//inserindo segundos no span
	document.getElementById('cronometro').innerHTML = tempo_segundos;

	//quantidade de balões
	var qtde_baloes = 80;

	cria_baloes(qtde_baloes);

	//imprimir qtde baloes inteiros
	document.getElementById('baloes_inteiros').innerHTML = qtde_baloes;
	document.getElementById('baloes_estourados').innerHTML = 0;

	contagem_tempo(tempo_segundos + 1)
}

function contagem_tempo(segundos){

	segundos = segundos - 1;

	if(segundos == -1){
		clearTimeout(timerId); // para a execução da função do settimeout
		game_over();
		return false;
	}

	document.getElementById('cronometro').innerHTML = segundos;

	timerId = setTimeout("contagem_tempo("+segundos+")", 1000);
}

function game_over(){
    remove_eventos_baloes();
    parar_jogo();

    // ⏱️ Tempo esgotado, mas ainda mostra pontuação
    let baloes_estourados = parseInt(document.getElementById('baloes_estourados').innerHTML);
    let pontos = baloes_estourados * 10;

    let recorde = localStorage.getItem("recorde");
    recorde = recorde ? parseInt(recorde) : 0;

    let mensagemFinal = `Sua pontuação: ${pontos} pontos`;

    if(pontos > recorde){
        localStorage.setItem("recorde", pontos);
        mensagemFinal += `\n🎉 Novo recorde!`;
    } else {
        mensagemFinal += `\nRecorde atual: ${recorde} pontos`;
    }

    alert("Fim de jogo, você não conseguiu estourar todos os balões a tempo.\n" + mensagemFinal);

    setTimeout(voltar_inicio, 4000);
}


function cria_baloes(qtde_baloes){

	for(var i = 1; i <= qtde_baloes; i++){

		var balao = document.createElement("img");
		balao.src = 'imagens/balao_azul_pequeno.png';
		balao.style.margin = '10px';
		balao.id = 'b' +i;
		balao.onclick = function(){ estourar(this); };

		document.getElementById('cenario').appendChild(balao);
	}
}

function estourar(e){

	var id_balao = e.id;

	document.getElementById(id_balao).setAttribute("onclick", "");
	document.getElementById(id_balao).src = 'imagens/balao_azul_pequeno_estourado.png';

	pontuacao(-1);
}
function pontuacao(acao){

	var baloes_inteiros = document.getElementById('baloes_inteiros').innerHTML
	var baloes_estourados = document.getElementById('baloes_estourados').innerHTML

	baloes_inteiros = parseInt(baloes_inteiros);
	baloes_estourados = parseInt(baloes_estourados);

	baloes_inteiros = baloes_inteiros + acao;
	baloes_estourados = baloes_estourados - acao;

	document.getElementById('baloes_inteiros').innerHTML = baloes_inteiros;
	document.getElementById('baloes_estourados').innerHTML = baloes_estourados;

	situacao_jogo(baloes_inteiros, baloes_estourados);
}

function situacao_jogo(baloes_inteiros, baloes_estourados){
    if(baloes_inteiros == 0){
        parar_jogo();

        // ⏱️ Tempo restante
        let segundosRestantes = parseInt(document.getElementById('cronometro').innerHTML);

        // 🧮 Cálculo da pontuação (ex: 10 pontos por balão + 5 por segundo restante)
        let pontos = baloes_estourados * 10 + segundosRestantes * 5;

        // 🏆 Verificar e salvar recorde
        let recorde = localStorage.getItem("recorde");
        recorde = recorde ? parseInt(recorde) : 0;

        let mensagemFinal = `Sua pontuação: ${pontos} pontos`;

        if(pontos > recorde){
            localStorage.setItem("recorde", pontos);
            mensagemFinal += `\n🎉 Novo recorde!`;
        } else {
            mensagemFinal += `\nRecorde atual: ${recorde} pontos`;
        }

        alert("Parabéns! Você estourou todos os balões!\n" + mensagemFinal);

        setTimeout(voltar_inicio, 4000);
    }
}

function parar_jogo(){
	clearTimeout(timerId);
}

function remove_eventos_baloes() {
    var i = 1; //contado para recuperar balões por id
    
    //percorre o elementos de acordo com o id e só irá sair do laço quando não houver correspondência com elemento
    while(document.getElementById('b'+i)) {
        //retira o evento onclick do elemnto
        document.getElementById('b'+i).onclick = '';
        i++; //faz a iteração da variávei i
    }
}

function voltar_inicio() {
    // Redireciona para a página de escolha do nível 
    window.location.href = "index.html";
}



