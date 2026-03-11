import {pgTable, text, date, integer, boolean} from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';


// Tables.
export const personsTable = pgTable("persons", {
    id: integer().primaryKey(),
    name: text().notNull(),
    document: text(),
    birthDate: date(),
});

export const accountTable = pgTable("accounts", {
    id: integer().primaryKey(),
    personId: integer(),
    balance: integer(),
    dailyWithdrawalLimit: integer(),
    activeFlag: boolean(),
    accountType: integer(),
    createdDate: date(),
});

export const transactionTable = pgTable("transactions", {
    transactionId: integer().primaryKey(),
    accountId: integer(),
    value: integer(),
    transactionDate: date(),
});

// Relations.
export const personRelations = relations(personsTable, ({one}) => ({
    account: one(accountTable)
}));

export const accountRelations = relations(accountTable, ({one, many}) => ({
    person: one(personsTable, {
        fields: [accountTable.personId],
        references: [personsTable.id],
    }),
    transactions: many(transactionTable)
}));

export const transactionRelations = relations(transactionTable, ({one}) => ({
    account: one(accountTable)
}));
