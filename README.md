# Bond sports task

This is my solution for the home assignment task from Bond Sport.

## Setup
First, install it:

```bash
pnpm install
```

If you don't have `pnpm` install it - it's cool.

Second, run the DB:

```bash
docker compsoe up -d
```

This will run the DB for the application and the tests.

Lastly, run the migrations:
```bash
pnpm run drizzle:migrate:apply
```

Now, seed the DB:
```bash
pnpm run seed
```

## Servers

### Plain, simple
You can run the `fastify` server:

```bash
pnpm run server:fastify
```

and interact with it via postman or swagger(maybe, TBD)

### MCP
This is a bonus addition! Because this falls outside the primary requirements, I leveraged Claude to help build the MCP 
server (while the rest of the application is my own original code). The integration should be ready to go, but if it 
doesn't work out of the box for you, try this:

```bash
claude mcp add banking-api -- node --import=tsx src/server/mcp.ts
```