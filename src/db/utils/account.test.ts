import {describe, it, beforeAll, beforeEach, expect} from 'vitest';
import {db, setTestDb} from "../index.ts";
import {personsTable, transactionTable, accountTable} from '../schema.ts';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as account from "./account.ts";
import {eq} from "drizzle-orm";
import {type Account, checkBalance, depositAccount, getAccount, getPerson, type Person} from "./account.ts";

describe("Account", () => {

    const createAccount = async (payload: Partial<Account> = {}) => account.createAccount({
        personId: 100,
        accountType: 42,
        balance: 0,
        activeFlag: true,
        createdDate: new Date().toDateString(),
        dailyWithdrawalLimit: 1000,
        ...payload
    });

    const createPerson = (payload: Partial<Person> = {}) => db.insert(personsTable).values({
        name: "John doe",
        document: "1234567890",
        birthDate: new Date().toDateString(),
        ...payload
    }).returning();

    beforeAll(async () => {
        setTestDb("postgresql://user:password@localhost:5433/bond_sports_testing");
        await migrate(db, { migrationsFolder: './drizzle' });
    });

    beforeEach(async () => {
        // todo: go over all the tables, smarter, and clean them.
        await Promise.all([personsTable, transactionTable,accountTable].map(table => db.delete(table)))
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
        it("should not withdraw a account for a non-existing account", () => {});
        it("should not withdraw a account for a blocked account", () => {});
        it("should not withdraw money if the account exceeded the daily limit", () => {});
        it("should withdraw money for active account which did not exceed the daily limit", () => {});
    });

    describe("blockAccount", () => {
        it("should not block a non-existing account", () => {});
        it("should block an account and not affect other accounts", () => {});
    });

    describe("getAccountTransactions", () => {
        it("should not show the transactions for non-existing account", () => {});
        it("should not show the transaction for a blocked account", () => {});
        it("should show the transactions for existing account", () => {});
    });
});
