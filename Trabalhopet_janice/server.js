const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'pet_do_brasil'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados');
});

// Login
app.post('/login', (req, res) => {
    const { nickname, senha } = req.body;
    if (!nickname || !senha) {
        return res.status(400).json({ success: false, message: 'Nickname e senha são obrigatórios.' });
    }
    const query = 'SELECT id FROM usuario WHERE nickname = ? AND senha = ?';
    connection.query(query, [nickname, senha], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro no servidor', error: err.message });
        if (results.length > 0) {
            res.json({ success: true, message: 'Login realizado com sucesso.', usuarioId: results[0].id });
        } else {
            res.status(401).json({ success: false, message: 'Usuário ou senha incorretos.' });
        }
    });
});

// Cadastro de usuário
app.post('/cadastro', (req, res) => {
    const { nome, email, nickname, senha } = req.body;
    if (!nome || !email || !nickname || !senha) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }
    const checkQuery = 'SELECT * FROM usuario WHERE email = ? OR nickname = ?';
    connection.query(checkQuery, [email, nickname], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro no servidor', error: err.message });
        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'E-mail ou Nickname já cadastrados.' });
        }
        const insertQuery = 'INSERT INTO usuario (nome, email, nickname, senha) VALUES (?, ?, ?, ?)';
        connection.query(insertQuery, [nome, email, nickname, senha], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário.', error: err.message });
            res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso!', usuarioId: results.insertId });
        });
    });
});

// Registrar interação
app.post('/interacao', (req, res) => {
    const { usuarioId, publicacaoId, tipo_interacao } = req.body;
    if (!usuarioId || !publicacaoId || !['like', 'deslike', 'none'].includes(tipo_interacao)) {
        return res.status(400).json({ success: false, message: 'Dados inválidos.' });
    }

    const upsertQuery = `
        INSERT INTO curtida (usuarioid, publicacaoid, tipo_interacao) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE tipo_interacao = VALUES(tipo_interacao)
    `;
    connection.query(upsertQuery, [usuarioId, publicacaoId, tipo_interacao], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao atualizar interação.', error: err.message });

        const countQuery = `
            SELECT 
                SUM(CASE WHEN tipo_interacao = 'like' THEN 1 ELSE 0 END) as likes,
                SUM(CASE WHEN tipo_interacao = 'deslike' THEN 1 ELSE 0 END) as deslikes
            FROM curtida 
            WHERE publicacaoid = ?
        `;
        connection.query(countQuery, [publicacaoId], (err, countResults) => {
            if (err) return res.status(500).json({ success: false, message: 'Erro ao contar curtidas.', error: err.message });
            const curtidas = { likes: countResults[0].likes || 0, deslikes: countResults[0].deslikes || 0 };

            const userQuery = `
                SELECT 
                    SUM(CASE WHEN tipo_interacao = 'like' THEN 1 ELSE 0 END) as usuarioLikes,
                    SUM(CASE WHEN tipo_interacao = 'deslike' THEN 1 ELSE 0 END) as usuarioDislikes
                FROM curtida 
                WHERE usuarioid = ?
            `;
            connection.query(userQuery, [usuarioId], (err, userResults) => {
                if (err) return res.status(500).json({ success: false, message: 'Erro ao contar interações.', error: err.message });
                res.json({
                    success: true,
                    curtidas,
                    usuarioLikes: userResults[0].usuarioLikes || 0,
                    usuarioDislikes: userResults[0].usuarioDislikes || 0
                });
            });
        });
    });
});

// Adicionar comentário
app.post('/comentario', (req, res) => {
    const { usuarioid, publicacaoid, comentario } = req.body;
    if (!usuarioid || !publicacaoid || !comentario) {
        return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes.' });
    }
    const query = 'INSERT INTO comentario (usuarioid, publicacaoid, texto) VALUES (?, ?, ?)';
    connection.query(query, [usuarioid, publicacaoid, comentario], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao adicionar comentário.', error: err.message });
        res.json({ success: true, message: 'Comentário adicionado!', comentarioId: results.insertId });
    });
});

// Editar comentário
app.put('/editar-comentario', (req, res) => {
    const { comentarioId, usuarioId, texto } = req.body;
    if (!comentarioId || !usuarioId || !texto) {
        return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes.' });
    }
    const query = 'UPDATE comentario SET texto = ? WHERE id = ? AND usuarioid = ?';
    connection.query(query, [texto, comentarioId, usuarioId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao editar comentário.', error: err.message });
        if (results.affectedRows === 0) {
            return res.status(403).json({ success: false, message: 'Você não tem permissão para editar este comentário.' });
        }
        res.json({ success: true, message: 'Comentário editado com sucesso!' });
    });
});

// Excluir comentário
app.delete('/excluir-comentario', (req, res) => {
    const { comentarioId, usuarioId } = req.body;
    if (!comentarioId || !usuarioId) {
        return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes.' });
    }
    const query = 'DELETE FROM comentario WHERE id = ? AND usuarioid = ?';
    connection.query(query, [comentarioId, usuarioId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao excluir comentário.', error: err.message });
        if (results.affectedRows === 0) {
            return res.status(403).json({ success: false, message: 'Você não tem permissão para excluir este comentário.' });
        }
        res.json({ success: true, message: 'Comentário excluído com sucesso!' });
    });
});

