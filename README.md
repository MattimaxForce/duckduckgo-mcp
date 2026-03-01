# 🚀 MCP Server with DuckDuckGo (Free)

An MCP server that performs free internet searches using DuckDuckGo — fully compatible with the **Model Context Protocol (MCP)** ecosystem and ready to use with Claude tools like Claude Code, Claude Desktop, Cursor, and any MCP client supporting **STDIO transport**.

---

# 🚀 How to Install It (All Methods)

## ✅ Method 1: Claude Code (Recommended – Global)

Install globally so it’s available everywhere:

```bash
claude mcp add duckduckgo -- npx -y duckduckgo-mcp-server
```

---

## ✅ Method 2: Claude Code (Project Scope)

Install only for the current project (saved in `.mcp.json`):

```bash
claude mcp add duckduckgo -s project -- node /full/path/to/duckduckgo-mcp-server.js
```

---

## ✅ Method 3: Claude Desktop

### 🪟 Windows

Path:

```
%APPDATA%/Claude/claude_desktop_config.json
```

### 🍎 macOS / 🐧 Linux

Path:

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

Add:

```json
{
  "mcpServers": {
    "duckduckgo": {
      "command": "npx",
      "args": ["-y", "duckduckgo-mcp-server"]
    }
  }
}
```

---

## ✅ Method 4: Cursor IDE

In Cursor:

**Settings → MCP Servers → Add**

* **Name:** duckduckgo
* **Type:** command
* **Command:**

```bash
npx -y duckduckgo-mcp-server
```

---

# 🚀 Alternative: Run the Local File Directly

If you're using the standalone file version:

```
duckduckgo-mcp-server.js
```

---

## ✅ Method 5: Direct Node (Simple)

```bash
# First run auto-installs dependencies
node duckduckgo-mcp-server.js
```

---

## ✅ Method 6: Executable (Linux/Mac)

```bash
chmod +x duckduckgo-mcp-server.js
./duckduckgo-mcp-server.js
```

---

## ✅ Method 7: Manual Client Configuration (Local File Example)

### 🪟 Windows

```json
{
  "mcpServers": {
    "internet-search": {
      "command": "node",
      "args": ["C:\\Users\\YOUR_NAME\\Desktop\\duckduckgo-mcp-server.js"]
    }
  }
}
```

### 🍎 Mac / 🐧 Linux

```json
{
  "mcpServers": {
    "internet-search": {
      "command": "node",
      "args": ["/Users/your_name/Desktop/duckduckgo-mcp-server.js"]
    }
  }
}
```

---

# 🎯 Improvements Included

## 🔄 Updated SDK

* Upgraded to **MCP SDK v1.0.4**
* Compatible with MCP specification **2025-06-18**

---

## 🛠 Improved Tools

| Tool            | Description                     |
| --------------- | ------------------------------- |
| `web_search`    | General web search              |
| `news_search`   | News search with time filtering |
| `search_images` | Image search                    |

---

## 🛡 Robust Error Handling

* All logs go to **stderr** (stdout strictly reserved for MCP protocol)
* Informative user-facing error messages
* Never corrupts the MCP JSON stream

---

## ⚙ Reliable Auto-Installation

* Silent dependency install (`--silent`)
* 2-minute timeout protection
* Automatic restart after dependency installation
* Windows compatible (`windowsHide: true`)

---

## 🌍 Universal Compatibility

* Works with Claude Code
* Works with Claude Desktop
* Works with Cursor
* Works with any MCP client supporting STDIO
* Graceful shutdown handling (SIGINT / SIGTERM)

---

# ✨ What Makes This Universal

| Feature               | Benefit                             |
| --------------------- | ----------------------------------- |
| Single file option    | Copy, paste, works                  |
| npm package option    | Install globally in seconds         |
| Auto-install          | No manual npm setup                 |
| STDIO transport       | Compatible with any MCP client      |
| No API key            | DuckDuckGo is free and anonymous    |
| Robust error handling | Always returns structured responses |
| 3 powerful tools      | Web, News, and Image search         |

---

# 🔧 Requirements

* Node.js installed (download from [https://nodejs.org](https://nodejs.org) if needed)
* Internet connection (for searches + first-time installation)

---

# 💡 How to Use After Installation

Just ask:

* “Search the internet for the latest Node.js news”
* “Find documentation about the MCP protocol”
* “Search images of modern UI design”

The model will automatically invoke:

* `web_search`
* `news_search`
* `search_images`

## Maded by: MattimaxForce
