#!/bin/bash

curl -X POST -H "content-type: application/yaml" http://localhost:8081/admin/api/v1/pipeline --data-binary @./workbench/client-pipeline.yml
