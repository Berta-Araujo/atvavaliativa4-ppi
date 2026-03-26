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

// 🔐 Middleware
function estaAutenticado(req, res, next) {
    if (req.session?.logado) next();
    else res.redirect('/login');
}

// 🏠 HOME
app.get('/', estaAutenticado, (req, res) => {
    res.send(`
        <h1>Menu</h1>
        <a href="/produto">Cadastrar Produto</a><br>
        <a href="/listaProdutos">Listar Produtos</a><br>
        <a href="/logout">Logout</a>
    `);
});

// 📦 FORM PRODUTO
app.get('/produto', estaAutenticado, (req, res) => {
    res.send(`
        <h2>Cadastro de Produto</h2>
        <form method="POST" action="/produto">
            Código: <input name="codigo"><br>
            Descrição: <input name="descricao"><br>
            Preço Custo: <input name="custo"><br>
            Preço Venda: <input name="venda"><br>
            Validade: <input type="date" name="validade"><br>
            Estoque: <input name="estoque"><br>
            Fabricante: <input name="fabricante"><br>
            <button type="submit">Cadastrar</button>
        </form>
    `);
});

// 📦 POST PRODUTO
app.post('/produto', estaAutenticado, (req, res) => {
    const { codigo, descricao, custo, venda, validade, estoque, fabricante } = req.body;

    if (!codigo || !descricao) {
        return res.send("Preencha os campos obrigatórios!");
    }

    listaProdutos.push({
        codigo, descricao, custo, venda, validade, estoque, fabricante
    });

    res.redirect('/listaProdutos');
});

// 📋 LISTA
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

    res.send(`
        <h2>Produtos</h2>
        <p>Último acesso: ${ultimo}</p>
        <table border="1">
            <tr><th>ID</th><th>Código</th><th>Descrição</th><th>Preço</th></tr>
            ${linhas}
        </table>
        <a href="/produto">Novo Produto</a>
    `);
});

// 🔐 LOGIN
app.get('/login', (req, res) => {
    const ultimo = req.cookies?.ultimoAcesso || "Nunca acessou";

    res.send(`
        <h2>Login</h2>
        <form method="POST" action="/login">
            Email: <input name="email"><br>
            Senha: <input type="password" name="senha"><br>
            <button>Entrar</button>
        </form>
        <p>Último acesso: ${ultimo}</p>
    `);
});

// 🔐 POST LOGIN
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (email === "admin@teste.com.br" && senha === "admin") {
        req.session.logado = true;

        res.cookie("ultimoAcesso", new Date().toLocaleString(), {
            maxAge: 1000 * 60 * 60 * 24 * 30
        });

        res.redirect('/');
    } else {
        res.send("Login inválido");
    }
});

// 🚪 LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// 🚀 EXPORT VERCEL
export default app;