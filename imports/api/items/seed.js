import { Items } from '/imports/api/items/infra/collection.js';
import { generateObjectId } from '/imports/api/items/infra/objectId.js';

export async function seedIfEmpty() {
    const count = await Items.rawCollection().countDocuments({});
    if (count > 0) return;

    const now = new Date();
    const docs = [
        {
            _id: generateObjectId(), // ← Agora retorna STRING
            title: 'Macbook M5',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla suscipit.',
            status: 'todo',
            priority: 3,
            createdAt: now,
            available: true
        },
        {
            _id: generateObjectId(),
            title: 'Iphone 17 Pro Max',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla suscipit.',
            status: 'doing',
            priority: 2,
            createdAt: now,
            available: true
        },
        {
            _id: generateObjectId(),
            title: 'Notebook Alienware M18',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla suscipit.',
            status: 'doing',
            priority: 2,
            createdAt: now,
            available: true
        },
        {
            _id: generateObjectId(),
            title: 'RTX 5090 Ti',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla suscipit.',
            status: 'doing',
            priority: 2,
            createdAt: now,
            available: true
        },
        {
            _id: generateObjectId(),
            title: 'IPad Pro 12.9',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla suscipit.',
            status: 'doing',
            priority: 2,
            createdAt: now,
            available: true
        },
        {
            _id: generateObjectId(),
            title: 'Processador i9-13900K',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla suscipit.',
            status: 'doing',
            priority: 2,
            createdAt: now,
            available: true
        },
        {
            _id: generateObjectId(),
            title: 'Teclado Razer BlackWidow V4',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla suscipit.',
            status: 'doing',
            priority: 2,
            createdAt: now,
            available: true
        },
        {
            _id: generateObjectId(),
            title: 'Mouse Logitech Superlight',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla suscipit.',
            status: 'doing',
            priority: 2,
            createdAt: now,
            available: true
        },
        {
            _id: generateObjectId(),
            title: 'Microfone Blue Yeti X',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla suscipit.',
            status: 'doing',
            priority: 2,
            createdAt: now,
            available: true
        },
        {
            _id: generateObjectId(),
            title: 'Headset SteelSeries Arctis Pro',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla suscipit.',
            status: 'doing',
            priority: 2,
            createdAt: now,
            available: true
        }
    ];

    await Items.rawCollection().insertMany(docs);
    console.log(`✅ Populado com uma Items collection de ${docs.length} itens`);
}