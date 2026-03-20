import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import Database from 'better-sqlite3';
import fs from 'fs';

const isProd = process.env.NODE_ENV === 'production';
const dbPath = isProd ? path.join(process.cwd(), 'data', 'erp.db') : 'erp.db';

// Ensure data directory exists if in prod
if (isProd && !fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

const db = new Database(dbPath);

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS responsaveis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT
  );

  CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cnpj TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    regime_tributario TEXT NOT NULL,
    ativo INTEGER DEFAULT 1,
    responsavel_id INTEGER,
    FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id)
  );

  CREATE TABLE IF NOT EXISTS conciliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    mes_ano TEXT NOT NULL,
    departamento TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );
`);

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // API Routes
  
  // Responsáveis
  app.get('/api/responsaveis', (req, res) => {
    const rows = db.prepare('SELECT * FROM responsaveis').all();
    res.json(rows);
  });

  app.post('/api/responsaveis', (req, res) => {
    const { nome, email, telefone } = req.body;
    const info = db.prepare('INSERT INTO responsaveis (nome, email, telefone) VALUES (?, ?, ?)').run(nome, email, telefone);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete('/api/responsaveis/:id', (req, res) => {
    db.prepare('DELETE FROM responsaveis WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Empresas
  app.get('/api/empresas', (req, res) => {
    const rows = db.prepare(`
      SELECT e.*, r.nome as responsavel_nome 
      FROM empresas e 
      LEFT JOIN responsaveis r ON e.responsavel_id = r.id
    `).all();
    res.json(rows);
  });

  app.post('/api/empresas', (req, res) => {
    const { cnpj, nome, regime_tributario, responsavel_id } = req.body;
    try {
      const info = db.prepare('INSERT INTO empresas (cnpj, nome, regime_tributario, responsavel_id) VALUES (?, ?, ?, ?)').run(cnpj, nome, regime_tributario, responsavel_id);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/empresas/:id', (req, res) => {
    const { nome, regime_tributario, responsavel_id, ativo } = req.body;
    db.prepare('UPDATE empresas SET nome = ?, regime_tributario = ?, responsavel_id = ?, ativo = ? WHERE id = ?')
      .run(nome, regime_tributario, responsavel_id, ativo ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/empresas/:id', (req, res) => {
    db.prepare('DELETE FROM empresas WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Conciliações
  app.get('/api/conciliacoes', (req, res) => {
    const { mes_ano, empresa_id } = req.query;
    let query = `
      SELECT c.*, e.nome as empresa_nome 
      FROM conciliacoes c 
      JOIN empresas e ON c.empresa_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (mes_ano) {
      query += " AND c.mes_ano = ?";
      params.push(mes_ano);
    }
    if (empresa_id) {
      query += " AND c.empresa_id = ?";
      params.push(empresa_id);
    }
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  });

  app.post('/api/conciliacoes', (req, res) => {
    const { empresa_id, mes_ano, departamento, status } = req.body;
    // Check if exists
    const existing = db.prepare('SELECT id FROM conciliacoes WHERE empresa_id = ? AND mes_ano = ? AND departamento = ?').get(empresa_id, mes_ano, departamento);
    
    if (existing) {
      db.prepare('UPDATE conciliacoes SET status = ? WHERE id = ?').run(status, (existing as any).id);
      res.json({ id: (existing as any).id, updated: true });
    } else {
      const info = db.prepare('INSERT INTO conciliacoes (empresa_id, mes_ano, departamento, status) VALUES (?, ?, ?, ?)').run(empresa_id, mes_ano, departamento, status);
      res.json({ id: info.lastInsertRowid });
    }
  });

  // Reports
  app.get('/api/reports/txt', (req, res) => {
    const { empresa_id, mes_ano, status } = req.query;
    let query = `
      SELECT c.*, e.nome as empresa_nome, e.cnpj 
      FROM conciliacoes c 
      JOIN empresas e ON c.empresa_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (empresa_id) { query += " AND c.empresa_id = ?"; params.push(empresa_id); }
    if (mes_ano) { query += " AND c.mes_ano = ?"; params.push(mes_ano); }
    if (status) { query += " AND c.status = ?"; params.push(status); }

    const rows = db.prepare(query).all(...params) as any[];

    let report = "============================================================\n";
    report += "                RELATORIO DE CONCILIACAO                    \n";
    report += `DATA: ${new Date().toLocaleString()}                         \n`;
    report += "============================================================\n\n";
    report += "EMPRESA                        | DEPTO    | STATUS    | MES/ANO\n";
    report += "------------------------------------------------------------\n";
    
    rows.forEach(row => {
      const emp = row.empresa_nome.padEnd(30).substring(0, 30);
      const dep = row.departamento.padEnd(8).substring(0, 8);
      const sta = row.status.padEnd(10).substring(0, 10);
      const per = row.mes_ano;
      report += `${emp} | ${dep} | ${sta} | ${per}\n`;
    });
    
    report += "\n============================================================\n";
    report += `TOTAL DE REGISTROS: ${rows.length}\n`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio.txt');
    res.send(report);
  });

  // Vite Integration
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000');
  });
}

startServer();
