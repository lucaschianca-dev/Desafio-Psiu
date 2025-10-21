import bodyParser from 'body-parser';
import { WebApp } from 'meteor/webapp';
import { sanitizeCreateItem, sanitizeUpdateItem } from '/imports/api/items/dto.js';

/* ====================================me========
   CORS CONFIGURATION
   ============================================ */
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', // Em producao, especificar dominios: 'https://psiu.com'
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 horas de cache do preflight
    'Access-Control-Allow-Credentials': 'true'
};

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

/**
 * Aplica headers CORS na resposta
 */
function applyCorsHeaders(res) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
}

/**
 * Envia resposta JSON com CORS
 */
function sendJson(res, payload, status = 200) {
    applyCorsHeaders(res);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.writeHead(status);
    res.end(JSON.stringify(payload, null, 2)); // Pretty print para debug
}

/**
 * Mapeia erros para respostas HTTP adequadas
 */
function mapError(res, err) {
    // Erros de validacao
    if (err?.code === 'VALIDATION_ERROR') {
        return sendJson(res, {
            error: 'Validation Error',
            message: err.message,
            code: 'VALIDATION_ERROR'
        }, 400);
    }

    // Erros de recurso nao encontrado
    if (err?.code === 'NOT_FOUND') {
        return sendJson(res, {
            error: 'Not Found',
            message: err.message,
            code: 'NOT_FOUND'
        }, 404);
    }

    // Log de erro interno (nao expor detalhes ao cliente)
    console.error('[API Error]', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });

    // Erro generico do servidor
    return sendJson(res, {
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Um erro inesperado ocorreu',
        code: 'INTERNAL_ERROR'
    }, 500);
}

/**
 * Manipula requisicoes OPTIONS (CORS preflight)
 */
function handleOptions(res) {
    applyCorsHeaders(res);
    res.writeHead(204); // No Content
    res.end();
}

/**
 * Valida se o ID tem formato valido de ObjectId
 */
function validateObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

/* ============================================
   MAIN MOUNT FUNCTION
   ============================================ */

