import {describe, it, beforeAll, beforeEach, expect} from 'vitest';
import {db, setTestDb} from "../index.ts";
import {personsTable, transactionTable, accountTable} from '../schema.ts';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import {eq} from "drizzle-orm";
import {
    blockAccount,
    checkBalance,
    depositAccount,
    getAccount, getAccountTransactions,
    getPerson,
    withdrawAccount
} from "./account.ts";
import {createAccount, createPerson} from "../seed.ts";

describe("Account", () => {

    beforeAll(async () => {
        setTestDb("postgresql://user:password@localhost:5433/bond_sports_testing");
        await migrate(db, { migrationsFolder: './drizzle' });
    });

    beforeEach(async () => {
        // todo: go over all the tables, smarter, and clean them.
        await Promise.allSettled([personsTable, accountTable, transactionTable].map(table => db.delete(table)))
    });

    describe("createAccount", () => {
        it("should not create a new account for a non-existing person", async () => expect(createAccount()).rejects.toThrow('No such person'));

        it("should create a new account for existing person", async () => {
            const [person] = await createPerson();
            const [createdAccount] = await createAccount({personId: person.id});
            const [accountFromDb] = await db.select().from(accountTable).where(eq(accountTable.id, createdAccount.id));

            expect(createdAccount.id).toBe(accountFromDb.id)
        });

        it("should create multiple accounts for person", async () => {
            const [person] = await createPerson();
            await Promise.all([
                createAccount({personId: person.id}),
                createAccount({personId: person.id}),
            ]);

            const personFromDB = await getPerson(person.id);
            expect(personFromDB!.account).toHaveLength(2);
        });
    });

    describe("depositAccount", () => {
        it("should fail for non-existing account", () => expect(depositAccount({accountId: 42, amount: 20})).rejects.toThrow('Account does not exist'));

        it("should fail for blocked account", async  () => {
            const [account] = await createPerson()
                .then(person => createAccount({personId: person[0].id, activeFlag: false}));

            await expect(depositAccount({accountId: account.id, amount: 20})).rejects.toThrow('Account is blocked');
        });

        it("should deposit a non-blocked account", async () => {
            const [account] = await createPerson()
                .then(person => createAccount({personId: person[0].id, balance: 30}));

            await depositAccount({accountId: account.id, amount: 20});

            const accountAfterDeposit = await getAccount({id: account.id});

            expect(accountAfterDeposit!.balance).toBe(50);
            expect({accountId: accountAfterDeposit!.transactions[0].accountId, value: accountAfterDeposit!.transactions[0].value}).toStrictEqual({accountId: account.id, value: 20})
        });
    });

    describe("checkBalance", () => {
        it("should fail for non-existing account", () => expect(checkBalance(100)).rejects.toThrow('Account does not exist'));

        it("should fail for blocked account", async () => {
            const [account] = await createPerson()
                .then(person => createAccount({personId: person[0].id, activeFlag: false}));

            await expect(checkBalance(account.id)).rejects.toThrow('Account is blocked');
        });

        it("should return balance for existing account", async () => {
            const [account] = await createPerson()
                .then(person => createAccount({personId: person[0].id, balance: 30}));

            await expect(checkBalance(account.id)).resolves.toBe(30);
        });
    });

    describe("withdrawAccount", () => {
        const getDatesForTesting = () => {
            // Create transaction for this day and the prev.
            const baseDate = new Date();

            const dateHour15 = new Date(baseDate);
            dateHour15.setHours(15, 0, 0, 0);

            const dateHour10 = new Date(baseDate);
            dateHour10.setHours(10, 0, 0, 0);

            const tenDaysAgo = new Date(baseDate);
            tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
            tenDaysAgo.setHours(12, 0, 0, 0); // Setting a neutral time

            return {dateHour15, dateHour10, tenDaysAgo}
        }

        it("should not allow to withdraw amount smaller than 1", () => expect(withdrawAccount({accountId: 100, amount: 0})).rejects.toThrow('Amount need to be greater than 0'));

        it("should not withdraw a account for a non-existing account", () => expect(withdrawAccount({accountId: 100, amount: 42})).rejects.toThrow('Account does not exist'));

        it("should not withdraw a account for a blocked account", async () => {
            const [account] = await createPerson()
                .then(person => createAccount({personId: person[0].id, activeFlag: false}));
            await expect(withdrawAccount({accountId: account.id, amount: 42})).rejects.toThrow('Account is blocked')
        });

        it("should not withdraw money if the account at the exceeding daily limit", async () => {
            // Create account.
            const [account] = await createPerson()
                .then(person => createAccount({personId: person[0].id, dailyWithdrawalLimit: 100, balance: 30}));

            // Create transaction for this day and the prev.
            const {dateHour15, dateHour10, tenDaysAgo} = getDatesForTesting();

            await Promise.all([
                db.insert(transactionTable).values({accountId: account.id, value: 50, transactionDate: dateHour15}),
                db.insert(transactionTable).values({accountId: account.id, value: 50, transactionDate: dateHour10}),
                db.insert(transactionTable).values({accountId: account.id, value: 25, transactionDate: tenDaysAgo}),
            ]);

            const [withdrawStatus, accountFromDB] = await Promise.allSettled([
                withdrawAccount({accountId: account.id, amount: 20}),
                getAccount({id: account.id})
            ]);

            expect({status: withdrawStatus.status, reason: withdrawStatus.status === 'rejected' && withdrawStatus.reason.message}).toStrictEqual({ status: 'rejected', reason: 'Daily withdrawal limit exceeded' });
            expect(accountFromDB.status === "fulfilled" && accountFromDB.value!.balance).toBe(30);
        });

        it("should not withdraw money if the account exceeded the daily limit", async () => {
            // Create account.
            const [account] = await createPerson()
                .then(person => createAccount({personId: person[0].id, dailyWithdrawalLimit: 100, balance: 30}));

            // Create transaction for this day and the prev.
            const {dateHour15, dateHour10, tenDaysAgo} = getDatesForTesting();

            await Promise.all([
                db.insert(transactionTable).values({accountId: account.id, value: 50, transactionDate: dateHour15}),
                db.insert(transactionTable).values({accountId: account.id, value: 51, transactionDate: dateHour10}),
                db.insert(transactionTable).values({accountId: account.id, value: 25, transactionDate: tenDaysAgo}),
            ]);

            const [withdrawStatus, accountFromDB] = await Promise.allSettled([
                withdrawAccount({accountId: account.id, amount: 20}),
                getAccount({id: account.id})
            ]);

            expect({status: withdrawStatus.status, reason: withdrawStatus.status === 'rejected' && withdrawStatus.reason.message}).toStrictEqual({ status: 'rejected', reason: 'Daily withdrawal limit exceeded' });
            expect(accountFromDB.status === "fulfilled" && accountFromDB.value!.balance).toBe(30);
        });

        it("should withdraw money for active account which did not exceed the daily limit", async () => {
            // Create account.
            const [account] = await createPerson()
                .then(person => createAccount({personId: person[0].id, dailyWithdrawalLimit: 100, balance: 30}));

            // Create transactions.
            const {dateHour15, dateHour10, tenDaysAgo} = getDatesForTesting();

            await Promise.all([
                db.insert(transactionTable).values({accountId: account.id, value: 25, transactionDate: dateHour15}),
                db.insert(transactionTable).values({accountId: account.id, value: 25, transactionDate: dateHour10}),
                // Exceeding transactions for yesterday.
                db.insert(transactionTable).values({accountId: account.id, value: 101, transactionDate: tenDaysAgo}),
            ]);

            // Withdra money and verify the balance has changed.
            await withdrawAccount({accountId: account.id, amount: 20});
            const accountFromDb = await getAccount({id: account.id});

            expect(accountFromDb!.balance).toBe(10);
        });
    });

    describe("blockAccount", () => {
        it("should not block a non-existing account", () => expect(blockAccount(42)).rejects.toThrow("Account does not exist"));
        it("should block an account and not affect other accounts", async () => {
            const [[firstAccount], [secondAccount]] = await Promise.all([
                createPerson()
                    .then(person => createAccount({personId: person[0].id})),
                createPerson()
                    .then(person => createAccount({personId: person[0].id}))
            ]);

            // Just verifying.
            expect(firstAccount).not.toBe(secondAccount.id);

            await blockAccount(firstAccount.id);

            const [firstAccountFromDB, secondAccountFromDB] = await Promise.all([
                getAccount({id: firstAccount.id}),
                getAccount({id: secondAccount.id}),
            ]);

            expect(firstAccountFromDB!.activeFlag).toBe(false);
            expect(secondAccountFromDB!.activeFlag).toBe(true);
        });
    });

    describe("getAccountTransactions", () => {
        it("should not show the transactions for non-existing account", () => expect(getAccountTransactions(42)).rejects.toThrow("Account does not exist"));
        it("should not show the transaction for a blocked account", async () => {
            const [account] = await createPerson()
                .then(person => createAccount({personId: person[0].id, activeFlag: false}));
            await expect(getAccountTransactions(account.id)).rejects.toThrow('Account is blocked')
        });
        it("should show the transactions for existing account", async () => {
            const [[firstAccount], [secondAccount]] = await Promise.all([
                createPerson()
                    .then(person => createAccount({personId: person[0].id})),
                createPerson()
                    .then(person => createAccount({personId: person[0].id}))
            ]);

            // Create transactions for accounts.
            await Promise.all([
                depositAccount({accountId: firstAccount.id, amount: 20}),
                depositAccount({accountId: firstAccount.id, amount: 100}),
                depositAccount({accountId: firstAccount.id, amount: 30}),

                depositAccount({accountId: secondAccount.id, amount: 50}),
                depositAccount({accountId: secondAccount.id, amount: 50}),
                depositAccount({accountId: secondAccount.id, amount: 50}),
                depositAccount({accountId: secondAccount.id, amount: 50}),
            ]);

            const [firstAccountTransactions, secondAccountTransactions] = await Promise.all([
                getAccountTransactions(firstAccount.id),
                getAccountTransactions(secondAccount.id),
            ]);

            expect(firstAccountTransactions.map(transaction => transaction.value).sort()).toStrictEqual([ 100, 20, 30 ]);
            expect(secondAccountTransactions.map(transaction => transaction.value).sort()).toStrictEqual([50, 50, 50, 50]);
        });
    });
});
