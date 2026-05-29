const API = "https://localhost:7171/api/Produtos";


let usuario = JSON.parse(localStorage.getItem("usuario"));

if (!usuario) {
    window.location.href = "login.html";
}


let todosProdutos = [];


window.onload = () => {


    if (usuario && usuario.tipo === "Admin") {

        const topButtons = document.querySelector(".top-buttons");

        if (topButtons) {

            topButtons.innerHTML += `
                <button class="btn btn-primary" onclick="irAdmin()">
                    ⚙️ Admin
                </button>
            `;
        }
    }


    const paginaAtual = window.location.pathname;

    if (paginaAtual.includes("favoritos.html")) {

        carregarFavoritos();

    } else {

        carregarProdutos();

        iniciarBusca();
    }
};


function carregarProdutos() {

    fetch(API)
    .then(res => res.json())
    .then(produtosApi => {

        const produtos = produtosApi.map(produto => {

            const nome = (produto.nome || "").toLowerCase();

            let categoria = "outros";

            // NOTEBOOKS
            if (
                nome.includes("notebook") ||
                nome.includes("laptop")
            ) {
                categoria = "notebook";
            }

            // MONITORES
            else if (
                nome.includes("monitor")
            ) {
                categoria = "monitor";
            }

            // PERIFÉRICOS
            else if (
                nome.includes("mouse") ||
                nome.includes("teclado") ||
                nome.includes("headset") ||
                nome.includes("fone") ||
                nome.includes("webcam")
            ) {
                categoria = "periferico";
            }

            return {
                ...produto,
                categoria
            };
        });

        todosProdutos = produtos;

        renderProdutos(produtos);

    })
    .catch(error => {

        console.error("Erro ao carregar produtos:", error);

        showToast("❌ Erro ao carregar produtos");
    });
}


function carregarFavoritos() {

    fetch(API)
    .then(res => res.json())
    .then(produtos => {

        const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

        const produtosFavoritos = produtos.filter(produto =>
            favoritos.includes(produto.id)
        );

        renderProdutos(produtosFavoritos);
    })
    .catch(error => {

        console.error("Erro ao carregar favoritos:", error);

        showToast("❌ Erro ao carregar favoritos");
    });
}


function renderProdutos(produtos){

    const container = document.getElementById("produtos");

    if (!container) return;

    container.innerHTML = "";


    if(produtos.length === 0){

        container.innerHTML = `
            <div class="empty-state">
                <h2>😕 Nenhum produto encontrado</h2>
            </div>
        `;

        return;
    }

    produtos.forEach(p => {

        const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

        const favoritado = favoritos.includes(p.id);

        container.innerHTML += `
        
        <div 
            class="product-card"
            onclick="verProduto(${p.id})"
        >

            <button 
                class="favorite-btn"
                onclick="event.stopPropagation(); toggleFavorito(${p.id})"
                style="
                    color: ${favoritado ? 'red' : '#999'};
                "
            >
                ❤
            </button>

            <img 
                src="${p.imagemUrl}" 
                alt="${p.nome}"
            >

            <h3 class="product-title">
                ${p.nome}
            </h3>

            <p class="product-description">
                ${p.descricao 
                    ? p.descricao.substring(0, 80) + "..."
                    : "Sem descrição disponível"}
            </p>

            <div class="price">
                R$ ${Number(p.preco).toFixed(2)}
            </div>

            <p class="stock">
                Estoque: ${p.quantidade}
            </p>

            <button 
                class="buy-btn"
                onclick="event.stopPropagation(); addCarrinho(${p.id})"
            >
                🛒 Comprar
            </button>

        </div>
        `;
    });
}


function iniciarBusca(){

    const input = document.getElementById("searchInput");

    if(!input) return;

    input.addEventListener("input", () => {

        const termo = input.value.toLowerCase();

        const filtrados = todosProdutos.filter(p =>
            p.nome.toLowerCase().includes(termo)
        );

        renderProdutos(filtrados);
    });
}


