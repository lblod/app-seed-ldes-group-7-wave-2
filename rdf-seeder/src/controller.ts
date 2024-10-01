import { ControllerConfig } from "./interfaces";
import { Counter, Gauge } from 'prom-client';

export class Controller {
  private _messageCount: Counter = new Counter({
    name: 'rdf_seeder_message_count',
    help: 'RDF seeder: number of RDF messages seeded'
  });
  private _seedDuration: Gauge = new Gauge({
    name: 'rdf_seeder_seed_duration',
    help: 'RDF seeder: time needed to send a message (in seconds)'
  });

  constructor(private _config: ControllerConfig) {
    _config.register.registerMetric(this._messageCount);
    _config.register.registerMetric(this._seedDuration);
  }

  async postTriples(triples: string) {
    this._messageCount.inc();
    const endTimer = this._seedDuration.startTimer();

    var result = await fetch(this._config.sparqlEndpoint, {
      method: 'POST',
      body: `INSERT INTO <${this._config.defaultGraph}> { ${triples} }`, 
      headers: {
        "Content-Type": "application/sparql-update",
        "Accept": "application/json",
      },
    });

    endTimer();
    return result;
  }

}