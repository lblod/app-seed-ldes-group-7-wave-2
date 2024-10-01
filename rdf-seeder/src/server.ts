import fastify from 'fastify'
import minimist from 'minimist'
import { Registry, collectDefaultMetrics } from 'prom-client';


import { Controller } from './controller';
import { ControllerConfig } from './interfaces';

const megabyte = 1048576;
const server = fastify({ bodyLimit: 1 * megabyte });

const register = new Registry();
register.setDefaultLabels({ app: 'rdf-seeder' });

collectDefaultMetrics({
  register: register,
  prefix: 'node_',
});

server.get('/prometheus', async (_, reply) => {
  reply.header('content-type', register.contentType).send(await register.metrics());
});


const args = minimist(process.argv.slice(2));
console.debug("Arguments: ", args);

const port = args['port'] || 80;
const host = args['host'] || 'localhost';

const sparqlEndpoint = args['sparql-endpoint'] || 'http://localhost:8890/sparql';
console.info("Sending RDF to: ", sparqlEndpoint);

const defaultGraph = args['default-graph'] || 'http://example.com';
console.info("Storing RDF in: ", defaultGraph);

const controller = new Controller({ sparqlEndpoint, register, defaultGraph } as ControllerConfig);

server.addHook('onResponse', (request, reply, done) => {
  const method = request.method;
  const statusCode = reply.statusCode;
  console.debug(`[INFO] ${method} ${request.url}${method === 'POST' ? ' ' + request.headers['content-type'] : ''} ${statusCode}`);
  done();
});

const contentTypeTriples = 'application/n-triples';

server.addContentTypeParser([contentTypeTriples], { parseAs: 'string' }, function (_, body, done) {
  done(null, body);
})

server.post('/rdf', async (request, reply) => {
  if (request.headers['content-type'] !== contentTypeTriples) {
    return reply.status(400).send({ error: 'only N-triples are accepted' })
  }

  try {
    const body = request.body as string;
    const response = await controller.postTriples(body);
    return reply.status(response.status).send(response.body);
  } catch (error: any) {
    console.error('[ERROR] ', error);
    return reply.status(500);
  }
});

async function closeGracefully(signal: any) {
  console.info(`Received signal: `, signal);
  await server.close();
  process.exit(0);
}

process.on('SIGTERM', closeGracefully);
process.on('SIGQUIT', closeGracefully);
process.on('SIGINT', closeGracefully);

function exitWithError(error: any) {
  console.error('[ERROR] ', error);
  process.exit(1);
}

const options = { port: port, host: host };
server.listen(options, async (err: any, address: string) => {
  if (err) {
    exitWithError(err);
  }
  console.info(`RDF seeder listening at ${address}`);
});
