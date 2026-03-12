# Bond sports task

This is my solution for the home assignement task from Bond Sport.

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

### MCP - TBD
You can run the MCP server and connect it to a local agent lik claude and interact as we should:

```bash
pnpm run server:mcp
```

Now, add it as a mcp server to you llm and start talking with it.