function filtrarCategoria(categoria){

    if(categoria === "todos"){

        renderProdutos(todosProdutos);

        return;
    }

    const filtrados = todosProdutos.filter(p =>
        (p.categoria || "")
        .toLowerCase()
        .includes(categoria.toLowerCase())
    );

    renderProdutos(filtrados);
}


function verProduto(id) {

    window.location.href = `product.html?id=${id}`;
}


function addCarrinho(id) {

    let produto = todosProdutos.find(p => p.id === id);

    if(!produto) return;

    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    carrinho.push(produto);

    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    showToast("🛒 Produto adicionado ao carrinho!");
}


function toggleFavorito(id){

    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    if(favoritos.includes(id)){

        favoritos = favoritos.filter(f => f !== id);

        showToast("💔 Produto removido dos favoritos");

    } else {

        favoritos.push(id);

        showToast("❤️ Produto adicionado aos favoritos");
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));

    // Atualiza a tela
    if(window.location.pathname.includes("favoritos.html")){

        carregarFavoritos();

    } else {

        renderProdutos(todosProdutos);
    }
}


function showToast(message){

    const toast = document.getElementById("toast");

    if(!toast) return;

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


function logout() {

    localStorage.removeItem("usuario");

    window.location.href = "login.html";
}


function irCarrinho() {

    window.location.href = "carrinho.html";
}


function irFavoritos() {

    window.location.href = "favoritos.html";
}


function irAdmin() {

    window.location.href = "admin.html";
}


function irPedidos() {

    window.location.href = "meusPedidos.html";
}


function finalizarCompra() {

    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

    let usuario = JSON.parse(localStorage.getItem("usuario"));

    if (carrinho.length === 0) {

        alert("Carrinho vazio!");

        return;
    }

    let total = carrinho.reduce((sum, p) => sum + p.preco, 0);

    let pedido = {

        usuarioId: usuario.id,

        total: total,

        itens: carrinho.map(p => ({
            produtoId: p.id,
            quantidade: 1,
            precoUnitario: p.preco
        }))
    };

    fetch("https://localhost:7171/api/Pedidos", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(pedido)

    })
    .then(r => r.json())
    .then(() => {

        alert("Compra realizada com sucesso!");

        localStorage.removeItem("carrinho");

        window.location.href = "index.html";
    })
    .catch(() => {

        alert("Erro ao finalizar compra");
    });
}


function mostrarUsuarios() {

    let lista = document.getElementById("lista");

    if (!lista) return;

    lista.innerHTML = `
        <button class="btn btn-primary" onclick="criarUsuario()">
            ➕ Adicionar novo usuário
        </button>

        <hr style="margin: 1rem 0;">
    `;

    fetch("https://localhost:7171/api/Usuarios")
    .then(r => r.json())
    .then(data => {

        data.forEach(u => {

            lista.innerHTML += `

                <div class="product-card">

                    <h3>${u.nome}</h3>

                    <p>${u.email}</p>

                    <p>
                        Tipo: ${u.tipo}
                    </p>

                    <button 
                        class="btn btn-primary"
                        onclick="editarUsuario(${u.id})"
                        style="width: 100%; margin-top: 1rem;"
                    >
                        ✏️ Editar
                    </button>

                    <button 
                        class="btn btn-outline"
                        onclick="deletarUsuario(${u.id})"
                        style="width: 100%; margin-top: 0.5rem;"
                    >
                        🗑️ Deletar
                    </button>

                </div>

            `;
        });

    });
}


function carregarPedidosAdmin() {

    const container = document.getElementById("listaPedidos");

    if (!container) return;

    fetch("https://localhost:7171/api/Pedidos")
    .then(res => res.json())
    .then(pedidos => {

        container.innerHTML = "";

        pedidos.forEach(p => {

            container.innerHTML += `
            
            <div class="product-card">

                <h3>
                    Pedido #${p.id}
                </h3>

                <p>
                    Usuário ID: ${p.usuarioId}
                </p>

                <p>
                    Total: R$ ${Number(p.total).toFixed(2)}
                </p>

                <p>
                    Itens: ${p.itens.length}
                </p>

            </div>
            `;
        });
    });
}