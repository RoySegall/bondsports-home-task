import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { db } from "../db";
import {
    blockAccount,
    checkBalance,
    createAccount,
    depositAccount,
    getAccountTransactions,
    withdrawAccount
} from "../db/utils/account.ts";

const server = new Server({
    name: "banking-api-mcp",
    version: "1.0.0",
}, {
    capabilities: { tools: {} }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "list_persons",
            description: "List all persons with their associated bank accounts",
            inputSchema: {
                type: "object",
                properties: {},
            }
        },
        {
            name: "create_account",
            description: "Create a new bank account for a person",
            inputSchema: {
                type: "object",
                properties: {
                    personId: { type: "number", description: "The ID of the person to create the account for" },
                    balance: { type: "number", description: "The initial balance of the account" },
                    dailyWithdrawalLimit: { type: "number", description: "The daily withdrawal limit for the account" },
                },
                required: ["personId", "balance", "dailyWithdrawalLimit"]
            }
        },
        {
            name: "block_account",
            description: "Block a bank account so it can no longer be used",
            inputSchema: {
                type: "object",
                properties: {
                    accountId: { type: "number", description: "The ID of the account to block" },
                },
                required: ["accountId"]
            }
        },
        {
            name: "get_account_transactions",
            description: "Get all transactions for a bank account",
            inputSchema: {
                type: "object",
                properties: {
                    accountId: { type: "number", description: "The ID of the account" },
                },
                required: ["accountId"]
            }
        },
        {
            name: "deposit",
            description: "Deposit money into a bank account",
            inputSchema: {
                type: "object",
                properties: {
                    accountId: { type: "number", description: "The ID of the account to deposit into" },
                    amount: { type: "number", description: "The amount to deposit" },
                },
                required: ["accountId", "amount"]
            }
        },
        {
            name: "get_account_balance",
            description: "Get the current balance for a bank account",
            inputSchema: {
                type: "object",
                properties: {
                    accountId: { type: "number", description: "The ID of the account" },
                },
                required: ["accountId"]
            }
        },
        {
            name: "withdraw",
            description: "Withdraw money from a bank account. Subject to daily withdrawal limits.",
            inputSchema: {
                type: "object",
                properties: {
                    accountId: { type: "number", description: "The ID of the account to withdraw from" },
                    amount: { type: "number", description: "The amount to withdraw" },
                },
                required: ["accountId", "amount"]
            }
        },
    ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case "list_persons": {
                const persons = await db.query.personsTable.findMany({
                    with: {
                        account: {
                            columns: {
                                id: true,
                                balance: true,
                                dailyWithdrawalLimit: true,
                                activeFlag: true,
                                createdDate: true,
                            },
                        }
                    },
                });
                return { content: [{ type: "text", text: JSON.stringify(persons, null, 2) }] };
            }

            case "create_account": {
                const { personId, balance, dailyWithdrawalLimit } = args as { personId: number; balance: number; dailyWithdrawalLimit: number };
                const account = await createAccount({ personId, balance, dailyWithdrawalLimit });
                return { content: [{ type: "text", text: JSON.stringify(account, null, 2) }] };
            }

            case "block_account": {
                const { accountId } = args as { accountId: number };
                const result = await blockAccount(accountId);
                return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
            }

            case "get_account_transactions": {
                const { accountId } = args as { accountId: number };
                const transactions = await getAccountTransactions(accountId);
                return { content: [{ type: "text", text: JSON.stringify(transactions, null, 2) }] };
            }

            case "deposit": {
                const { accountId, amount } = args as { accountId: number; amount: number };
                const transaction = await depositAccount({ accountId, amount });
                return { content: [{ type: "text", text: JSON.stringify(transaction, null, 2) }] };
            }

            case "get_account_balance": {
                const { accountId } = args as { accountId: number };
                const balance = await checkBalance(accountId);
                return { content: [{ type: "text", text: JSON.stringify({ accountId, balance }, null, 2) }] };
            }

            case "withdraw": {
                const { accountId, amount } = args as { accountId: number; amount: number };
                const transaction = await withdrawAccount({ accountId, amount });
                return { content: [{ type: "text", text: JSON.stringify(transaction, null, 2) }] };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);