// Buscar curtidas
app.get('/api/curtidas', (req, res) => {
    const query = `
        SELECT publicacaoid, tipo_interacao, COUNT(*) as count
        FROM curtida
        WHERE tipo_interacao IN ('like', 'deslike')
        GROUP BY publicacaoid, tipo_interacao
    `;
    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar curtidas.', error: err.message });
        const curtidas = {};
        results.forEach(row => {
            if (!curtidas[row.publicacaoid]) curtidas[row.publicacaoid] = { likes: 0, deslikes: 0 };
            if (row.tipo_interacao === 'like') curtidas[row.publicacaoid].likes = row.count;
            if (row.tipo_interacao === 'deslike') curtidas[row.publicacaoid].deslikes = row.count;
        });
        res.json({ success: true, curtidas });
    });
});

// Buscar comentários
app.get('/api/comentarios', (req, res) => {
    const query = `
        SELECT c.id, c.publicacaoid, c.texto, u.nickname as usuario
        FROM comentario c
        JOIN usuario u ON c.usuarioid = u.id
    `;
    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar comentários.', error: err.message });
        const comentarios = {};
        results.forEach(row => {
            if (!comentarios[row.publicacaoid]) comentarios[row.publicacaoid] = [];
            comentarios[row.publicacaoid].push({ id: row.id, usuario: row.usuario, texto: row.texto });
        });
        res.json({ success: true, comentarios });
    });
});

// Buscar curtidas do usuário
app.get('/api/curtidas/usuario/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;
    const query = `
        SELECT publicacaoid, tipo_interacao
        FROM curtida
        WHERE usuarioid = ?
    `;
    connection.query(query, [usuarioId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar curtidas.', error: err.message });
        let likes = 0;
        let deslikes = 0;
        const interacoes = {};
        results.forEach(row => {
            interacoes[row.publicacaoid] = row.tipo_interacao;
            if (row.tipo_interacao === 'like') likes++;
            if (row.tipo_interacao === 'deslike') deslikes++;
        });
        res.json({ success: true, likes, deslikes, interacoes });
    });
});

// Buscar publicações
app.get('/api/publicacoes', (req, res) => {
    const query = 'SELECT id_publicacao, foto, nome_pet, local, cidade, usuarioid FROM publicacao';
    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar publicações.', error: err.message });
        res.json({ success: true, publicacoes: results });
    });
});

// Buscar publicações do usuário logado
app.get('/api/minhas-publicacoes/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;
    const query = 'SELECT id_publicacao, foto, nome_pet, local, cidade, usuarioid FROM publicacao WHERE usuarioid = ?';
    connection.query(query, [usuarioId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao buscar suas publicações.', error: err.message });
        res.json({ success: true, publicacoes: results });
    });
});

// Cadastrar pet
app.post('/cadastrar-pet', upload.single('foto'), (req, res) => {
    const { nome_pet, local, cidade, usuarioid } = req.body;
    const foto = req.file ? `/images/${req.file.filename}` : null;

    console.log('Dados recebidos:', { nome_pet, local, cidade, usuarioid, foto });

    if (!foto || !nome_pet || !local || !cidade || !usuarioid) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    const query = 'INSERT INTO publicacao (foto, nome_pet, local, cidade, usuarioid) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [foto, nome_pet, local, cidade, usuarioid], (err, results) => {
        if (err) {
            console.error('Erro ao cadastrar pet:', err);
            return res.status(500).json({ success: false, message: 'Erro ao cadastrar pet.', error: err.message });
        }
        res.json({ success: true, message: 'Pet cadastrado com sucesso!', publicacaoId: results.insertId });
    });
});

// Editar publicação
app.put('/editar-publicacao', upload.single('foto'), (req, res) => {
    const { nome_pet, local, cidade, publicacaoId, usuarioId } = req.body;
    const foto = req.file ? `/images/${req.file.filename}` : null;

    if (!nome_pet || !local || !cidade || !publicacaoId || !usuarioId) {
        return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes.' });
    }

    const selectQuery = 'SELECT foto FROM publicacao WHERE id_publicacao = ? AND usuarioid = ?';
    connection.query(selectQuery, [publicacaoId, usuarioId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao verificar publicação.', error: err.message });
        if (results.length === 0) {
            return res.status(403).json({ success: false, message: 'Você não tem permissão para editar esta publicação.' });
        }

        const currentFoto = results[0].foto;
        const updateQuery = `
            UPDATE publicacao 
            SET nome_pet = ?, local = ?, cidade = ?, foto = ? 
            WHERE id_publicacao = ? AND usuarioid = ?
        `;
        connection.query(updateQuery, [nome_pet, local, cidade, foto || currentFoto, publicacaoId, usuarioId], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Erro ao editar publicação.', error: err.message });
            if (results.affectedRows === 0) {
                return res.status(403).json({ success: false, message: 'Você não tem permissão para editar esta publicação.' });
            }
            res.json({ success: true, message: 'Publicação editada com sucesso!', foto: foto || currentFoto });
        });
    });
});

// Excluir publicação
app.delete('/excluir-publicacao', (req, res) => {
    const { publicacaoId, usuarioId } = req.body;
    if (!publicacaoId || !usuarioId) {
        return res.status(400).json({ success: false, message: 'Dados obrigatórios ausentes.' });
    }

    const query = 'DELETE FROM publicacao WHERE id_publicacao = ? AND usuarioid = ?';
    connection.query(query, [publicacaoId, usuarioId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao excluir publicação.', error: err.message });
        if (results.affectedRows === 0) {
            return res.status(403).json({ success: false, message: 'Você não tem permissão para excluir esta publicação.' });
        }
        res.json({ success: true, message: 'Publicação excluída com sucesso!' });
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
    console.log('Acesse o projeto em: http://localhost:3000');
});