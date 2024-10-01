import { Registry, PrometheusContentType } from 'prom-client';

export interface ControllerConfig {
  register: Registry<PrometheusContentType>,
  sparqlEndpoint: string,
  defaultGraph: string,
}
