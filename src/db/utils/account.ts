import {accountTable, personsTable, transactionTable} from "../schema.ts";
import {db} from "../index.ts";
import {eq} from "drizzle-orm";

export type Person = typeof personsTable.$inferInsert
export type Account = typeof accountTable.$inferInsert;

export function getPerson(id: Person["id"]) {
    return db.query.personsTable.findFirst({
        where: (personTable, { eq }) => eq(personTable.id, id),
        with: {
            // todo: we need to be able to pass true/false to control the eager loading but then we need to create
            //  override type for the function and it's out of scope 😬
            account: true,
        },
    });
}

export async function getAccount({id, checkAccountValid = false} :{id: Account["id"], checkAccountValid?: boolean}) {
    const account = await db.query.accountTable.findFirst({
        where: (accountTable, { eq }) => eq(accountTable.id, id),
        with: {
            // todo: we need to be able to pass true/false to control the eager loading but then we need to create
            //  override type for the function and it's out of scope 😬
            transactions: true,
        }
    });

    if (!checkAccountValid) {
        return account;
    }

    if (!account) {
        throw new Error('Account does not exist');
    }

    if (!account.activeFlag) {
        throw new Error('Account is blocked');
    }

    return account;
}

export async function createAccount(account: Account) {
    if (!account.personId) {
        throw new Error("Missing person ID");
    }

    const person = await getPerson(account.personId);

    if (!person) {
        throw new Error('No such person');
    }

    return db.insert(accountTable).values(account).returning();
}

export async function depositAccount({accountId, amount}: { accountId: number, amount: number }) {
    const account = await getAccount({id: accountId, checkAccountValid: true});

    await Promise.all([
        db.update(accountTable).set({ balance: account!.balance + amount }).where(eq(accountTable.id, accountId)),
        db.insert(transactionTable).values({accountId, value: amount}),
    ]);
}

export async function checkBalance(id: Account["id"]) {
    const account = await getAccount({id: id, checkAccountValid: true});

    // todo: should we check the transactions as well? we know for sure that the depositAccount update the balance of
    //  the account as well so this might be faster (yes... the getAccount eager load but that a tech debt for now).
    return account!.balance;
}

export async function withdrawAccount({}: { account: Account, amount: number }) {
}

export async function blockAccount(account: Account) {
    console.log(account);
}

export async function getAccountTransactions(account: Account) {
    console.log(account);
}
