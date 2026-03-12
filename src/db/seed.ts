import {getPerson, type Account, type Person} from "./utils/account.ts";
import * as account from "./utils/account.ts";
import {personsTable} from "./schema.ts";
import {db} from "./index.ts";
import {eq, or} from "drizzle-orm";

export const createAccount = async (payload: Partial<Account> = {}) => account.createAccount({
    personId: 100,
    accountType: 42,
    balance: 0,
    activeFlag: true,
    createdDate: new Date().toDateString(),
    dailyWithdrawalLimit: 1000,
    ...payload
});

export const createPerson = (payload: Partial<Person> = {}) => db.insert(personsTable).values({
    name: "John doe",
    document: "1234567890",
    birthDate: new Date().toDateString(),
    ...payload
}).returning();

async function seed() {
    // Check if the seed has already been executed
    const accounts = await db.query.personsTable.findMany({
        where: (person) => or(eq(person.name, "Tony Stark"), eq(person.name, "Pennywise"))
    });

    if (accounts.length >= 2) {
        console.log("Seed already executed. Skipping...");
        process.exit(0);
    }
    // Create two persons.
    const [[firstPerson], [secondPerson]] = await Promise.all([
        createPerson({name: "Tony Stark"}),
        createPerson({name: "Pennywise"}),
    ]);

    // Create accounts.
    await Promise.all([
        createAccount({personId: firstPerson.id, balance: 10_000_000}),
        createAccount({personId: secondPerson.id, balance: 560}),
        // Pennywise account is blocked, for obvious reasons 🥲
        createAccount({personId: secondPerson.id, activeFlag: true}),
    ]);

    const [firstAccountFromDB, secondAccountFromDB] = await Promise.all([getPerson(firstPerson.id), getPerson(secondPerson.id)]);

    console.log("🎉 Congratulations! 🥳");
    console.log("The seed was completed successfully!. Here is the information about it:");
    console.table({firstAccountFromDB, secondAccountFromDB});
    process.exit(0);
}

seed().catch(console.error);
