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

// Mensagens públicas enviadas pelos convidados no RSVP (exibidas na Home)
app.get('/api/messages', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT id, name, message, created_at 
      FROM guests 
      WHERE message IS NOT NULL AND TRIM(message) != '' 
        AND (private_message IS NULL OR private_message = 0)
      ORDER BY created_at DESC
    `);
    res.json({ messages: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mensagens privadas (apenas para os noivos) — protegida por senha admin
app.get('/api/messages/private', async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT id, name, message, created_at 
      FROM guests 
      WHERE message IS NOT NULL AND TRIM(message) != '' 
        AND private_message = 1
      ORDER BY created_at DESC
    `);
    res.json({ messages: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registrar confirmação de presença (RSVP)
app.post('/api/rsvp', async (req, res) => {
  const { guestListId, name, phone, attending, message, private_message, has_plus_one, plus_one_name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'O nome é obrigatório.' });
  }

  try {
    const isAttending = attending !== undefined ? (attending ? 1 : 0) : 1;
    const rsvpStatus = isAttending ? 'confirmou' : 'negou';
    const hasPlusOneVal = has_plus_one ? 1 : 0;
    const plusOneNameVal = has_plus_one && plus_one_name ? plus_one_name.trim() : null;
    const privateMessageVal = private_message ? 1 : 0;

    // Localizar convidado na lista
    let targetGuest = null;
    if (guestListId) {
      const resGuest = await db.execute({
        sql: 'SELECT * FROM guest_list WHERE id = ?',
        args: [guestListId]
      });
      if (resGuest.rows.length > 0) {
        targetGuest = resGuest.rows[0];
      }
    }

    if (!targetGuest) {
      const resGuest = await db.execute({
        sql: 'SELECT * FROM guest_list WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1',
        args: [name.trim()]
      });
      if (resGuest.rows.length > 0) {
        targetGuest = resGuest.rows[0];
      }
    }

    const normalizeStatus = (str) =>
      str ? str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

    const isPending = (statusStr) => {
      if (!statusStr) return true;
      const s = normalizeStatus(statusStr);
      return s === 'pendente' || s === 'ainda nao respondeu' || s === 'sem resposta';
    };

    // Se status != "pendente", responda exato: "Esse convite já foi respondido por você ou alguém da sua família."
    if (targetGuest) {
      if (!isPending(targetGuest.status)) {
        return res.status(400).json({
          error: 'Esse convite já foi respondido por você ou alguém da sua família.'
        });
      }

      if (targetGuest.group_name && targetGuest.group_name.trim()) {
        const groupRes = await db.execute({
          sql: `SELECT status FROM guest_list WHERE LOWER(TRIM(group_name)) = LOWER(TRIM(?))`,
          args: [targetGuest.group_name.trim()]
        });

        const hasAnsweredInGroup = groupRes.rows.some((row) => !isPending(row.status));

        if (hasAnsweredInGroup) {
          return res.status(400).json({
            error: 'Esse convite já foi respondido por você ou alguém da sua família.'
          });
        }
      }
    } else {
      // Caso não esteja cadastrado na lista prévia, verifica se já respondeu em guests
      const alreadyInGuests = await db.execute({
        sql: 'SELECT id FROM guests WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1',
        args: [name.trim()]
      });
      if (alreadyInGuests.rows.length > 0) {
        return res.status(400).json({
          error: 'Esse convite já foi respondido por você ou alguém da sua família.'
        });
      }
    }

    const groupName = targetGuest?.group_name ? targetGuest.group_name.trim() : null;
    let groupMembers = [];

    // Salva o registro em guests
    const result = await db.execute({
      sql: `INSERT INTO guests (name, phone, attending, message, private_message, has_plus_one, plus_one_name, group_name) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        name.trim(),
        phone || null,
        isAttending,
        message || null,
        privateMessageVal,
        hasPlusOneVal,
        plusOneNameVal,
        groupName
      ]
    });

    // Se o convidado marcou acompanhante (+1), cadastra na lista de convidados caso ainda não exista
    if (hasPlusOneVal && plusOneNameVal) {
      const existingPlusOne = await db.execute({
        sql: 'SELECT id, status, group_name FROM guest_list WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1',
        args: [plusOneNameVal]
      });

      if (existingPlusOne.rows.length === 0) {
        await db.execute({
          sql: `INSERT INTO guest_list (name, phone, invite_sent, status, group_name) VALUES (?, ?, ?, ?, ?)`,
          args: [plusOneNameVal, null, 1, rsvpStatus, groupName]
        });
      } else {
        await db.execute({
          sql: `UPDATE guest_list SET status = ? WHERE id = ?`,
          args: [rsvpStatus, existingPlusOne.rows[0].id]
        });
      }
    }

    // Atualiza a lista de convidados (guest_list)
    if (targetGuest) {
      // Se tiver grupo/família, confirma TODOS os integrantes do grupo
      if (groupName) {
        await db.execute({
          sql: `UPDATE guest_list SET status = ? WHERE group_name = ?`,
          args: [rsvpStatus, groupName]
        });

        // Atualiza acompanhante especificamente para o convidado que preencheu
        await db.execute({
          sql: `UPDATE guest_list SET has_plus_one = ?, plus_one_name = ? WHERE id = ?`,
          args: [hasPlusOneVal, plusOneNameVal, targetGuest.id]
        });

        const membersRes = await db.execute({
          sql: `SELECT name FROM guest_list WHERE group_name = ?`,
          args: [groupName]
        });
        groupMembers = membersRes.rows.map((r) => r.name);
      } else {
        await db.execute({
          sql: `UPDATE guest_list SET status = ?, has_plus_one = ?, plus_one_name = ? WHERE id = ?`,
          args: [rsvpStatus, hasPlusOneVal, plusOneNameVal, targetGuest.id]
        });
      }
    } else {
      // Caso não encontrado por ID, tenta por nome
      await db.execute({
        sql: `UPDATE guest_list SET status = ?, has_plus_one = ?, plus_one_name = ? WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))`,
        args: [rsvpStatus, hasPlusOneVal, plusOneNameVal, name.trim()]
      });
    }

    let messageText = 'Confirmação registrada com sucesso!';
    if (groupMembers.length > 1) {
      messageText = `Presença de ${name} e de toda a família (${groupName}) confirmada com sucesso!`;
    } else if (hasPlusOneVal && plusOneNameVal) {
      messageText = `Presença de ${name} e do(a) acompanhante ${plusOneNameVal} confirmada com sucesso!`;
    }

    res.status(201).json({
      message: messageText,
      guestId: Number(result.lastInsertRowid),
      groupName,
      groupMembers,
      plusOneAdded: hasPlusOneVal && plusOneNameVal ? plusOneNameVal : null
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
  const { name, phone, invite_sent, status, group_name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'O nome do convidado é obrigatório.' });
  }

  const validStatuses = ['ainda nao respondeu', 'confirmou', 'negou', 'Sem Resposta', 'Confirmado', 'Negado'];
  const finalStatus = validStatuses.includes(status) ? status : 'ainda nao respondeu';
  const finalInviteSent = invite_sent ? 1 : 0;
  const finalGroupName = group_name && group_name.trim() ? group_name.trim() : null;

  try {
    const result = await db.execute({
      sql: `INSERT INTO guest_list (name, phone, invite_sent, status, group_name) VALUES (?, ?, ?, ?, ?)`,
      args: [name.trim(), phone ? phone.trim() : null, finalInviteSent, finalStatus, finalGroupName]
    });

    res.status(201).json({
      success: true,
      message: 'Convidado adicionado com sucesso!',
      guest: {
        id: Number(result.lastInsertRowid),
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        invite_sent: finalInviteSent,
        status: finalStatus,
        group_name: finalGroupName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar um convidado (status, checkmark de convite enviado, telefone, nome, grupo, acompanhante)
app.put('/api/guest-list/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, invite_sent, status, group_name, has_plus_one, plus_one_name } = req.body;

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
    const newGroupName = group_name !== undefined 
      ? (group_name && group_name.trim() ? group_name.trim() : null)
      : row.group_name;
    const newHasPlusOne = has_plus_one !== undefined ? (has_plus_one ? 1 : 0) : row.has_plus_one;
    const newPlusOneName = plus_one_name !== undefined 
      ? (plus_one_name && plus_one_name.trim() ? plus_one_name.trim() : null) 
      : row.plus_one_name;

    await db.execute({
      sql: `UPDATE guest_list SET name = ?, phone = ?, invite_sent = ?, status = ?, group_name = ?, has_plus_one = ?, plus_one_name = ? WHERE id = ?`,
      args: [newName, newPhone, newInviteSent, newStatus, newGroupName, newHasPlusOne, newPlusOneName, id]
    });

    // Se o status foi alterado e o convidado pertence a um grupo/família, atualiza todos daquele grupo
    const activeGroup = newGroupName || row.group_name;
    if (status !== undefined && activeGroup) {
      await db.execute({
        sql: `UPDATE guest_list SET status = ? WHERE group_name = ?`,
        args: [newStatus, activeGroup]
      });
    }

    res.json({
      success: true,
      message: 'Convidado atualizado com sucesso!',
      guest: {
        id: Number(id),
        name: newName,
        phone: newPhone,
        invite_sent: newInviteSent,
        status: newStatus,
        group_name: newGroupName,
        has_plus_one: newHasPlusOne,
        plus_one_name: newPlusOneName
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
  app.get('{*splat}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express rodando na porta ${PORT}`);
  console.log(`📡 Health Check em http://localhost:${PORT}/api/health`);
});

export { app };
