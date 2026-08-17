---
name: confluence-mcp
description: Search, read, and update Cisco Confluence pages through the `confluence` MCP server — search and update only, never create pages.
---

# Confluence MCP Skill

## Usage Policy: Search and Update Only

> **Do not create new Confluence pages with this MCP.**
>
> We do **not** have permission to delete pages. If the agent creates pages incorrectly or creates too many, there is no way to clean them up.

**Do:**
- Search for existing pages via CQL.
- Fetch pages by ID, title, or URL.
- Read and summarize pages.
- Update existing pages when explicitly requested.

**Do not:**
- Create new pages via the MCP.
- Delete pages (not possible regardless).

## Available Tools

| Tool | Purpose |
|---|---|
| `search_confluence_pages` | Search using CQL (Confluence Query Language). |
| `get_confluence_page_by_id` | Fetch a page by its numeric ID. |
| `get_confluence_page_by_title` | Fetch a page by its title. |
| `get_confluence_page_by_url` | Fetch a page by its URL. |
| `call_confluence_rest_api` | Generic REST access. **Reads and updates only.** |

## Format Requirements

- **Updates** must use Confluence storage-format XHTML, or wiki markup where the API explicitly accepts it.
- Never send raw Markdown as a page body. It will render as plain text.
- Escape text correctly and use CDATA for code content.
- **Prose style:** follow [Writing for humans](../../../AGENTS.md#writing-for-humans-readme-docs-and-code). Use plain language and avoid semicolons or dash punctuation in page prose.

## Safety

- Probe the MCP only when the task needs it.
- Stop clearly if the connector is unavailable.
- Never copy tokens or auth details into context files.
- Requires an authenticated enterprise MCP connection.
- Do not copy raw page content, private URLs, hostnames, or page IDs into committed repository files. Use a sanitized summary instead.
