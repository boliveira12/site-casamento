import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, initDb } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Inicializa tabelas do banco de dados
initDb();

// ── Rota de Login Admin ──────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === adminPassword) {
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: 'Senha incorreta.' });
});

// Rota de Health Check
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.execute('SELECT 1 as alive');
    res.json({
      status: 'ok',
      database: 'SQLite',
      timestamp: new Date().toISOString(),
      result: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Lista de convidados / RSVPs
app.get('/api/guests', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM guests ORDER BY created_at DESC');
    res.json({ guests: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar confirmação de presença (RSVP)
app.post('/api/rsvp', async (req, res) => {
  const { guestListId, name, phone, attending, message, has_plus_one, plus_one_name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'O nome é obrigatório.' });
  }

  try {
    const isAttending = attending !== undefined ? (attending ? 1 : 0) : 1;
    const rsvpStatus = isAttending ? 'confirmou' : 'negou';
    const hasPlusOneVal = has_plus_one ? 1 : 0;
    const plusOneNameVal = has_plus_one && plus_one_name ? plus_one_name.trim() : null;

    const result = await db.execute({
      sql: `INSERT INTO guests (name, phone, attending, message, has_plus_one, plus_one_name) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        name,
        phone || null,
        isAttending,
        message || null,
        hasPlusOneVal,
        plusOneNameVal
      ]
    });

    // Atualiza o status e acompanhante na lista de convidados (guest_list)
    if (guestListId) {
      await db.execute({
        sql: `UPDATE guest_list SET status = ?, has_plus_one = ?, plus_one_name = ? WHERE id = ?`,
        args: [rsvpStatus, hasPlusOneVal, plusOneNameVal, guestListId]
      });
    } else {
      await db.execute({
        sql: `UPDATE guest_list SET status = ?, has_plus_one = ?, plus_one_name = ? WHERE LOWER(name) = LOWER(?)`,
        args: [rsvpStatus, hasPlusOneVal, plusOneNameVal, name.trim()]
      });
    }

    res.status(201).json({
      message: 'Confirmação registrada com sucesso!',
      guestId: Number(result.lastInsertRowid)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lista de presentes
app.get('/api/gifts', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM gift_registry ORDER BY id ASC');
    res.json({ gifts: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// --- LISTA DE CONVIDADOS CRUD ---

// Listar todos os convidados da lista
app.get('/api/guest-list', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM guest_list ORDER BY id DESC');
    res.json({ guests: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adicionar um novo convidado
app.post('/api/guest-list', async (req, res) => {
  const { name, phone, invite_sent, status } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'O nome do convidado é obrigatório.' });
  }

  const validStatuses = ['ainda nao respondeu', 'confirmou', 'negou'];
  const finalStatus = validStatuses.includes(status) ? status : 'ainda nao respondeu';
  const finalInviteSent = invite_sent ? 1 : 0;

  try {
    const result = await db.execute({
      sql: `INSERT INTO guest_list (name, phone, invite_sent, status) VALUES (?, ?, ?, ?)`,
      args: [name.trim(), phone ? phone.trim() : null, finalInviteSent, finalStatus]
    });

    res.status(201).json({
      success: true,
      message: 'Convidado adicionado com sucesso!',
      guest: {
        id: Number(result.lastInsertRowid),
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        invite_sent: finalInviteSent,
        status: finalStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar um convidado (status, checkmark de convite enviado, telefone, nome)
app.put('/api/guest-list/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, invite_sent, status } = req.body;

  try {
    const current = await db.execute({
      sql: 'SELECT * FROM guest_list WHERE id = ?',
      args: [id]
    });

    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Convidado não encontrado.' });
    }

    const row = current.rows[0];
    const newName = name !== undefined ? name : row.name;
    const newPhone = phone !== undefined ? phone : row.phone;
    const newInviteSent = invite_sent !== undefined ? (invite_sent ? 1 : 0) : row.invite_sent;
    const newStatus = status !== undefined ? status : row.status;

    await db.execute({
      sql: `UPDATE guest_list SET name = ?, phone = ?, invite_sent = ?, status = ? WHERE id = ?`,
      args: [newName, newPhone, newInviteSent, newStatus, id]
    });

    res.json({
      success: true,
      message: 'Convidado atualizado com sucesso!',
      guest: {
        id: Number(id),
        name: newName,
        phone: newPhone,
        invite_sent: newInviteSent,
        status: newStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remover um convidado da lista
app.delete('/api/guest-list/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute({
      sql: 'DELETE FROM guest_list WHERE id = ?',
      args: [id]
    });
    res.json({ success: true, message: 'Convidado removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve o frontend buildado em produção (dentro do container Docker)
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.join(__dirname, '..', 'dist');

  app.use(express.static(distPath));

  // Fallback para o React Router (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express rodando na porta ${PORT}`);
  console.log(`📡 Health Check em http://localhost:${PORT}/api/health`);
});
