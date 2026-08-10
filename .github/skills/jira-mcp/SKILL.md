---
name: jira-mcp
description: Search, read, and update Cisco Jira issues through the `jira` MCP server — search and update only, never create issues.
source_url: https://confluence-eng-gpk2.cisco.com/conf/spaces/webexmedia/pages/836486533/Jira+MCP
source_hash: e0e65762072f4623998729bf065a39e43b511d170c46e604c48030a3d2202c84
last_verified: 2026-07-29
---

# Jira MCP Skill

## Usage Policy: Search and Update Only

> **Do not create new Jira issues with this MCP.**
>
> Keep the MCP scoped to searching and updating existing issues. The agent can create issues incorrectly or create too many, and cleanup is painful.

**Do:**
- Search for existing issues via JQL.
- Read and summarize issues.
- Update fields on existing issues when explicitly requested.
- Add labels to existing issues (non-destructive, preserves existing labels).

**Do not:**
- Create new issues via the MCP.
- Delete issues.
- Overwrite existing labels (use `add_labels` instead).

## Available Tools

| Tool | Purpose |
|---|---|
| `add_labels` | Add labels without overriding existing labels. |
| `get_field_info` | Look up field IDs and types by name or search term. |
| `call_jira_rest_api` | Generic REST access. **Reads and updates only.** |

## Resources (Read-Only Context)

| Resource | Description |
|---|---|
| `jira://current-user` | Current authenticated user details. |
| `jira://auth-status` | Authentication status and configuration. |
| `jira://fieldIDs` | Mapping of field names to IDs. |
| `jira://server-info` | Server information (check for Cloud vs Server). |

## Format Requirements

- **Jira Server (v2 API):** Use Jira wiki markup for description and comment fields. Never send raw Markdown.
- **Jira Cloud:** Use ADF JSON. Check `jira://server-info` to determine which.
- Use Jira emoticons (`(!)`, `(x)`, `(/)`, `(i)`) not Unicode emoji.
- Use `get_field_info` before changing unfamiliar fields.

## Safety

- Probe the MCP only when the task needs it.
- Stop clearly if the connector is unavailable.
- Never copy tokens or auth details into context files.
- Requires Cisco network/VPN access.
