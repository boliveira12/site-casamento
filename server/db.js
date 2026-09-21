import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL || `file:${path.join(__dirname, 'wedding.db')}`;

export const db = createClient({
  url: dbUrl,
});

export async function initDb() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        attending INTEGER DEFAULT 1,
        dietary_restrictions TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS gift_registry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        price REAL,
        image_url TEXT,
        reserved_by TEXT,
        reserved INTEGER DEFAULT 0
      );
    `);



    await db.execute(`
      CREATE TABLE IF NOT EXISTS guest_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        invite_sent INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Pendente',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migrações dinâmicas para Grupos/Famílias e Mensagens Privadas
    try { await db.execute(`ALTER TABLE guests ADD COLUMN group_name TEXT`); } catch {}
    try { await db.execute(`ALTER TABLE guest_list ADD COLUMN group_name TEXT`); } catch {}
    try { await db.execute(`ALTER TABLE guests ADD COLUMN private_message INTEGER DEFAULT 0`); } catch {}

    // Limpeza de dados legados de acompanhantes (plus one)
    try { await db.execute(`UPDATE guest_list SET has_plus_one = 0, plus_one_name = NULL`); } catch {}
    try { await db.execute(`UPDATE guests SET has_plus_one = 0, plus_one_name = NULL`); } catch {}

    // Normalização dos status legados para apenas os valores padrão: Confirmado, Negado, Pendente
    try {
      await db.execute(`
        UPDATE guest_list 
        SET status = 'Confirmado' 
        WHERE LOWER(TRIM(status)) IN ('confirmou', 'confirmado', 'sim');
      `);
      await db.execute(`
        UPDATE guest_list 
        SET status = 'Negado' 
        WHERE LOWER(TRIM(status)) IN ('negou', 'negado', 'recusou', 'recusado', 'nao', 'não');
      `);
      await db.execute(`
        UPDATE guest_list 
        SET status = 'Pendente' 
        WHERE status IS NULL 
           OR LOWER(TRIM(status)) IN ('ainda nao respondeu', 'ainda não respondeu', 'sem resposta', 'pendente', '') 
           OR status NOT IN ('Confirmado', 'Negado', 'Pendente');
      `);
    } catch (e) {
      console.error('⚠️ Erro ao normalizar status da tabela guest_list:', e);
    }

    console.log('✅ Banco de dados SQLite inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados SQLite:', error);
  }
}
