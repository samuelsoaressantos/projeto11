document.addEventListener("DOMContentLoaded", function () {
    const modalLogin = document.getElementById("modal-login");
    const btnCancelar = document.getElementById("btn-cancelar");
    const btnEntrar = document.getElementById("btn-entrar");
    const btnIrCadastro = document.getElementById("btn-ir-cadastro");
    const btnLogin = document.getElementById("btn-login");
    const mensagemErro = document.getElementById("mensagem-erro");
    const totalLikes = document.getElementById("total-likes");
    const totalDislikes = document.getElementById("total-dislikes");
    const btnCadastrarPet = document.getElementById("btn-cadastrar-pet");
    const modalCadastrarPet = document.getElementById("modal-cadastrar-pet");
    const btnCancelarPet = document.getElementById("btn-cancelar-pet");
    const btnSalvarPet = document.getElementById("btn-salvar-pet");
    const mensagemErroPet = document.getElementById("mensagem-erro-pet");
    const modalEditarPet = document.getElementById("modal-editar-pet");
    const btnCancelarEditar = document.getElementById("btn-cancelar-editar");
    const btnSalvarEditar = document.getElementById("btn-salvar-editar");
    const mensagemErroEditar = document.getElementById("mensagem-erro-editar");
    const btnMinhasPublicacoes = document.getElementById("btn-minhas-publicacoes");
    const btnVoltarInicial = document.getElementById("btn-voltar-inicial");
    let usuarioLogado = localStorage.getItem('usuarioLogado');
    let usuarioLogadoId = localStorage.getItem('usuarioLogadoId');

    function atualizarInterfaceLogin() {
        if (usuarioLogado && btnLogin) {
            btnLogin.textContent = `Olá, ${usuarioLogado}`;
            if (btnIrCadastro) btnIrCadastro.style.display = "none";
            if (btnCadastrarPet) btnCadastrarPet.style.display = "block";
            if (btnMinhasPublicacoes) btnMinhasPublicacoes.style.display = "block";
            if (btnVoltarInicial) btnVoltarInicial.style.display = "block";
            let btnSair = document.getElementById("btn-sair");
            if (!btnSair) {
                btnSair = document.createElement("button");
                btnSair.id = "btn-sair";
                btnSair.textContent = "Sair";
                btnSair.style.backgroundColor = "#D97014";
                btnSair.style.color = "white";
                btnSair.style.border = "none";
                btnSair.style.padding = "10px 20px";
                btnSair.style.borderRadius = "20px";
                btnSair.style.cursor = "pointer";
                btnIrCadastro.parentNode.insertBefore(btnSair, btnIrCadastro.nextSibling);

                btnSair.addEventListener("click", () => {
                    localStorage.removeItem('usuarioLogado');
                    localStorage.removeItem('usuarioLogadoId');
                    usuarioLogado = null;
                    usuarioLogadoId = null;
                    location.reload();
                });
            }
        } else {
            if (btnIrCadastro) btnIrCadastro.style.display = "block";
            if (btnCadastrarPet) btnCadastrarPet.style.display = "none";
            if (btnMinhasPublicacoes) btnMinhasPublicacoes.style.display = "none";
            if (btnVoltarInicial) btnVoltarInicial.style.display = "none";
            const btnSair = document.getElementById("btn-sair");
            if (btnSair) btnSair.remove();
        }
    }

    atualizarInterfaceLogin();

    if (btnIrCadastro) {
        btnIrCadastro.addEventListener("click", () => {
            window.location.href = "cadastro.html";
        });
    }

    if (btnLogin) {
        btnLogin.addEventListener("click", function () {
            if (modalLogin && !usuarioLogado) modalLogin.style.display = "block";
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener("click", function () {
            if (modalLogin) modalLogin.style.display = "none";
        });
    }

    if (btnEntrar) {
        btnEntrar.addEventListener("click", function () {
            const nickname = document.getElementById("nickname").value;
            const senha = document.getElementById("senha").value;

            fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, senha })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('usuarioLogado', nickname);
                    localStorage.setItem('usuarioLogadoId', data.usuarioId);
                    usuarioLogado = nickname;
                    usuarioLogadoId = data.usuarioId;
                    if (modalLogin) modalLogin.style.display = "none";
                    atualizarInterfaceLogin();
                    carregarPublicacoes();
                } else if (mensagemErro) {
                    mensagemErro.textContent = data.message;
                }
            })
            .catch(error => {
                console.error('Erro ao fazer login:', error);
                if (mensagemErro) mensagemErro.textContent = "Ocorreu um erro. Tente novamente.";
            });
        });
    }

    if (btnCadastrarPet) {
        btnCadastrarPet.addEventListener("click", () => {
            if (modalCadastrarPet) modalCadastrarPet.style.display = "block";
        });
    }

    if (btnCancelarPet) {
        btnCancelarPet.addEventListener("click", () => {
            if (modalCadastrarPet) modalCadastrarPet.style.display = "none";
            limparModalPet();
        });
    }

    if (btnSalvarPet) {
        btnSalvarPet.addEventListener("click", () => {
            const fotoInput = document.getElementById("foto-pet");
            const nomePet = document.getElementById("nome-pet").value;
            const localPet = document.getElementById("local-pet").value;
            const cidadePet = document.getElementById("cidade-pet").value;

            if (!fotoInput.files[0] || !nomePet || !localPet || !cidadePet) {
                if (mensagemErroPet) mensagemErroPet.textContent = "Todos os campos são obrigatórios.";
                return;
            }

            const formData = new FormData();
            formData.append("foto", fotoInput.files[0]);
            formData.append("nome_pet", nomePet);
            formData.append("local", localPet);
            formData.append("cidade", cidadePet);
            formData.append("usuarioid", usuarioLogadoId);

            fetch('http://localhost:3000/cadastrar-pet', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (modalCadastrarPet) modalCadastrarPet.style.display = "none";
                    limparModalPet();
                    carregarPublicacoes();
                } else if (mensagemErroPet) {
                    mensagemErroPet.textContent = data.message;
                }
            })
            .catch(error => {
                console.error('Erro ao cadastrar pet:', error);
                if (mensagemErroPet) mensagemErroPet.textContent = "Ocorreu um erro. Tente novamente.";
            });
        });
    }

    if (btnMinhasPublicacoes) {
        btnMinhasPublicacoes.addEventListener("click", () => {
            window.location.href = "minhas-publicacoes.html";
        });
    }

    if (btnVoltarInicial) {
        btnVoltarInicial.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    function limparModalPet() {
        document.getElementById("foto-pet").value = "";
        document.getElementById("nome-pet").value = "";
        document.getElementById("local-pet").value = "";
        document.getElementById("cidade-pet").value = "";
        if (mensagemErroPet) mensagemErroPet.textContent = "";
    }

    const formCadastro = document.getElementById("form-cadastro");
    if (formCadastro) {
        formCadastro.addEventListener("submit", (event) => {
            event.preventDefault();
            const nome = document.getElementById("nome-cadastro").value;
            const email = document.getElementById("email-cadastro").value;
            const nickname = document.getElementById("nickname-cadastro").value;
            const senha = document.getElementById("senha-cadastro").value;

            fetch('http://localhost:3000/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, nickname, senha })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('usuarioLogado', nickname);
                    localStorage.setItem('usuarioLogadoId', data.usuarioId);
                    usuarioLogado = nickname;
                    usuarioLogadoId = data.usuarioId;
                    alert("Cadastro realizado com sucesso!");
                    window.location.href = "index.html";
                } else {
                    const mensagemErro = document.getElementById("mensagem-erro");
                    if (mensagemErro) mensagemErro.textContent = data.message;
                }
            })
            .catch(error => {
                console.error('Erro ao fazer cadastro:', error);
                const mensagemErro = document.getElementById("mensagem-erro");
                if (mensagemErro) mensagemErro.textContent = "Ocorreu um erro. Tente novamente.";
            });
        });
    }

    async function carregarPublicacoes() {
        if (window.location.pathname.includes("minhas-publicacoes.html")) {
            await carregarMinhasPublicacoes();
        } else {
            const response = await fetch('/api/publicacoes');
            const data = await response.json();
            if (data.success) {
                const principal = document.querySelector('.principal');
                principal.innerHTML = '<h2>Publicações</h2>';
                data.publicacoes.forEach(pub => {
                    const publicacao = document.createElement('div');
                    publicacao.classList.add('publicacao');
                    publicacao.setAttribute('data-publicacao-id', pub.id_publicacao);
                    publicacao.setAttribute('data-usuario-id', pub.usuarioid);
                    publicacao.innerHTML = `
                        <img src="${pub.foto}" width="100%" alt="${pub.nome_pet}">
                        <h3>${pub.nome_pet}</h3>
                        <p>${pub.local} - ${pub.cidade}</p>
                        <div class="interacoes">
                            <img src="images/flecha_cima_vazia.svg" alt="Like" class="like">
                            <span class="likes">0</span>
                            <img src="images/flecha_baixo_vazia.svg" alt="Dislike" class="dislike">
                            <span class="dislikes">0</span>
                            <img src="images/chat.svg" alt="Comentários" class="comentarios">
                            <span class="num-comentarios">0</span>
                            ${usuarioLogadoId && pub.usuarioid == usuarioLogadoId ? `
                                <img src="images/editar.png" alt="Editar" class="editar-publicacao">
                                <img src="images/excluir.png" alt="Excluir" class="excluir-publicacao">
                            ` : ''}
                        </div>
                        <div class="comentario-container" style="display:none;">
                            <div class="input-comentario">
                                <input type="text" placeholder="Escreva um comentário...">
                                <button class="btn-comentar">Enviar</button>
                            </div>
                            <div class="comentarios-lista"></div>
                        </div>
                    `;
                    principal.appendChild(publicacao);
                    principal.appendChild(document.createElement('br'));
                });
                carregarInteracoes();
            } else {
                console.error('Erro ao carregar publicações:', data.message);
            }
        }
    }

    async function carregarMinhasPublicacoes() {
        if (!usuarioLogadoId) {
            window.location.href = "index.html";
            return;
        }
        const response = await fetch(`/api/minhas-publicacoes/${usuarioLogadoId}`);
        const data = await response.json();
        if (data.success) {
            const principal = document.querySelector('.principal');
            principal.innerHTML = '<h2>Minhas Publicações</h2>';
            if (data.publicacoes.length === 0) {
                principal.innerHTML += '<p>Você ainda não tem publicações.</p>';
            } else {
                data.publicacoes.forEach(pub => {
                    const publicacao = document.createElement('div');
                    publicacao.classList.add('publicacao');
                    publicacao.setAttribute('data-publicacao-id', pub.id_publicacao);
                    publicacao.setAttribute('data-usuario-id', pub.usuarioid);
                    publicacao.innerHTML = `
                        <img src="${pub.foto}" width="100%" alt="${pub.nome_pet}">
                        <h3>${pub.nome_pet}</h3>
                        <p>${pub.local} - ${pub.cidade}</p>
                        <div class="interacoes">
                            <img src="images/flecha_cima_vazia.svg" alt="Like" class="like">
                            <span class="likes">0</span>
                            <img src="images/flecha_baixo_vazia.svg" alt="Dislike" class="dislike">
                            <span class="dislikes">0</span>
                            <img src="images/chat.svg" alt="Comentários" class="comentarios">
                            <span class="num-comentarios">0</span>
                            <img src="images/editar.png" alt="Editar" class="editar-publicacao">
                            <img src="images/excluir.png" alt="Excluir" class="excluir-publicacao">
                        </div>
                        <div class="comentario-container" style="display:none;">
                            <div class="input-comentario">
                                <input type="text" placeholder="Escreva um comentário...">
                                <button class="btn-comentar">Enviar</button>
                            </div>
                            <div class="comentarios-lista"></div>
                        </div>
                    `;
                    principal.appendChild(publicacao);
                    principal.appendChild(document.createElement('br'));
                });
                carregarInteracoes();
            }
        } else {
            console.error('Erro ao carregar minhas publicações:', data.message);
        }
    }

    async function carregarInteracoes() {
        const publicacoes = document.querySelectorAll(".publicacao");
        if (!publicacoes.length) return;

        const curtidasResponse = await fetch('/api/curtidas');
        const curtidasData = await curtidasResponse.json();
        const curtidas = curtidasData.success ? curtidasData.curtidas : {};

        let usuarioCurtidas = { likes: 0, deslikes: 0, interacoes: {} };
        if (usuarioLogadoId) {
            const usuarioCurtidasResponse = await fetch(`/api/curtidas/usuario/${usuarioLogadoId}`);
            const usuarioCurtidasData = await usuarioCurtidasResponse.json();
            if (usuarioCurtidasData.success) {
                usuarioCurtidas = {
                    likes: usuarioCurtidasData.likes,
                    deslikes: usuarioCurtidasData.deslikes,
                    interacoes: usuarioCurtidasData.interacoes
                };
            }
        }

        const comentariosResponse = await fetch('/api/comentarios');
        const comentariosData = await comentariosResponse.json();
        const comentarios = comentariosData.success ? comentariosData.comentarios : {};

        publicacoes.forEach(publicacao => {
            const likeBtn = publicacao.querySelector(".like");
            const dislikeBtn = publicacao.querySelector(".dislike");
            const likeCount = publicacao.querySelector(".likes");
            const dislikeCount = publicacao.querySelector(".dislikes");
            const comentarioBtn = publicacao.querySelector(".comentarios");
            const numComentarios = publicacao.querySelector(".num-comentarios");
            const comentarioInput = publicacao.querySelector(".comentario-container input");
            const comentarioEnviar = publicacao.querySelector(".btn-comentar");
            const comentarioLista = publicacao.querySelector(".comentarios-lista");
            const editarBtn = publicacao.querySelector(".editar-publicacao");
            const excluirBtn = publicacao.querySelector(".excluir-publicacao");
            const publicacaoId = publicacao.getAttribute("data-publicacao-id");

            const curtida = curtidas[publicacaoId] || { likes: 0, deslikes: 0 };
            likeCount.textContent = curtida.likes;
            dislikeCount.textContent = curtida.deslikes;

            const interacaoUsuario = usuarioCurtidas.interacoes[publicacaoId] || 'none';
            if (interacaoUsuario === 'like') {
                likeBtn.classList.add("active");
                likeBtn.src = "images/flecha_cima_cheia.svg";
                dislikeBtn.classList.remove("active");
                dislikeBtn.src = "images/flecha_baixo_vazia.svg";
            } else if (interacaoUsuario === 'deslike') {
                dislikeBtn.classList.add("active");
                dislikeBtn.src = "images/flecha_baixo_cheia.svg";
                likeBtn.classList.remove("active");
                likeBtn.src = "images/flecha_cima_vazia.svg";
            } else {
                likeBtn.classList.remove("active");
                dislikeBtn.classList.remove("active");
                likeBtn.src = "images/flecha_cima_vazia.svg";
                dislikeBtn.src = "images/flecha_baixo_vazia.svg";
            }

            if (comentarios[publicacaoId]) {
                numComentarios.textContent = comentarios[publicacaoId].length;
                comentarioLista.innerHTML = '';
                comentarios[publicacaoId].forEach(com => {
                    const novoComentario = document.createElement("div");
                    novoComentario.classList.add("comentario-item");
                    novoComentario.setAttribute("data-comentario-id", com.id);
                    novoComentario.innerHTML = `
                        <p>${com.usuario}: ${com.texto}</p>
                        ${com.usuario === usuarioLogado ? `
                            <img src="images/editar.png" alt="Editar" class="editar">
                            <img src="images/excluir.png" alt="Excluir" class="excluir">
                        ` : ''}
                    `;
                    comentarioLista.appendChild(novoComentario);
                });
                // Adicionar eventos aos botões de editar e excluir após criar os comentários
                adicionarEventosComentarios(publicacao);
            } else {
                numComentarios.textContent = 0;
            }

            comentarioBtn.addEventListener("click", function () {
                publicacao.querySelector(".comentario-container").style.display = 
                    publicacao.querySelector(".comentario-container").style.display === "none" ? "block" : "none";
            });

            comentarioEnviar.addEventListener("click", function () {
                if (!usuarioLogadoId) {
                    alert("Você precisa estar logado para comentar!");
                    return;
                }
                if (comentarioInput.value.trim() !== "") {
                    fetch('/comentario', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            usuarioid: usuarioLogadoId,
                            publicacaoid: publicacaoId,
                            comentario: comentarioInput.value
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            const novoComentario = document.createElement("div");
                            novoComentario.classList.add("comentario-item");
                            novoComentario.setAttribute("data-comentario-id", data.comentarioId);
                            novoComentario.innerHTML = `
                                <p>${usuarioLogado}: ${comentarioInput.value}</p>
                                <img src="images/editar.png" alt="Editar" class="editar">
                                <img src="images/excluir.png" alt="Excluir" class="excluir">
                            `;
                            comentarioLista.appendChild(novoComentario);
                            // Adicionar eventos ao novo comentário
                            adicionarEventosComentarios(publicacao);
                            comentarioInput.value = "";
                            numComentarios.textContent = parseInt(numComentarios.textContent) + 1;
                        }
                    })
                    .catch(error => console.error("Erro ao salvar comentário:", error));
                }
            });

            likeBtn.addEventListener("click", async function () {
                if (!usuarioLogadoId) {
                    alert("Você precisa estar logado para curtir!");
                    return;
                }
                const currentInteracao = usuarioCurtidas.interacoes[publicacaoId] || 'none';
                const novaInteracao = currentInteracao === 'like' ? 'none' : 'like';
                await atualizarInteracao(publicacaoId, novaInteracao, likeBtn, dislikeBtn, likeCount, dislikeCount, usuarioCurtidas);
            });

            dislikeBtn.addEventListener("click", async function () {
                if (!usuarioLogadoId) {
                    alert("Você precisa estar logado para descurtir!");
                    return;
                }
                const currentInteracao = usuarioCurtidas.interacoes[publicacaoId] || 'none';
                const novaInteracao = currentInteracao === 'deslike' ? 'none' : 'deslike';
                await atualizarInteracao(publicacaoId, novaInteracao, likeBtn, dislikeBtn, likeCount, dislikeCount, usuarioCurtidas);
            });

            if (editarBtn) {
                editarBtn.addEventListener("click", () => editarPublicacao(publicacao, publicacaoId));
            }

            if (excluirBtn) {
                excluirBtn.addEventListener("click", () => excluirPublicacao(publicacaoId, publicacao));
            }
        });

        totalLikes.textContent = usuarioCurtidas.likes;
        totalDislikes.textContent = usuarioCurtidas.deslikes;
    }

    function adicionarEventosComentarios(publicacao) {
        const comentarioLista = publicacao.querySelector(".comentarios-lista");
        const numComentarios = publicacao.querySelector(".num-comentarios");
        const comentariosItens = comentarioLista.querySelectorAll(".comentario-item");

        comentariosItens.forEach(item => {
            const editarBtn = item.querySelector(".editar");
            const excluirBtn = item.querySelector(".excluir");
            const comentarioId = item.getAttribute("data-comentario-id");

            if (editarBtn) {
                editarBtn.removeEventListener("click", () => {}); // Remove eventos antigos para evitar duplicação
                editarBtn.addEventListener("click", () => {
                    const textoAtual = item.querySelector("p").textContent.split(": ")[1];
                    editarComentario(item, comentarioId, textoAtual);
                });
            }

            if (excluirBtn) {
                excluirBtn.removeEventListener("click", () => {}); // Remove eventos antigos para evitar duplicação
                excluirBtn.addEventListener("click", () => excluirComentario(comentarioId, item, numComentarios));
            }
        });
    }

    async function atualizarInteracao(publicacaoId, tipoInteracao, likeBtn, dislikeBtn, likeCount, dislikeCount, usuarioCurtidas) {
        const currentInteracao = usuarioCurtidas.interacoes[publicacaoId] || 'none';

        const response = await fetch('/interacao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioId: usuarioLogadoId,
                publicacaoId: publicacaoId,
                tipo_interacao: tipoInteracao
            })
        });
        const data = await response.json();

        if (data.success) {
            likeCount.textContent = data.curtidas.likes;
            dislikeCount.textContent = data.curtidas.deslikes;
            totalLikes.textContent = data.usuarioLikes;
            totalDislikes.textContent = data.usuarioDislikes;

            usuarioCurtidas.interacoes[publicacaoId] = tipoInteracao;

            if (tipoInteracao === "like") {
                likeBtn.classList.add("active");
                likeBtn.src = "images/flecha_cima_cheia.svg";
                dislikeBtn.classList.remove("active");
                dislikeBtn.src = "images/flecha_baixo_vazia.svg";
            } else if (tipoInteracao === "deslike") {
                dislikeBtn.classList.add("active");
                dislikeBtn.src = "images/flecha_baixo_cheia.svg";
                likeBtn.classList.remove("active");
                likeBtn.src = "images/flecha_cima_vazia.svg";
            } else {
                likeBtn.classList.remove("active");
                dislikeBtn.classList.remove("active");
                likeBtn.src = "images/flecha_cima_vazia.svg";
                dislikeBtn.src = "images/flecha_baixo_vazia.svg";
            }
        } else {
            alert(data.message);
        }
    }

    function editarComentario(comentarioElement, comentarioId, textoAtual) {
        const novoTexto = prompt("Edite seu comentário:", textoAtual);
        if (novoTexto !== null && novoTexto.trim() !== "") {
            fetch('/editar-comentario', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comentarioId: comentarioId,
                    usuarioId: usuarioLogadoId,
                    texto: novoTexto
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    comentarioElement.querySelector("p").textContent = `${usuarioLogado}: ${novoTexto}`;
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error("Erro ao editar comentário:", error));
        }
    }

    function excluirComentario(comentarioId, comentarioElement, numComentarios) {
        const modalExcluir = document.createElement("div");
        modalExcluir.classList.add("modal-excluir");
        modalExcluir.innerHTML = `
            <div class="modal-excluir-conteudo">
                <p>Tem certeza que deseja excluir este comentário?</p>
                <button id="btn-excluir-sim">Sim</button>
                <button id="btn-excluir-nao">Não</button>
            </div>
        `;
        document.body.appendChild(modalExcluir);
        modalExcluir.style.display = "block";

        document.getElementById("btn-excluir-sim").addEventListener("click", () => {
            fetch('/excluir-comentario', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comentarioId: comentarioId,
                    usuarioId: usuarioLogadoId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    comentarioElement.remove();
                    numComentarios.textContent = parseInt(numComentarios.textContent) - 1;
                    modalExcluir.remove();
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error("Erro ao excluir comentário:", error));
        });

        document.getElementById("btn-excluir-nao").addEventListener("click", () => {
            modalExcluir.remove();
        });
    }

    function editarPublicacao(publicacaoElement, publicacaoId) {
        const nomePet = publicacaoElement.querySelector("h3").textContent;
        const [localPet, cidadePet] = publicacaoElement.querySelector("p").textContent.split(" - ");

        document.getElementById("nome-pet-editar").value = nomePet;
        document.getElementById("local-pet-editar").value = localPet;
        document.getElementById("cidade-pet-editar").value = cidadePet;
        document.getElementById("foto-pet-editar").value = "";
        if (mensagemErroEditar) mensagemErroEditar.textContent = "";

        modalEditarPet.style.display = "block";

        btnSalvarEditar.onclick = () => {
            const fotoInput = document.getElementById("foto-pet-editar");
            const nomePetNovo = document.getElementById("nome-pet-editar").value;
            const localPetNovo = document.getElementById("local-pet-editar").value;
            const cidadePetNovo = document.getElementById("cidade-pet-editar").value;

            if (!nomePetNovo || !localPetNovo || !cidadePetNovo) {
                if (mensagemErroEditar) mensagemErroEditar.textContent = "Todos os campos de texto são obrigatórios.";
                return;
            }

            const formData = new FormData();
            if (fotoInput.files[0]) formData.append("foto", fotoInput.files[0]);
            formData.append("nome_pet", nomePetNovo);
            formData.append("local", localPetNovo);
            formData.append("cidade", cidadePetNovo);
            formData.append("publicacaoId", publicacaoId);
            formData.append("usuarioId", usuarioLogadoId);

            fetch('/editar-publicacao', {
                method: 'PUT',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    publicacaoElement.querySelector("h3").textContent = nomePetNovo;
                    publicacaoElement.querySelector("p").textContent = `${localPetNovo} - ${cidadePetNovo}`;
                    if (data.foto) publicacaoElement.querySelector("img").src = data.foto;
                    modalEditarPet.style.display = "none";
                    limparModalEditar();
                    if (window.location.pathname.includes("minhas-publicacoes.html")) carregarMinhasPublicacoes();
                } else if (mensagemErroEditar) {
                    mensagemErroEditar.textContent = data.message;
                }
            })
            .catch(error => {
                console.error('Erro ao editar publicação:', error);
                if (mensagemErroEditar) mensagemErroEditar.textContent = "Ocorreu um erro. Tente novamente.";
            });
        };

        btnCancelarEditar.onclick = () => {
            modalEditarPet.style.display = "none";
            limparModalEditar();
        };
    }

    function excluirPublicacao(publicacaoId, publicacaoElement) {
        const modalExcluir = document.createElement("div");
        modalExcluir.classList.add("modal-excluir");
        modalExcluir.innerHTML = `
            <div class="modal-excluir-conteudo">
                <p>Tem certeza que deseja excluir esta publicação?</p>
                <button id="btn-excluir-sim">Sim</button>
                <button id="btn-excluir-nao">Não</button>
            </div>
        `;
        document.body.appendChild(modalExcluir);
        modalExcluir.style.display = "block";

        document.getElementById("btn-excluir-sim").addEventListener("click", () => {
            fetch('/excluir-publicacao', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    publicacaoId: parseInt(publicacaoId),
                    usuarioId: parseInt(usuarioLogadoId)
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    publicacaoElement.nextSibling.remove();
                    publicacaoElement.remove();
                    modalExcluir.remove();
                    if (window.location.pathname.includes("minhas-publicacoes.html")) carregarMinhasPublicacoes();
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error("Erro ao excluir publicação:", error);
                alert("Ocorreu um erro ao excluir a publicação. Veja o console para mais detalhes.");
            });
        });

        document.getElementById("btn-excluir-nao").addEventListener("click", () => {
            modalExcluir.remove();
        });
    }

    function limparModalEditar() {
        document.getElementById("foto-pet-editar").value = "";
        document.getElementById("nome-pet-editar").value = "";
        document.getElementById("local-pet-editar").value = "";
        document.getElementById("cidade-pet-editar").value = "";
        if (mensagemErroEditar) mensagemErroEditar.textContent = "";
    }

    carregarPublicacoes();
});