export function mountItemsHttp({ createUseCase, listUseCase, updateUseCase }) {

    /* -------------------------------------------
       MIDDLEWARE: Body Parser
       ------------------------------------------- */
    WebApp.connectHandlers.use(bodyParser.json({
        limit: '10mb', // Limite de payload
        strict: true   // Aceita apenas arrays e objects
    }));

    /* -------------------------------------------
       MIDDLEWARE: Global CORS Preflight Handler
       ------------------------------------------- */
    WebApp.connectHandlers.use('/api', (req, res, next) => {
        // Intercepta todas as requisições OPTIONS
        if (req.method === 'OPTIONS') {
            return handleOptions(res);
        }
        next();
    });

    /* ============================================
       ROTA: /api/items
       ============================================ */
    WebApp.connectHandlers.use('/api/items', (req, res, next) => {
        const method = (req.method || '').toUpperCase();

        /* -------------------------------------------
           GET /api/items - Listar items
           ------------------------------------------- */
        if (method === 'GET') {
            try {
                const url = new URL(req.url, `http://${req.headers.host}`);
                const pathname = url.pathname || '/';

                // Verifica se e a rota de listagem (nao e um ID especifico)
                if (pathname === '/' || pathname === '') {
                    // Extrai e valida parametros de query
                    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
                    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '10')));
                    const status = url.searchParams.get('status') || undefined;
                    const search = url.searchParams.get('search') || undefined;

                    // Valida status se fornecido
                    if (status && !['todo', 'doing', 'done'].includes(status)) {
                        return sendJson(res, {
                            error: 'Validation Error',
                            message: 'Status Invalido. Precisa ser: todo, doing ou done',
                            code: 'VALIDATION_ERROR'
                        }, 400);
                    }

                    // Executa use case
                    listUseCase.execute({ page, limit, status, search })
                        .then(result => sendJson(res, result))
                        .catch(err => mapError(res, err));
                    return;
                }
            } catch (err) {
                // Se nao for uma URL valida, passa para o proximo handler
                return next();
            }
        }

        /* -------------------------------------------
           POST /api/items - Criar item
           ------------------------------------------- */
        if (method === 'POST' && (req.url === '' || req.url === '/')) {
            try {
                // Valida se body existe
                if (!req.body || Object.keys(req.body).length === 0) {
                    return sendJson(res, {
                        error: 'Validation Error',
                        message: 'Request body e obrigatorio',
                        code: 'VALIDATION_ERROR'
                    }, 400);
                }

                // Sanitiza e executa
                const sanitized = sanitizeCreateItem(req.body);
                createUseCase.execute(sanitized)
                    .then(result => sendJson(res, result, 201))
                    .catch(err => mapError(res, err));
                return;
            } catch (err) {
                return mapError(res, err);
            }
        }

        // Se nao for GET ou POST, passa para o proximo handler
        return next();
    });

    /* ============================================
       ROTA: /api/items/:id
       ============================================ */
    WebApp.connectHandlers.use('/api/items/', (req, res, next) => {
        const path = req.url || '';

        // Extrai ID da URL (formato: /123abc ou /123abc?query=value)
        const idMatch = path.match(/^\/([^\/\?]+)/);
        if (!idMatch) return next();

        const id = idMatch[1];
        const method = (req.method || '').toUpperCase();

        // Valida formato do ObjectId
        if (!validateObjectId(id)) {
            return sendJson(res, {
                error: 'Validation Error',
                message: 'ID com formato invalido. Precisa ser 24-caracteres string hexadecimal',
                code: 'VALIDATION_ERROR'
            }, 400);
        }

        /* -------------------------------------------
           GET /api/items/:id - Buscar item por ID
           ------------------------------------------- */
        if (method === 'GET') {
            // Verifica se o metodo existe no use case
            if (typeof updateUseCase.findById !== 'function') {
                return sendJson(res, {
                    error: 'Not Implemented',
                    message: 'Metodo findById nao implementado no use case',
                    code: 'NOT_IMPLEMENTED'
                }, 501);
            }

            updateUseCase.findById(id)
                .then(item => {
                    if (!item) {
                        return sendJson(res, {
                            error: 'Not Found',
                            message: `Item com id ${id} nao encontrado`,
                            code: 'NOT_FOUND'
                        }, 404);
                    }
                    sendJson(res, item);
                })
                .catch(err => mapError(res, err));
            return;
        }

        /* -------------------------------------------
           PUT /api/items/:id - Atualizar item
           ------------------------------------------- */
        if (method === 'PUT') {
            try {
                // Valida se body existe
                if (!req.body || Object.keys(req.body).length === 0) {
                    return sendJson(res, {
                        error: 'Validation Error',
                        message: 'Request body e obrigatorio',
                        code: 'VALIDATION_ERROR'
                    }, 400);
                }

                // Sanitiza e executa
                const sanitized = sanitizeUpdateItem(req.body);

                // Verifica se ha campos para atualizar
                if (Object.keys(sanitized).length === 0) {
                    return sendJson(res, {
                        error: 'Validation Error',
                        message: 'Sem campos validos para atualizar',
                        code: 'VALIDATION_ERROR'
                    }, 400);
                }

                updateUseCase.execute(id, sanitized)
                    .then(updated => {
                        if (!updated) {
                            return sendJson(res, {
                                error: 'Not Found',
                                message: `Item com o id ${id} nao encontrado`,
                                code: 'NOT_FOUND'
                            }, 404);
                        }
                        sendJson(res, updated);
                    })
                    .catch(err => mapError(res, err));
                return;
            } catch (err) {
                return mapError(res, err);
            }
        }

        /* -------------------------------------------
           DELETE /api/items/:id - Deletar item (soft delete)
           ------------------------------------------- */
        if (method === 'DELETE') {
            updateUseCase.execute(id, { available: false })
                .then(updated => {
                    if (!updated) {
                        return sendJson(res, {
                            error: 'Not Found',
                            message: `Item com o id ${id} nao encontrado`,
                            code: 'NOT_FOUND'
                        }, 404);
                    }
                    sendJson(res, {
                        message: 'Item excluido com sucesso',
                        item: updated
                    });
                })
                .catch(err => mapError(res, err));
            return;
        }

        /* -------------------------------------------
           Metodo nao suportado
           ------------------------------------------- */
        return sendJson(res, {
            error: 'Method Not Allowed',
            message: `Metodo ${method} nao e permitido para esse endpoint`,
            code: 'METHOD_NOT_ALLOWED',
            allowedMethods: ['GET', 'PUT', 'DELETE', 'OPTIONS']
        }, 405);
    });
}