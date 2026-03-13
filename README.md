# Bond sports task

This is my solution for the home assignment task from Bond Sport.

## Setup
First, install it:

```bash
pnpm install
```

If you don't have `pnpm` [install it](https://pnpm.io/) - it's cool.

Second, run the DB (for the server and the unit testing) and apply the migrations:

```bash
docker compose up -d
pnpm run drizzle:migrate:apply
```

Now, seed the DB:
```bash
pnpm run seed
```

This will create the required initial data, including the mandatory creation script for at least one person 
(I created two - on the house 😉)

## Server

```bash
pnpm run server
```

It will be accessible thorugh `http://localhost:3000` and you can interact withit via postman of jus use the 
[swagger ui](http://localhost:3000/docs)

### MCP - bonus
This is a bonus addition! Because this falls outside the primary requirements, I leveraged Claude to help build the MCP 
server (while the rest of the application is my own original code). The integration should be ready to go, but if it 
doesn't work out of the box for you, try this:

```bash
claude mcp add banking-api -- node --import=tsx src/server/mcp.ts
```

## Playground
I usually like to have a playground file in my projects so you do:
```bash
cp playground.example.ts playground.ts 
```

and run:
```bash
pnpm playground
```

Changes in the file will cause reloading so... have fun coding around.


## Tests

I, first, created tests to make sure the code working ok. I'm using vitest and the tests switch the address of the DB 
from the real one to a dedicated one (which docker compose is setting up for us) so you can run tests as much as you 
want without altering the data:
```bash
pnpm run test
```

## Linting ans styling
To keep the codebase ordered with a unified coding standard and prevent `leaving` a `debugger` or `console.log` in the 
code, we have:

```bash
pnpm run lint

# and auto fixing
pnpm run lint:fix
```
