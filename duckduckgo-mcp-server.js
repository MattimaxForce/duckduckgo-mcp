#!/usr/bin/env node

/**
 * 🦆 DUCKDUCKGO MCP SERVER - VERSIONE PRODUZIONE
 * 
 * Server MCP universale per ricerche web via DuckDuckGo.
 * 
 * INSTALLAZIONE RAPIDA (Claude Code):
 *   claude mcp add duckduckgo -- npx -y duckduckgo-mcp-server
 * 
 * OPPURE per scope progetto:
 *   claude mcp add duckduckgo -s project -- node /percorso/duckduckgo-mcp.js
 * 
 * Caratteristiche:
 * - Zero configurazione richiesta
 * - Auto-installazione dipendenze
 * - Compatibile con Claude Code, Claude Desktop, Cursor, e altri client MCP
 * - Nessuna API key necessaria
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// ============================================
// CONFIGURAZIONE
// ============================================

const CONFIG = {
  name: 'duckduckgo-search',
  version: '1.0.0',
  maxResults: 10,
  packages: [
    '@modelcontextprotocol/sdk@1.0.4',
    'duck-duck-scrape@2.2.5'
  ]
};

// ============================================
// AUTO-INSTALLAZIONE DIPENDENZE
// ============================================

function ensureDependencies() {
  // Se già disponibili, prosegui
  try {
    require('@modelcontextprotocol/sdk');
    require('duck-duck-scrape');
    return true;
  } catch (e) {
    // Procedi con installazione
  }

  const scriptDir = path.dirname(process.argv[1] || process.cwd());
  const nodeModulesPath = path.join(scriptDir, 'node_modules');

  console.error('📦 Prima esecuzione: installazione dipendenze...');
  console.error('   Questo potrebbe richiedere un minuto...');

  try {
    // Crea package.json se mancante
    const packageJsonPath = path.join(scriptDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      fs.writeFileSync(packageJsonPath, JSON.stringify({
        name: "duckduckgo-mcp-server",
        version: "1.0.0",
        description: "MCP server for DuckDuckGo search",
        private: true
      }, null, 2));
    }

    // Installa dipendenze localmente nello script dir
    execSync(`npm install ${CONFIG.packages.join(' ')} --silent`, {
      cwd: scriptDir,
      stdio: 'pipe',
      timeout: 120000,
      windowsHide: true
    });

    console.error('✅ Dipendenze installate! Riavvio server...\n');

    // Riavvia processo con le nuove dipendenze disponibili
    const child = spawn(process.argv[0], process.argv.slice(1), {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: process.env,
      detached: false
    });

    child.on('exit', (code) => process.exit(code));
    return false; // Indica riavvio in corso

  } catch (error) {
    console.error('❌ Errore installazione dipendenze:', error.message);
    console.error('\n💡 Soluzioni alternative:');
    console.error('   1. Esegui manualmente: npm install -g duckduckgo-mcp-server');
    console.error('   2. Oppure: cd "' + scriptDir + '" && npm install ' + CONFIG.packages.join(' '));
    console.error('   3. Verifica che Node.js sia installato: node --version');
    process.exit(1);
  }
}

// Esegui check prima di tutto
if (!ensureDependencies()) {
  return; // Riavvio in corso, termina questo processo
}

// ============================================
// IMPORTAZIONI (dopo installazione)
// ============================================

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const duckduckgo = require('duck-duck-scrape');

// ============================================
// SCHEMA STRUMENTI MCP
// ============================================

const TOOLS = [
  {
    name: 'web_search',
    description: 'Cerca informazioni su internet usando DuckDuckGo. ' +
      'Usa questo strumento per ottenere dati aggiornati, verificare fatti, ' +
      'trovare documentazione tecnica, o esplorare argomenti specifici. ' +
      'Esempio: query: "React 19 new features 2024"',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Testo da cercare su internet (obbligatorio)'
        },
        limit: {
          type: 'number',
          description: 'Numero massimo di risultati (1-10)',
          default: 5,
          minimum: 1,
          maximum: 10
        }
      },
      required: ['query']
    }
  },
  {
    name: 'news_search',
    description: 'Cerca notizie recenti su internet. ' +
      'Ideale per ultime notizie, aggiornamenti in tempo reale, eventi recenti. ' +
      'Esempio: query: "ultime notizie intelligenza artificiale"',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Argomento notizie da cercare (obbligatorio)'
        },
        limit: {
          type: 'number',
          description: 'Numero massimo di notizie (1-10)',
          default: 5,
          minimum: 1,
          maximum: 10
        }
      },
      required: ['query']
    }
  },
  {
    name: 'search_images',
    description: 'Cerca immagini su internet tramite DuckDuckGo. ' +
      'Utile per trovare immagini di riferimento, icone, diagrammi, o contenuti visivi. ' +
      'Esempio: query: "diagramma architettura microservizi"',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Descrizione immagine da cercare (obbligatorio)'
        },
        limit: {
          type: 'number',
          description: 'Numero massimo di risultati (1-10)',
          default: 5,
          minimum: 1,
          maximum: 10
        }
      },
      required: ['query']
    }
  }
];

// ============================================
// LOGICA DI RICERCA
// ============================================

async function performSearch(query, limit = 5, type = 'regular') {
  const startTime = Date.now();

  try {
    console.error(`🔍 [${type.toUpperCase()}] "${query}" (max: ${limit})`);

    let searchOptions = {
      safeSearch: duckduckgo.SafeSearchType.OFF
    };

    let results;

    switch (type) {
      case 'news':
        // Per le notizie, usiamo search con filtri temporali impliciti
        results = await duckduckgo.search(query, {
          ...searchOptions,
          timeRange: 'w' // ultima settimana per notizie recenti
        });
        // Filtra risultati che sembrano notizie
        results = results.results.filter(r => {
          const text = (r.title + ' ' + r.description).toLowerCase();
          return /news|notizie|report|update|annuncio|launch/i.test(text) ||
            /202[4-5]|oggi|ieri|ultim|recent/i.test(text);
        });
        break;

      case 'images':
        results = await duckduckgo.searchImages(query, searchOptions);
        break;

      default: // regular
        results = await duckduckgo.search(query, searchOptions);
        results = results.results;
    }

    // Limita risultati
    const limited = results.slice(0, Math.min(limit, CONFIG.maxResults));
    const duration = Date.now() - startTime;

    console.error(`✅ Trovati ${limited.length} risultati in ${duration}ms`);

    return {
      success: true,
      query,
      type,
      count: limited.length,
      results: limited.map((r, i) => ({
        position: i + 1,
        title: r.title,
        url: r.url,
        description: r.description || r.snippet || '',
        ...(r.image && { imageUrl: r.image }) // per ricerche immagini
      }))
    };

  } catch (error) {
    console.error(`❌ Errore ricerca: ${error.message}`);
    throw new Error(`Ricerca fallita: ${error.message}`);
  }
}

function formatResults(data) {
  if (!data.results || data.results.length === 0) {
    return `Nessun risultato trovato per "${data.query}".\nProva a riformulare la ricerca con termini diversi.`;
  }

  let output = `🔍 Risultati per: "${data.query}" (${data.count} trovati)\n`;
  output += `────────────────────────────────────────\n\n`;

  data.results.forEach(r => {
    output += `[${r.position}] ${r.title}\n`;
    output += `URL: ${r.url}\n`;
    if (r.imageUrl) {
      output += `Immagine: ${r.imageUrl}\n`;
    }
    if (r.description) {
      output += `${r.description}\n`;
    }
    output += `\n---\n\n`;
  });

  return output.trim();
}

// ============================================
// SERVER MCP
// ============================================

const server = new Server(
  {
    name: CONFIG.name,
    version: CONFIG.version
  },
  {
    capabilities: {
      tools: {},
      logging: {} // Supporto per logging strutturato
    }
  }
);

// Handler: lista strumenti
server.setRequestHandler('tools/list', async () => {
  return { tools: TOOLS };
});

// Handler: chiamata strumenti
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let data;

    switch (name) {
      case 'web_search':
        data = await performSearch(args.query, args.limit || 5, 'regular');
        return {
          content: [{
            type: 'text',
            text: formatResults(data)
          }],
          isError: false
        };

      case 'news_search':
        data = await performSearch(args.query, args.limit || 5, 'news');
        return {
          content: [{
            type: 'text',
            text: '📰 ' + formatResults(data)
          }],
          isError: false
        };

      case 'search_images':
        data = await performSearch(args.query, args.limit || 5, 'images');
        return {
          content: [{
            type: 'text',
            text: '🖼️ ' + formatResults(data)
          }],
          isError: false
        };

      default:
        throw new Error(`Strumento sconosciuto: ${name}. Strumenti disponibili: web_search, news_search, search_images`);
    }

  } catch (error) {
    // Log errore su stderr (non stdout!)
    console.error(`❌ Errore tool ${name}:`, error.message);

    return {
      content: [{
        type: 'text',
        text: `❌ Errore durante l'esecuzione di ${name}:\n${error.message}\n\n💡 Suggerimento: verifica la connessione internet e riprova.`
      }],
      isError: true
    };
  }
});

// Handler: logging (opzionale ma utile per debug)
server.setRequestHandler('logging/setLevel', async (request) => {
  // Accetta qualsiasi livello di logging, logga su stderr
  console.error(`📝 Log level impostato: ${request.params.level}`);
  return {};
});

// ============================================
// AVVIO SERVER
// ============================================

async function main() {
  // Log iniziali su stderr (mai stdout!)
  console.error('🦆 DuckDuckGo MCP Server v' + CONFIG.version);
  console.error('───────────────────────────────');
  console.error('✅ Server pronto');
  console.error('📡 Trasporto: STDIO');
  console.error('🔧 Strumenti: web_search, news_search, search_images');
  console.error('');

  const transport = new StdioServerTransport();

  // Gestione graceful shutdown
  process.on('SIGINT', () => {
    console.error('\n👋 Server terminato (SIGINT)');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.error('\n👋 Server terminato (SIGTERM)');
    process.exit(0);
  });

  // Gestione errori non catturati
  process.on('uncaughtException', (err) => {
    console.error('💥 Errore non catturato:', err);
    process.exit(1);
  });

  await server.connect(transport);

  console.error('🚀 Connesso al client MCP');
}

main().catch((err) => {
  console.error('💥 Errore fatale:', err);
  process.exit(1);
});