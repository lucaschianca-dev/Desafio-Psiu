export const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Lucas API - CRUD Item',
        version: '1.0.0',
        description: 'REST API para CRUD de Item com Clean Architecture',
        contact: {
            name: 'Lucas Chianca',
            email: 'lucaseduardochianca.dev@gmail.com'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        }
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Servidor de Desenvolvimento'
        },
        {
            url: 'https://psiu.producao.com',
            description: 'Servidor de Produção'
        }
    ],
    tags: [
        {
            name: 'Items',
            description: 'Endpoints para gerenciamento de items'
        }
    ],
    components: {
        schemas: {
            Item: {
                type: 'object',
                required: ['_id', 'title', 'status', 'priority', 'available', 'createdAt'],
                properties: {
                    _id: {
                        type: 'string',
                        description: 'ID único do item (ObjectId MongoDB)',
                        example: '507f1f77bcf86cd799439011'
                    },
                    title: {
                        type: 'string',
                        description: 'Título do item',
                        minLength: 3,
                        maxLength: 80,
                        example: 'Macbook M5'
                    },
                    description: {
                        type: 'string',
                        description: 'Descrição detalhada do item',
                        maxLength: 500,
                        example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
                    },
                    status: {
                        type: 'string',
                        enum: ['todo', 'doing', 'done'],
                        description: 'Status do item',
                        example: 'doing'
                    },
                    priority: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 5,
                        description: 'Prioridade do item (1-5)',
                        example: 3
                    },
                    available: {
                        type: 'boolean',
                        description: 'Flag de soft delete',
                        example: true
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Data de criação',
                        example: '2025-01-01T12:00:00.000Z'
                    }
                }
            },
            ItemInput: {
                type: 'object',
                required: ['title'],
                properties: {
                    title: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 80,
                        example: 'Nova Tarefa'
                    },
                    description: {
                        type: 'string',
                        maxLength: 500,
                        example: 'Descrição da tarefa'
                    },
                    status: {
                        type: 'string',
                        enum: ['todo', 'doing', 'done'],
                        default: 'todo',
                        example: 'todo'
                    },
                    priority: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 5,
                        default: 3,
                        example: 3
                    }
                }
            },
            ItemUpdate: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 80
                    },
                    description: {
                        type: 'string',
                        maxLength: 500
                    },
                    status: {
                        type: 'string',
                        enum: ['todo', 'doing', 'done']
                    },
                    priority: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 5
                    }
                }
            },
            ItemList: {
                type: 'object',
                properties: {
                    items: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Item'
                        }
                    },
                    page: {
                        type: 'integer',
                        example: 1
                    },
                    limit: {
                        type: 'integer',
                        example: 10
                    },
                    total: {
                        type: 'integer',
                        example: 100
                    },
                    hasMore: {
                        type: 'boolean',
                        example: true
                    }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    error: {
                        type: 'string',
                        example: 'Mensagem de erro'
                    }
                }
            }
        },
        responses: {
            NotFound: {
                description: 'Recurso não encontrado',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        },
                        example: {
                            error: 'Item not found'
                        }
                    }
                }
            },
            ValidationError: {
                description: 'Erro de validação',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        },
                        example: {
                            error: 'Title is required'
                        }
                    }
                }
            },
            ServerError: {
                description: 'Erro interno do servidor',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        },
                        example: {
                            error: 'Internal server error'
                        }
                    }
                }
            }
        }
    },
    paths: {
        '/api/items': {
            get: {
                tags: ['Items'],
                summary: 'Listar items',
                description: 'Retorna uma lista paginada de items com filtros opcionais',
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        description: 'Número da página',
                        required: false,
                        schema: {
                            type: 'integer',
                            minimum: 1,
                            default: 1
                        }
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        description: 'Quantidade de items por página',
                        required: false,
                        schema: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 100,
                            default: 10
                        }
                    },
                    {
                        name: 'status',
                        in: 'query',
                        description: 'Filtrar por status',
                        required: false,
                        schema: {
                            type: 'string',
                            enum: ['todo', 'doing', 'done']
                        }
                    },
                    {
                        name: 'search',
                        in: 'query',
                        description: 'Busca textual no título e descrição',
                        required: false,
                        schema: {
                            type: 'string'
                        }
                    }
                ],
                responses: {
                    200: {
                        description: 'Lista de items retornada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ItemList'
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/ValidationError'
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            },
            post: {
                tags: ['Items'],
                summary: 'Criar um novo item',
                description: 'Cria um novo item no sistema',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ItemInput'
                            },
                            examples: {
                                basic: {
                                    summary: 'Item básico',
                                    value: {
                                        title: 'Comprar Macbook',
                                        priority: 3
                                    }
                                },
                                complete: {
                                    summary: 'Item completo',
                                    value: {
                                        title: 'Desenvolver API',
                                        description: 'Implementar endpoints REST com Clean Architecture',
                                        status: 'doing',
                                        priority: 5
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Item criado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        _id: {
                                            type: 'string'
                                        },
                                        item: {
                                            $ref: '#/components/schemas/Item'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/ValidationError'
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            }
        },
        '/api/items/{id}': {
            get: {
                tags: ['Items'],
                summary: 'Buscar item por ID',
                description: 'Retorna um item específico pelo seu ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        description: 'ID do item',
                        required: true,
                        schema: {
                            type: 'string',
                            pattern: '^[0-9a-fA-F]{24}$'
                        },
                        example: '507f1f77bcf86cd799439011'
                    }
                ],
                responses: {
                    200: {
                        description: 'Item encontrado',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Item'
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/ValidationError'
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            },
            put: {
                tags: ['Items'],
                summary: 'Atualizar item',
                description: 'Atualiza parcialmente um item existente',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        description: 'ID do item',
                        required: true,
                        schema: {
                            type: 'string',
                            pattern: '^[0-9a-fA-F]{24}$'
                        }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ItemUpdate'
                            },
                            examples: {
                                updateStatus: {
                                    summary: 'Atualizar status',
                                    value: {
                                        status: 'done'
                                    }
                                },
                                updateMultiple: {
                                    summary: 'Atualizar múltiplos campos',
                                    value: {
                                        title: 'Título atualizado',
                                        status: 'doing',
                                        priority: 4
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Item atualizado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Item'
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/ValidationError'
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            },
            delete: {
                tags: ['Items'],
                summary: 'Deletar item (soft delete)',
                description: 'Marca um item como indisponível (soft delete)',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        description: 'ID do item',
                        required: true,
                        schema: {
                            type: 'string',
                            pattern: '^[0-9a-fA-F]{24}$'
                        }
                    }
                ],
                responses: {
                    200: {
                        description: 'Item deletado com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                        item: { $ref: '#/components/schemas/Item' }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        $ref: '#/components/responses/ValidationError'
                    },
                    404: {
                        $ref: '#/components/responses/NotFound'
                    },
                    500: {
                        $ref: '#/components/responses/ServerError'
                    }
                }
            }
        }
    }
};