import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = express();
var listaProdutos = [];

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: 'M1nh4Ch4v3S3cr3t4',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 15
    }
}));

function estaAutenticado(req, res, next) {
    if (req.session?.logado) next();
    else res.redirect('/login');
}

function pagina(titulo, conteudo) {
  return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>${titulo}</title>

<<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
<style>
body{
  font-family: "Playfair Display", serif;
  background: linear-gradient(to right, #f7faf7, #e0b2f7);
  margin:0;
}

nav{
  background: #6b0764;
  padding:15px;
  text-align:center;
}

nav a {
  color:white;
  margin-right:15px;
  font-weight:bold;
  text-decoration:none;
}

.container{
  width:600px;
  margin:40px auto;
  background:white;
  padding:30px;
  border-radius:10px;
  box-shadow:0px 4px 10px #6b0764;
}

h1, h2{
  text-align:center;
}

input{
  width:100%;
  padding:8px;
  margin:5px 0 15px 0;
  border-radius:5px;
  border:1px solid #ccc;
}

button{
  width:100%;
  padding:10px;
  background:#6b0764;
  color:white;
  border:none;
  border-radius:8px;
  cursor:pointer;
}

button:hover{
  background:#ccc;
}

ul{
  background:#f4f4f4;
  padding:15px;
  border-radius:8px;
}

table{
  width:100%;
  border-collapse: collapse;
  margin-top:15px;
}

th, td{
  padding:10px;
  border:1px solid #ccc;
  text-align:center;
}
</style>
</head>

<body>

<nav>
<a href="/">Início</a>
<a href="/produto">Cadastrar Produto</a>
<a href="/listaProdutos">Listar Produtos</a>
<a href="/logout">Logout</a>
</nav>

<div class="container">
${conteudo}
</div>

</body>
</html>
`;
}

// HOME
app.get('/', estaAutenticado, (req, res) => {
    res.send(pagina("Menu", `
        <h1>Menu</h1>
        <a href="/produto">Cadastrar Produto</a><br><br>
        <a href="/listaProdutos">Listar Produtos</a>
    `));
});

app.get('/produto', estaAutenticado, (req, res) => {
    res.send(pagina("Cadastro de Produto", `
        <h2>Cadastro de Produto</h2>
        <form method="POST" action="/produto">
            Código: <input name="codigo">
            Descrição: <input name="descricao">
            Preço Custo: <input name="custo">
            Preço Venda: <input name="venda">
            Validade: <input type="date" name="validade">
            Estoque: <input name="estoque">
            Fabricante: <input name="fabricante">
            <button type="submit">Cadastrar</button>
        </form>
    `));
});

app.post('/produto', estaAutenticado, (req, res) => {
    const { codigo, descricao, custo, venda, validade, estoque, fabricante } = req.body;

    if (!codigo || !descricao) {
        return res.send(pagina("Erro", `<h2>Preencha os campos obrigatórios!</h2>`));
    }

    listaProdutos.push({
        codigo, descricao, custo, venda, validade, estoque, fabricante
    });

    res.redirect('/listaProdutos');
});

app.get('/listaProdutos', estaAutenticado, (req, res) => {
    const ultimo = req.cookies?.ultimoAcesso || "Nunca acessou";

    let linhas = listaProdutos.map((p, i) => `
        <tr>
            <td>${i+1}</td>
            <td>${p.codigo}</td>
            <td>${p.descricao}</td>
            <td>${p.venda}</td>
        </tr>
    `).join('');

    res.send(pagina("Lista de Produtos", `
        <h2>Produtos</h2>
        <p><strong>Último acesso:</strong> ${ultimo}</p>

        <table>
            <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Descrição</th>
                <th>Preço</th>
            </tr>
            ${linhas}
        </table>

        <br>
        <a href="/produto">Novo Produto</a>
    `));
});


app.get('/login', (req, res) => {
    const ultimo = req.cookies?.ultimoAcesso || "Nunca acessou";

    res.send(pagina("Login", `
        <h2>Login</h2>
        <form method="POST" action="/login">
            Email: <input name="email">
            Senha: <input type="password" name="senha">
            <button>Entrar</button>
        </form>
        <p><strong>Último acesso:</strong> ${ultimo}</p>
    `));
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (email === "admin@teste.com.br" && senha === "admin") {
        req.session.logado = true;

        res.cookie("ultimoAcesso", new Date().toLocaleString(), {
            maxAge: 1000 * 60 * 60 * 24 * 30
        });

        res.redirect('/');
    } else {
        res.send(pagina("Erro", `<h2>Login inválido</h2>`));
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

export default app;