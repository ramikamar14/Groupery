import type { Express, Request, Response, NextFunction } from "express";

const BASE_URL = "https://grouperry.com";

const SITE_NAME = "Grouperry";
const SITE_DESCRIPTION =
  "Grouperry is a group-sharing marketplace where people join collective deals on physical goods, digital subscriptions, and services — split costs and save money together.";

// ── robots.txt ────────────────────────────────────────────────────────────────
const ROBOTS_TXT = `User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /
Disallow: /api/

# AI crawlers — explicitly welcome
User-agent: GPTBot
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: ChatGPT-User
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: ClaudeBot
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: anthropic-ai
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: PerplexityBot
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: Google-Extended
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: Googlebot
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: Bingbot
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: DuckAssistBot
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: YouBot
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/llms.txt
`;

// ── sitemap.xml ───────────────────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];
const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/listings</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/how-it-works</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
`;

// ── llms.txt ──────────────────────────────────────────────────────────────────
const LLMS_TXT = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## About

Grouperry is a classifieds-style group-sharing platform. Users can create or join listings across three categories:

- **Physical** — group purchases of physical goods (gadgets, food, clothing, etc.)
- **Digital** — shared digital subscriptions (streaming, SaaS, cloud storage, etc.)
- **Offer** — group discounts and collective service offers

Each listing specifies a total number of slots, a price per slot, and an expiry date. Once all slots are filled the group completes the deal together.

## Key Features

- Browse and search active group listings by category, location, and country
- Join listings as a participant
- Create new group listings with images, pricing, and slot limits
- Real-time messaging between listing creator and participants
- Watchlist / saved listings for registered users
- User reviews and ratings
- AI-powered listing assistant for writing descriptions

## Pages

- [Home](${BASE_URL}/): Landing page with featured and trending listings
- [Browse Listings](${BASE_URL}/listings): Full searchable listing directory
- [How It Works](${BASE_URL}/how-it-works): Step-by-step guide for new users
- [About](${BASE_URL}/about): Company and mission information

## API

- [MCP Server](${BASE_URL}/.well-known/mcp.json): Model Context Protocol server card
- [Agent Skills](${BASE_URL}/.well-known/agent-skills/index.json): Available agent capabilities
- [API Catalog](${BASE_URL}/.well-known/ai-plugin.json): OpenAPI-compatible plugin manifest

## Optional

- [Full Content](${BASE_URL}/llms-full.txt): Extended reference documentation for LLMs
`;

// ── llms-full.txt ─────────────────────────────────────────────────────────────
const LLMS_FULL_TXT = `# ${SITE_NAME} — Full Reference

> ${SITE_DESCRIPTION}

## Platform Overview

Grouperry lets individuals band together to unlock group pricing, shared subscriptions, and collective deals. A listing owner creates a deal with a set number of participant slots. Others join by committing to a slot. When all slots fill, everyone benefits.

## Listing Categories

### Physical
Group purchases of tangible goods. The listing includes a delivery or meetup location. Examples: bulk food orders, group electronics buys, shared market stall.

### Digital
Shared access to digital products. Examples: family streaming plan, team SaaS subscription, shared cloud storage.

### Offer
Group discount or service offers without a fixed cost per slot. Examples: group training sessions, collective service packages.

## Listing Lifecycle

1. **Active** — accepting new participants, slots still available
2. **Completed** — all slots filled, deal is done
3. **Expired** — listing reached its expiry date before filling
4. **Cancelled** — owner cancelled the listing

## User Roles

- **Guest** — can browse listings; cannot join or create
- **Registered user** — can join listings, create listings, message, review, save to watchlist
- **Listing owner** — created the listing; can manage participants and mark complete

## Data Model (key fields)

### Listing
- id, title, description, category (physical|digital|offer)
- totalSlots, filledSlots, pricePerSlot (cents), marketPrice (cents)
- location, country, language
- expiresAt, status (active|completed|expired|cancelled)
- paymentMethod, paymentDetails, distributionType, distributionDetails
- isFeatured, isTrending

### User
- id, username, email, profileImageUrl
- country, bio
- createdAt

## Public REST API Endpoints (read-only, no auth required)

- \`GET /api/listings\` — list active listings (supports ?category, ?country, ?search, ?page)
- \`GET /api/listings/:id\` — get a single listing with full details
- \`GET /api/users/:id\` — get a public user profile

## Agent Capabilities

See [Agent Skills index](${BASE_URL}/.well-known/agent-skills/index.json) for machine-readable skill definitions.

Agents can:
1. Search and browse listings
2. Read listing details including slots, pricing, and location
3. Look up public user profiles
4. Retrieve featured and trending listings
`;

