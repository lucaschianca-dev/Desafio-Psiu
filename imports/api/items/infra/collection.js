import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

// Coleção Mongo
export const Items = new Mongo.Collection('items');

// Criar índices (server startup)
if (Meteor.isServer && Items.rawCollection) {
  Items.rawCollection().createIndex({ createdAt: -1 }).catch(console.error);
  Items.rawCollection().createIndex({ title: 'text' }).catch(console.error);
}
