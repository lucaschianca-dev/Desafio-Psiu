// server/main.js
import '/imports/api/items/infra/publications.js';
import '/imports/api/items/methods.js';
import { Meteor } from 'meteor/meteor';
import { seedIfEmpty } from '/imports/api/items/seed.js';
import { Items } from '/imports/api/items/infra/collection.js';

import { MongoItemsRepository } from '/imports/api/items/adapters/mongoItemsRepository.js';
import { CreateItemUseCase } from '/imports/api/items/usecases/createItem.js';
import { UpdateItemUseCase } from '/imports/api/items/usecases/updateItem.js';
import { ListItemsUseCase } from '/imports/api/items/usecases/listItems.js';
import { mountItemsHttp } from '/imports/api/items/controllers/itemController.js';
import { mountSwaggerUI } from '/imports/api/items/controllers/swaggerController.js';

Meteor.startup(async () => {
    // Garantir índices (usando rawCollection)
    try {
        await Items.rawCollection().createIndex({ createdAt: -1 });
        await Items.rawCollection().createIndex({ title: 'text' });
        console.log('Indexes created/ensured for Items');
    } catch (err) {
        console.error('Index creation error', err);
    }

    // TEMPORÁRIO: Limpar collection
    await Items.rawCollection().deleteMany({});
    console.log('🗑️ Collection limpa!');

    // Popular collection com dados de exemplo se estiver vazia
    await seedIfEmpty();

    // Criar repository e useCases  (injecao de dependencia)
    const repo = new MongoItemsRepository();
    const createUC = new CreateItemUseCase(repo);
    const updateUC = new UpdateItemUseCase(repo);
    const listUC = new ListItemsUseCase(repo);

    // Montar HTTP controller com DI
    mountItemsHttp({ createUseCase: createUC, listUseCase: listUC, updateUseCase: updateUC });

    // Montar Swagger UI
    mountSwaggerUI();

    console.log('✅ Server ready!');
    console.log('📚 Documentação API: http://localhost:3000/api/docs');
    console.log('📄 OpenAPI JSON: http://localhost:3000/api/docs/swagger.json');
    console.log('🚀 Items API: http://localhost:3000/api/items');
});