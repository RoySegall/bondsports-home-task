'use strict'

import Fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {swaggerOptions, swaggerUi} from "./swagger.ts";
import {db} from "../db";
import {
    blockAccount,
    checkBalance,
    createAccount,
    depositAccount,
    getAccountTransactions,
    withdrawAccount
} from "../db/utils/account.ts";

export const fastify = Fastify({
    logger: true
});

await fastify.register(fastifySwagger, swaggerOptions);
await fastify.register(fastifySwaggerUi, swaggerUi);

fastify.get('/persons', {schema: {tags: ['server']}}, async (_, res) => {
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
    })
    res.send(persons)
});

fastify.post(
    '/account',
    {
        schema: {
            tags: ['server'],
            body: {
                type: 'object',
                required: ['personId', 'balance', 'dailyWithdrawalLimit'],
                properties: {
                    personId: {type: 'number'},
                    balance: {type: 'number'},
                    dailyWithdrawalLimit: {type: 'number'},
                },
            },
        },
    },
    async (req, res) => {
        const {personId, balance, dailyWithdrawalLimit} = req.body;

        const account = await createAccount({
            personId,
            balance,
            dailyWithdrawalLimit
        });

    res.send(account)
});

// Not REST approach but... for now 🤷
fastify.patch(
    '/account/:accountId/block',
    {
        schema: {
            tags: ['server'],
        },
    },
    async (req, res) => {
        const block = await blockAccount(req.params.accountId);

        res.send(block);
    }
);

fastify.get('/account/:accountId/transactions', {schema: {tags: ['server']}}, async (req, res) => {
    const account = await getAccountTransactions(req.params.accountId);

    res.send(account)
})

fastify.post(
    '/deposit',
    {
        schema: {
            tags: ['server'],
            body: {
                type: 'object',
                required: ['accountId', 'amount'],
                properties: {
                    accountId: {type: 'number'},
                    amount: {type: 'number'},
                },
            },
        },
    },
    async (req, res) => {
        const deposit = await depositAccount({accountId: req.body.accountId, amount: req.body.amount});

        res.send(deposit);
    }
);

fastify.post(
    '/balance/:accountId',
    {
        schema: {
            tags: ['server'],
        },
    },
    async (req, res) => {
        const balance = await checkBalance(req.params.accountId);
        res.send({balance});
    }
);


fastify.post(
    '/withdraw/:accountId',
    {
        schema: {
            tags: ['server'],
            body: {
                type: 'object',
                required: ['amount'],
                properties: {
                    amount: {type: 'number'},
                },
            }
        },
    },
    async (req, res) => {
        const withdraw = await withdrawAccount({
            amount: req.body.amount,
            accountId: req.params.accountId,
        });

        res.send(withdraw);
    }
);

const start = async () => {
    try {
        await fastify.listen({ port: 3000 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()