// ── .well-known/mcp.json (MCP Server Card) ───────────────────────────────────
const MCP_SERVER_CARD = {
  name: SITE_NAME,
  version: "1.0.0",
  description: SITE_DESCRIPTION,
  url: `${BASE_URL}/mcp`,
  contact: {
    url: `${BASE_URL}/contact`,
  },
  capabilities: {
    tools: true,
    resources: false,
    prompts: false,
  },
  tools: [
    {
      name: "search_listings",
      description: "Search Grouperry listings by category, country, or keyword.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keyword" },
          category: {
            type: "string",
            enum: ["physical", "digital", "offer"],
            description: "Listing category filter",
          },
          country: { type: "string", description: "ISO country code filter" },
          page: { type: "integer", description: "Page number (default 1)" },
        },
      },
    },
    {
      name: "get_listing",
      description: "Get full details of a specific Grouperry listing by ID.",
      inputSchema: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "integer", description: "Listing ID" },
        },
      },
    },
  ],
  links: {
    homepage: BASE_URL,
    llms_txt: `${BASE_URL}/llms.txt`,
    sitemap: `${BASE_URL}/sitemap.xml`,
    agent_skills: `${BASE_URL}/.well-known/agent-skills/index.json`,
  },
};

// ── .well-known/agent-skills/index.json ──────────────────────────────────────
const AGENT_SKILLS_INDEX = {
  version: "1.0",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  skills: [
    {
      name: "search-listings",
      description: "Search and browse group listings on Grouperry",
      url: `${BASE_URL}/.well-known/agent-skills/search-listings.json`,
    },
    {
      name: "get-listing",
      description: "Retrieve full details of a specific group listing",
      url: `${BASE_URL}/.well-known/agent-skills/get-listing.json`,
    },
    {
      name: "get-featured",
      description: "Retrieve featured and trending listings",
      url: `${BASE_URL}/.well-known/agent-skills/get-featured.json`,
    },
  ],
};

const SKILL_SEARCH_LISTINGS = {
  name: "search-listings",
  version: "1.0",
  description: "Search and browse group listings on Grouperry by keyword, category, or country.",
  contact: `${BASE_URL}/contact`,
  input: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search keyword or phrase" },
      category: {
        type: "string",
        enum: ["physical", "digital", "offer"],
        description: "Filter by listing category",
      },
      country: { type: "string", description: "Filter by ISO 3166-1 alpha-2 country code" },
      page: { type: "integer", description: "Pagination page number, starting at 1" },
    },
  },
  output: {
    type: "object",
    properties: {
      listings: {
        type: "array",
        description: "Array of matching listings",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            pricePerSlot: { type: "integer", description: "Price in cents" },
            totalSlots: { type: "integer" },
            filledSlots: { type: "integer" },
            country: { type: "string" },
            expiresAt: { type: "string", format: "date-time" },
          },
        },
      },
      total: { type: "integer" },
      page: { type: "integer" },
    },
  },
  api: {
    method: "GET",
    url: `${BASE_URL}/api/listings`,
    parameters: {
      query: "search",
      category: "category",
      country: "country",
      page: "page",
    },
  },
};

const SKILL_GET_LISTING = {
  name: "get-listing",
  version: "1.0",
  description: "Retrieve full details of a specific Grouperry group listing by its numeric ID.",
  contact: `${BASE_URL}/contact`,
  input: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "integer", description: "The numeric listing ID" },
    },
  },
  output: {
    type: "object",
    properties: {
      id: { type: "integer" },
      title: { type: "string" },
      description: { type: "string" },
      category: { type: "string" },
      pricePerSlot: { type: "integer", description: "Price per slot in cents" },
      marketPrice: { type: "integer", description: "Normal market price in cents" },
      totalSlots: { type: "integer" },
      filledSlots: { type: "integer" },
      location: { type: "string" },
      country: { type: "string" },
      status: { type: "string" },
      expiresAt: { type: "string", format: "date-time" },
      creator: { type: "object" },
    },
  },
  api: {
    method: "GET",
    url: `${BASE_URL}/api/listings/{id}`,
  },
};

const SKILL_GET_FEATURED = {
  name: "get-featured",
  version: "1.0",
  description: "Retrieve featured and trending group listings on Grouperry.",
  contact: `${BASE_URL}/contact`,
  input: { type: "object", properties: {} },
  output: {
    type: "object",
    properties: {
      featured: { type: "array", description: "Featured listings" },
      trending: { type: "array", description: "Trending listings" },
    },
  },
  api: {
    method: "GET",
    url: `${BASE_URL}/api/listings?featured=true`,
  },
};

// ── .well-known/ai-plugin.json (API Catalog / plugin manifest) ────────────────
const AI_PLUGIN = {
  schema_version: "v1",
  name_for_human: SITE_NAME,
  name_for_model: "grouperry",
  description_for_human:
    "Browse and search group deals on Grouperry — the group-sharing marketplace.",
  description_for_model:
    "Grouperry is a group-sharing marketplace. Use this plugin to search listings by category (physical, digital, offer), retrieve listing details including slots, pricing, location, and expiry. All listing endpoints are public and require no authentication.",
  auth: { type: "none" },
  api: {
    type: "openapi",
    url: `${BASE_URL}/.well-known/openapi.json`,
    is_user_authenticated: false,
  },
  logo_url: `${BASE_URL}/favicon.png`,
  contact_email: "support@grouperry.com",
  legal_info_url: `${BASE_URL}/terms`,
};

// ── OpenAPI schema ────────────────────────────────────────────────────────────
const OPENAPI_SCHEMA = {
  openapi: "3.1.0",
  info: {
    title: `${SITE_NAME} Public API`,
    version: "1.0.0",
    description: SITE_DESCRIPTION,
    contact: { url: `${BASE_URL}/contact` },
  },
  servers: [{ url: BASE_URL }],
  paths: {
    "/api/listings": {
      get: {
        operationId: "listListings",
        summary: "List active group listings",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Keyword search" },
          {
            name: "category",
            in: "query",
            schema: { type: "string", enum: ["physical", "digital", "offer"] },
            description: "Category filter",
          },
          { name: "country", in: "query", schema: { type: "string" }, description: "Country code filter" },
          { name: "page", in: "query", schema: { type: "integer" }, description: "Page number" },
        ],
        responses: {
          "200": {
            description: "List of listings",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    listings: { type: "array", items: { $ref: "#/components/schemas/Listing" } },
                    total: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/listings/{id}": {
      get: {
        operationId: "getListing",
        summary: "Get a single listing by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Listing detail",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Listing" },
              },
            },
          },
          "404": { description: "Listing not found" },
        },
      },
    },
  },
  components: {
    schemas: {
      Listing: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string" },
          category: { type: "string", enum: ["physical", "digital", "offer"] },
          status: { type: "string", enum: ["active", "completed", "expired", "cancelled"] },
          totalSlots: { type: "integer" },
          filledSlots: { type: "integer" },
          pricePerSlot: { type: "integer", nullable: true, description: "Price in cents" },
          marketPrice: { type: "integer", nullable: true, description: "Market price in cents" },
          location: { type: "string", nullable: true },
          country: { type: "string", nullable: true },
          expiresAt: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          isFeatured: { type: "boolean" },
          isTrending: { type: "boolean" },
        },
      },
    },
  },
};

// ── Markdown homepage content ─────────────────────────────────────────────────
const HOME_MARKDOWN = `# ${SITE_NAME}

${SITE_DESCRIPTION}

## Browse Listings

Visit [/listings](${BASE_URL}/listings) to browse all active group deals.

## Categories

- **Physical** — group buys for physical goods
- **Digital** — shared subscriptions and software licenses
- **Offer** — group discounts and collective service deals

## How It Works

1. Browse or search available group listings
2. Join a listing by claiming a slot
3. Coordinate with the group and complete the deal together

## Links

- [Browse all listings](${BASE_URL}/listings)
- [How it works](${BASE_URL}/how-it-works)
- [About Grouperry](${BASE_URL}/about)
- [API documentation](${BASE_URL}/.well-known/openapi.json)
`;

// ── Link header value ─────────────────────────────────────────────────────────
const LINK_HEADER = [
  `<${BASE_URL}/sitemap.xml>; rel="sitemap"`,
  `<${BASE_URL}/llms.txt>; rel="describedby"; type="text/plain"`,
  `<${BASE_URL}/.well-known/mcp.json>; rel="mcp-server"`,
  `<${BASE_URL}/.well-known/agent-skills/index.json>; rel="agent-skills"`,
].join(", ");

export function registerAgentReadyRoutes(app: Express): void {
  // ── Link headers on all non-API HTML responses ──────────────────────────────
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith("/api")) {
      res.set("Link", LINK_HEADER);
      // Content signal: allow AI indexing
      res.set("X-Robots-Tag", "index, follow");
    }
    next();
  });

  // ── robots.txt ──────────────────────────────────────────────────────────────
  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.type("text/plain").send(ROBOTS_TXT);
  });

  // ── sitemap.xml ─────────────────────────────────────────────────────────────
  app.get("/sitemap.xml", (_req: Request, res: Response) => {
    res.type("application/xml").send(SITEMAP_XML);
  });

  // ── llms.txt ────────────────────────────────────────────────────────────────
  app.get("/llms.txt", (_req: Request, res: Response) => {
    res.type("text/plain").send(LLMS_TXT);
  });

  // ── llms-full.txt ───────────────────────────────────────────────────────────
  app.get("/llms-full.txt", (_req: Request, res: Response) => {
    res.type("text/plain").send(LLMS_FULL_TXT);
  });

  // ── Markdown content negotiation — homepage ─────────────────────────────────
  app.get("/", (req: Request, res: Response, next: NextFunction) => {
    const accept = req.headers.accept ?? "";
    if (accept.includes("text/markdown")) {
      res.type("text/markdown").send(HOME_MARKDOWN);
      return;
    }
    next();
  });

  // ── MCP Server Card ─────────────────────────────────────────────────────────
  app.get("/.well-known/mcp.json", (_req: Request, res: Response) => {
    res.json(MCP_SERVER_CARD);
  });

  // ── Agent Skills index ──────────────────────────────────────────────────────
  app.get("/.well-known/agent-skills/index.json", (_req: Request, res: Response) => {
    res.json(AGENT_SKILLS_INDEX);
  });

  app.get("/.well-known/agent-skills/search-listings.json", (_req: Request, res: Response) => {
    res.json(SKILL_SEARCH_LISTINGS);
  });

  app.get("/.well-known/agent-skills/get-listing.json", (_req: Request, res: Response) => {
    res.json(SKILL_GET_LISTING);
  });

  app.get("/.well-known/agent-skills/get-featured.json", (_req: Request, res: Response) => {
    res.json(SKILL_GET_FEATURED);
  });

  // ── AI Plugin manifest (API catalog) ───────────────────────────────────────
  app.get("/.well-known/ai-plugin.json", (_req: Request, res: Response) => {
    res.json(AI_PLUGIN);
  });

  // ── OpenAPI schema ──────────────────────────────────────────────────────────
  app.get("/.well-known/openapi.json", (_req: Request, res: Response) => {
    res.json(OPENAPI_SCHEMA);
  });

  // ── API Catalog — RFC 9727 (linkset+json) ────────────────────────────────────
  app.get("/.well-known/api-catalog", (_req: Request, res: Response) => {
    res.type("application/linkset+json").json({
      linkset: [
        {
          anchor: `${BASE_URL}/api/listings`,
          "service-desc": [{ href: `${BASE_URL}/.well-known/openapi.json`, type: "application/schema+json" }],
          "service-doc": [{ href: `${BASE_URL}/.well-known/openapi.json` }],
          status: [{ href: `${BASE_URL}/health` }],
        },
      ],
    });
  });

  // ── OAuth Authorization Server metadata — RFC 8414 ───────────────────────────
  app.get("/.well-known/oauth-authorization-server", (_req: Request, res: Response) => {
    res.json({
      issuer: BASE_URL,
      authorization_endpoint: `${BASE_URL}/api/auth/login`,
      token_endpoint: `${BASE_URL}/api/auth/token`,
      userinfo_endpoint: `${BASE_URL}/api/auth/user`,
      grant_types_supported: ["authorization_code"],
      response_types_supported: ["code"],
      code_challenge_methods_supported: ["S256"],
      scopes_supported: ["read:listings", "write:listings", "read:profile", "write:profile"],
    });
  });

  // ── OpenID Connect Discovery — https://openid.net/specs/openid-connect-discovery-1_0.html
  app.get("/.well-known/openid-configuration", (_req: Request, res: Response) => {
    res.json({
      issuer: BASE_URL,
      authorization_endpoint: `${BASE_URL}/api/auth/login`,
      token_endpoint: `${BASE_URL}/api/auth/token`,
      userinfo_endpoint: `${BASE_URL}/api/auth/user`,
      grant_types_supported: ["authorization_code"],
      response_types_supported: ["code"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      scopes_supported: ["openid", "profile", "email"],
    });
  });

  // ── OAuth Protected Resource Metadata — RFC 9728 ─────────────────────────────
  app.get("/.well-known/oauth-protected-resource", (_req: Request, res: Response) => {
    res.json({
      resource: BASE_URL,
      authorization_servers: [BASE_URL],
      scopes_supported: ["read:listings", "write:listings", "read:profile", "write:profile"],
      bearer_methods_supported: ["header", "cookie"],
      resource_documentation: `${BASE_URL}/.well-known/openapi.json`,
    });
  });
}
