
# ELK STACK - INSTALAÇÃO E CONFIGURAÇÃO
> O ELK Stack(Elastic Stack) é composto pelos seguintes produtos: Elasticsearch,  Kibana, Beats e Logstash. 

## 1. O que é cada produto?

### Elasticsearch
O Elasticsearch é um mecanismo de análise de dados e busca RESTful distribuído, capaz de atender a um número crescente de casos de uso. Como elemento central do Elastic Stack, ele armazena seus dados centralmente para proporcionar busca rápida, relevância com ajuste fino e analítica poderosa que pode ser ampliada com facilidade.

### Kibana
Kibana é uma ferramenta de visualização e gerenciamento de dados para Elasticsearch que fornece histogramas, gráficos de linha, gráficos de pizza e mapas em tempo real. Ele permite que você visualize seus dados do Elasticsearch e navegue no Elastic Stack. Você pode selecionar a forma como dá forma aos seus dados começando com uma pergunta para descobrir aonde a visualização interativa o levará. Uma grande desvantagem é que cada visualização só pode funcionar em um único índice. Então, se você tiver índices com dados estritamente diferentes, você terá que criar visualizações separadas para cada um.

### Logstash
Logstash é usado para agregar e processar dados e enviá-los ao Elasticsearch. É um pipeline de processamento de dados do lado do servidor de código aberto que ingere dados de uma infinidade de fontes simultaneamente, os transforma e os envia para coleta. Ele também transforma e prepara os dados independentemente do formato, identificando campos nomeados para construir a estrutura e os transforma para convergir em um formato comum.

### details Beats
O Beats é uma coleção de agentes de envio de dados leves e de propósito único usados para enviar dados de centenas ou milhares de máquinas e sistemas para Logstash ou Elasticsearch. Os Beats são ótimos para coletar dados, pois podem ficar em seus servidores, com seus contêineres ou implantar como funções e, em seguida, centralizar dados no Elasticsearch. 

## 2. Requisitos
- Docker
- Docker Compose
- Java 11+

## 3. Arquitetura


### Detalhes
  - O Nginx é responsável por guardar o log de acesso aos serviços. Esse log contém as informações de acesso de todas as aplicações, sendo necessário apenas um Filebeat nesse contexto;
  - As aplicações geram arquivos de log independentes. Esse log contém informações da aplicação Java Spring. Cada aplicação possui seu próprio Filebeat;
  - O Filbeat configurado (tanto no Nginx como em cada Serviço) envia seus dados de log para o Logstash.
  - O Logstash recebe e trata os dados de log enviados pelo Filebeat da aplicação e depois os envia para o Elastisearch.
  - O Kibana visualiza as informações armanezadas no Elasticsearch.

## 4. Criar a estrutura com Docker Compose (No Servidor ELK)

- Criar pastas de dados
```sh
    sudo mkdir -p /home/elk_data/elasticsearch
    sudo mkdir -p /home/elk_data/kibana
    sudo mkdir -p /home/elk_data/kibana/config
    sudo mkdir -p /home/elk_data/logstash/pipeline
    sudo mkdir -p /home/elk_data/logstash/config
```
  - Atualizar as permissões das pastas criadas
```sh
    chown -R root:root /home/elk_data/elasticsearch
    chmod 777 /home/elk_data/elasticsearch
    chown -R root:root /home/elk_data/kibana
    chmod 777 /home/elk_data/kibana
```
- Instalação da stack com Docker Compose
```yml
version: "3"
services:
  elasticsearch:
    image: elasticsearch:7.12.0
    container_name: elasticsearch
    hostname: elasticsearch
    ports:
      - 9200:9200
      - 9300:9300
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
      - xpack.monitoring.enabled=true
      # - xpack.ml.enabled=true
      # - xpack.security.enabled=true
      # - ELASTIC_PASSWORD=$ELASTIC_PASSWORD
    networks:
      - elk
    volumes:
      - '/home/elk_data/elasticsearch:/usr/share/elasticsearch/data'
      
  kibana:
    image: kibana:7.12.0
    container_name: kibana
    hostname: kibana
    ports:
      - 5601:5601
    environment:
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
      #- ELASTICSEARCH_USERNAME=elastic
      #- ELASTICSEARCH_PASSWORD=$ELASTIC_PASSWORD
    links:
      - elasticsearch:elasticsearch
    networks:
      - elk
    depends_on:
      - elasticsearch
    volumes:
      - '/home/elk_data/kibana:/usr/share/kibana/data'
      - '/home/elk_data/kibana/config:/usr/share/kibana/config'
  logstash:
    image: logstash:7.12.0
    container_name: logstash
    hostname: logstash
    ports:
      - 9600:9600
      - 5044:5044
    environment:
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
      # - ELASTICSEARCH_USERNAME=elastic
      # - ELASTICSEARCH_PASSWORD='elastic-ssp123'

    links:
      - elasticsearch:elasticsearch
    depends_on:
      - elasticsearch
    networks:
      - elk
    volumes:
      # - '/home/elk_data/logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml:ro,Z'
      - '/home/elk_data/logstash/pipeline:/usr/share/logstash/pipeline'
    command: bash -c "logstash-plugin install logstash-filter-geoip && logstash"
    security_opt:
      - seccomp:unconfined

networks:
  elk:
    driver: bridge

# volumes:
#   elk_data:
#     external: true
            
```

### 5. Config váriaveis de ambiente (Opcional)
```
#ELASTIC_VERSION=8.11.3

## Passwords for stack users
#

# User 'elastic' (built-in)
#
# Superuser role, full access to cluster management and data indices.
# https://www.elastic.co/guide/en/elasticsearch/reference/current/built-in-users.html
ELASTIC_PASSWORD='elastic-ssp123'

# User 'logstash_internal' (custom)
#
# The user Logstash uses to connect and send data to Elasticsearch.
# https://www.elastic.co/guide/en/logstash/current/ls-security.html
LOGSTASH_INTERNAL_PASSWORD='logstash-ssp123'

# User 'kibana_system' (built-in)
#
# The user Kibana uses to connect and communicate with Elasticsearch.
# https://www.elastic.co/guide/en/elasticsearch/reference/current/built-in-users.html
KIBANA_SYSTEM_PASSWORD='kibana-ssp123'

# Users 'metricbeat_internal', 'filebeat_internal' and 'heartbeat_internal' (custom)
#
# The users Beats use to connect and send data to Elasticsearch.
# https://www.elastic.co/guide/en/beats/metricbeat/current/feature-roles.html
#METRICBEAT_INTERNAL_PASSWORD=''
#FILEBEAT_INTERNAL_PASSWORD=''
#HEARTBEAT_INTERNAL_PASSWORD=''

# User 'monitoring_internal' (custom)
#
# The user Metricbeat uses to collect monitoring data from stack components.
# https://www.elastic.co/guide/en/elasticsearch/reference/current/how-monitoring-works.html
#MONITORING_INTERNAL_PASSWORD=''

# User 'beats_system' (built-in)
#
# The user the Beats use when storing monitoring information in Elasticsearch.
# https://www.elastic.co/guide/en/elasticsearch/reference/current/built-in-users.html
#BEATS_SYSTEM_PASSWORD=''

```
  
### 5. Config senha Elasticsearch (Opcional)
./bin/elasticsearch-setup-passwords interactive
./bin/elasticsearch-setup-passwords auto

### 5. Configurar pipeline do Logstash (No Servidor ELK)
- Crie o arquivo *logstash.conf*. na pasta *.logstash*

```js

   input {
      beats {
        port => 5044
      }
    }

    filter {
      grok {
          match => { "message" => "%{IPORHOST:remote_ip} - %{DATA:user_name} \[%{HTTPDATE:time}\] \"%{WORD:method} %{DATA:url} HTTP/%{NUMBER:http_version}\" %{NUMBER:response_code} %{NUMBER:body_sent:bytes} \"%{DATA:referrer}\" \"%{DATA:useragent}\"" }
      }

      geoip {
        source => "remote_ip"
        #target => "geoip"
      }

    }

    output {
      elasticsearch {
        hosts => ["172.20.1.32:9200"]
        #index => "%{[@metadata][beat]}-%{[@metadata][version]}-%{+YYYY.MM.dd}"
        user => "elastic"
        password => "elastic-ssp123" 
        index => "nginx-172.20.1.16-%{+YYYY.MM.dd}"
      }
    }

 
```
- Logstash config .logstash/config/logstash.yml
```
  http.host: "0.0.0.0"
  xpack.monitoring.elasticsearch.hosts: [ "http://172.20.1.32:9200" ]
```

## 6. Iniciar o Elastic Stack (No Servidor ELK)
- Acesse o diretório raiz que contém o arquivo docker-compose.yml
```sh
$ cd elk-path/
$ docker-compose up -d 
```
ou 

```sh
$ docker-compose -f docker-compose.yml up -d
```
Verifique se todos os containers iniciaram corretamente
```sh
$ docker ps
```
## config senha Kibana(Opcional)
```
./bin/kibana-keystore create
./bin/kibana-keystore add elasticsearch.password
```
## Configura Geoip no Kibana
 - Cria um index no Kibana em http://172.20.1.29:5601/app/dev_tools#/console
    - Obs.: o plugin do geoip já foi instalado junto com o container do Logstash no docker compose
    - Configurar geoip.location do tipo geo_point
    
    - Obs.: excluir(ou reindexar) todos os índices já criados antes de executar o PUT. Caso contrário, o o campo geo.ip fica type String e o índice não aparece quando for criar o mapa;

    - Para definir para todos os índices futuros deve-se criar um template.

    
        PUT _index_template/nginx-template
        {
          "index_patterns": ["nginx-*"],  // Substitua com o padrão que corresponde aos seus nomes de índice
          "template": {
            "settings": {
              "number_of_shards": 1
            },
            "mappings": {
              "properties": {
                "geoip": {
                  "properties": {
                    "location": {
                      "type": "geo_point"
                    }
                  }
                }
              }
            }
          }
        }
    - Definir o tipo geo_point para um index específico. 
        PUT nginx-172.20.1.16-2024.01.05
        {
          "mappings": {
            "properties": {
              "geoip": {
                "properties": {
                  "location": {
                    "type": "geo_point"
                  }
                }
              }
            }
          }
        }



# Filebeat

  - filebeat modules enable nginx

```
###################### Filebeat Configuration Example #########################

# This file is an example configuration file highlighting only the most common
# options. The filebeat.reference.yml file from the same directory contains all the
# supported options with more comments. You can use it as a reference.
#
# You can find the full configuration reference here:
# https://www.elastic.co/guide/en/beats/filebeat/index.html

# For more available modules and options, please see the filebeat.reference.yml sample
# configuration file.

# ============================== Filebeat inputs ===============================

filebeat.inputs:

# Each - is an input. Most options can be set at the input level, so
# you can use different inputs for various configurations.
# Below are the input specific configurations.

- type: log

  # Change to true to enable this input configuration.
  enabled: true

  # Paths that should be crawled and fetched. Glob based paths.
  paths:
    - /var/log/nginx/access.log.1
    - /var/log/nginx/error.log.1
    #- c:\programdata\elasticsearch\logs\*

  # Exclude lines. A list of regular expressions to match. It drops the lines that are
  # matching any regular expression from the list.
  #exclude_lines: ['^DBG']

  # Include lines. A list of regular expressions to match. It exports the lines that are
  # matching any regular expression from the list.
  #include_lines: ['^ERR', '^WARN']

  # Exclude files. A list of regular expressions to match. Filebeat drops the files that
  # are matching any regular expression from the list. By default, no files are dropped.
  #exclude_files: ['.gz$']

  # Optional additional fields. These fields can be freely picked
  # to add additional information to the crawled log files for filtering
  #fields:
  #  level: debug
  #  review: 1

  ### Multiline options

  # Multiline can be used for log messages spanning multiple lines. This is common
  # for Java Stack Traces or C-Line Continuation

  # The regexp Pattern that has to be matched. The example pattern matches all lines starting with [
  #multiline.pattern: ^\[

  # Defines if the pattern set under pattern should be negated or not. Default is false.
  #multiline.negate: false

  # Match can be set to "after" or "before". It is used to define if lines should be append to a pattern
  # that was (not) matched before or after or as long as a pattern is not matched based on negate.
  # Note: After is the equivalent to previous and before is the equivalent to to next in Logstash
  #multiline.match: after

# filestream is an experimental input. It is going to replace log input in the future.
- type: filestream

  # Change to true to enable this input configuration.
  enabled: true

  # Paths that should be crawled and fetched. Glob based paths.
  paths:
    - /var/log/*.log
    #- c:\programdata\elasticsearch\logs\*

  # Exclude lines. A list of regular expressions to match. It drops the lines that are
  # matching any regular expression from the list.
  #exclude_lines: ['^DBG']

  # Include lines. A list of regular expressions to match. It exports the lines that are
  # matching any regular expression from the list.
  #include_lines: ['^ERR', '^WARN']

  # Exclude files. A list of regular expressions to match. Filebeat drops the files that
  # are matching any regular expression from the list. By default, no files are dropped.
  #prospector.scanner.exclude_files: ['.gz$']

  # Optional additional fields. These fields can be freely picked
  # to add additional information to the crawled log files for filtering
  #fields:
  #  level: debug
  #  review: 1

# ============================== Filebeat modules ==============================

filebeat.config.modules:
  # Glob pattern for configuration loading
  path: ${path.config}/modules.d/*.yml

  # Set to true to enable config reloading
  reload.enabled: false

  # Period on which files under path should be checked for changes
  #reload.period: 10s

# ======================= Elasticsearch template setting =======================

setup.template.settings:
  index.number_of_shards: 1
  #index.codec: best_compression
  #_source.enabled: false


# ================================== General ===================================

# The name of the shipper that publishes the network data. It can be used to group
# all the transactions sent by a single shipper in the web interface.
#name:

# The tags of the shipper are included in their own field with each
# transaction published.
#tags: ["service-X", "web-tier"]

# Optional fields that you can specify to add additional information to the
# output.
#fields:
#  env: staging

# ================================= Dashboards =================================
# These settings control loading the sample dashboards to the Kibana index. Loading
# the dashboards is disabled by default and can be enabled either by setting the
# options here or by using the `setup` command.
#setup.dashboards.enabled: false

# The URL from where to download the dashboards archive. By default this URL
# has a value which is computed based on the Beat name and version. For released
# versions, this URL points to the dashboard archive on the artifacts.elastic.co
# website.
#setup.dashboards.url:

# =================================== Kibana ===================================

# Starting with Beats version 6.0.0, the dashboards are loaded via the Kibana API.
# This requires a Kibana endpoint configuration.
setup.kibana:

  # Kibana Host
  # Scheme and port can be left out and will be set to the default (http and 5601)
  # In case you specify and additional path, the scheme is required: http://localhost:5601/path
  # IPv6 addresses should always be defined as: https://[2001:db8::1]:5601
  
  host: "172.20.1.29:5601

  # Kibana Space ID
  # ID of the Kibana Space into which the dashboards should be loaded. By default,
  # the Default Space will be used.
  #space.id:

# =============================== Elastic Cloud ================================

# These settings simplify using Filebeat with the Elastic Cloud (https://cloud.elastic.co/).

# The cloud.id setting overwrites the `output.elasticsearch.hosts` and
# `setup.kibana.host` options.
# You can find the `cloud.id` in the Elastic Cloud web UI.
#cloud.id:

# The cloud.auth setting overwrites the `output.elasticsearch.username` and
# `output.elasticsearch.password` settings. The format is `<user>:<pass>`.
#cloud.auth:

# ================================== Outputs ===================================

# Configure what output to use when sending the data collected by the beat.

# ---------------------------- Elasticsearch Output ----------------------------
#output.elasticsearch:
  # Array of hosts to connect to.
  #hosts: ["172.18.0.2:9200"]

  # Protocol - either `http` (default) or `https`.
  #protocol: "https"

  # Authentication credentials - either API key or username/password.
  #api_key: "id:api_key"
  #username: "elastic"
  #password: "changeme"

# ------------------------------ Logstash Output -------------------------------
output.logstash:
  # The Logstash hosts
  hosts: ["172.20.1.32:5044"]

  # Optional SSL. By default is off.
  # List of root certificates for HTTPS server verifications
  #ssl.certificate_authorities: ["/etc/pki/root/ca.pem"]

  # Certificate for SSL client authentication
  #ssl.certificate: "/etc/pki/client/cert.pem"

  # Client Certificate Key
  #ssl.key: "/etc/pki/client/cert.key"

# ================================= Processors =================================
processors:
  - add_host_metadata:
      when.not.contains.tags: forwarded
  - add_cloud_metadata: ~
  - add_docker_metadata: ~
  - add_kubernetes_metadata: ~

# ================================== Logging ===================================

# Sets log level. The default log level is info.
# Available log levels are: error, warning, info, debug
#logging.level: debug

# At debug level, you can selectively enable logging only for some components.
# To enable all selectors use ["*"]. Examples of other selectors are "beat",
# "publisher", "service".
#logging.selectors: ["*"]

# ============================= X-Pack Monitoring ==============================
# Filebeat can export internal metrics to a central Elasticsearch monitoring
# cluster.  This requires xpack monitoring to be enabled in Elasticsearch.  The
# reporting is disabled by default.

# Set to true to enable the monitoring reporter.
#monitoring.enabled: false

# Sets the UUID of the Elasticsearch cluster under which monitoring data for this
# Filebeat instance will appear in the Stack Monitoring UI. If output.elasticsearch
# is enabled, the UUID is derived from the Elasticsearch cluster referenced by output.elasticsearch.
#monitoring.cluster_uuid:

# Uncomment to send the metrics to Elasticsearch. Most settings from the
# Elasticsearch output are accepted here as well.
# Note that the settings should point to your Elasticsearch *monitoring* cluster.
# Any setting that is not set is automatically inherited from the Elasticsearch
# output configuration, so if you have the Elasticsearch output configured such
# that it is pointing to your Elasticsearch monitoring cluster, you can simply
# uncomment the following line.
#monitoring.elasticsearch:

# ============================== Instrumentation ===============================

# Instrumentation support for the filebeat.
#instrumentation:
    # Set to true to enable instrumentation of filebeat.
    #enabled: false

    # Environment in which filebeat is running on (eg: staging, production, etc.)
    #environment: ""

    # APM Server hosts to report instrumentation results to.
    #hosts:
    #  - http://localhost:8200

    # API Key for the APM Server(s).
    # If api_key is set then secret_token will be ignored.
    #api_key:

    # Secret token for the APM Server(s).
    #secret_token:


# ================================= Migration ==================================

# This allows to enable 6.7 migration aliases
#migration.6_to_7.enabled: true

```
- Reinicie o filebeat
```
 - sudo systemctl restart filebeat
```

## 7. Configurar gravação de log da aplicação (Na Aplicação Java Spring)
 - Defina a pasta e o nome do arquivo de log no arquivo **application.properties** da aplicação.
 
```
 logging.path=/opt/app/log
 logging.file=/opt/app/log/NAME_SERVICE.log
```

## 8. Adicionar e configurar o Filebeat no container da aplicação
- Criar arquivo **filebeat.yml** na raiz do projeto
```
filebeat.inputs:
- type: log
  paths:
   # - /opt/sigma_desenvolvimento/logs/*.log
   - /opt/app/log/*.log

  multiline.type: pattern
  multiline.pattern: '^[[:space:]]+(at|\.{3})[[:space:]]+\b|^Caused by:'
  multiline.negate: false
  multiline.match: after

output.logstash:
  hosts: ["IP_ELK:5044"]
  index: "index-name-service"
```

- Adicionar instalação do Filebeat no Dockerfile da aplicação

```dockerfile
FROM adoptopenjdk/openjdk11

EXPOSE 8070

ARG JAR_FILE=target/APP.jar

WORKDIR /opt/app

COPY ${JAR_FILE} APP.jar

# Instalação do Filebeat
RUN mkdir /opt/app/log
RUN curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.13.0-amd64.deb
RUN dpkg -i filebeat-7.13.0-amd64.deb
COPY filebeat.yml /etc/filebeat/filebeat.yml
RUN chmod go-w /etc/filebeat/filebeat.yml

ENTRYPOINT ["java","-jar","APP.jar"]

```
<!-- - Obs.: Altere a imagem de *FROM adoptopenjdk/openjdk11:alpine-jre* para *FROM adoptopenjdk/openjdk11*. -->
::: danger CUIDADO!!
Altere a imagem de **FROM adoptopenjdk/openjdk11:alpine-jre** para **FROM adoptopenjdk/openjdk11**.
:::

## 9. Configuração de índices e visualização de dados no Kibana


## 10. Troubleshooting
### Verificar se Filebeat da aplicação está se comunicando com o Logstash
```sh
$ docker exec -it CONTAINER-NAME sh
$ filebeat test config
$ filebeat test output
$ filebeat -e
```

### Verificar log do Elasticsearch, Kibana ou Logstash
```sh
$ docker logs elasticsearch -f
$ docker logs kibana -f
$ docker logs logstash -f

```
### Verificar se a licença do Elasticsearch está ativa
```sh
$ curl -XGET 'http://IP_ELK:9200/_license'
```
- Veja se o campo "status" aparece como "active".
- Se a licença estiver inativa verifique a hora do servidor

 ```sh
$ date
sex jun 16 17:40:15 -03 2023
```

- Se a hora estiver errada, ajuste-a manualmente
 ```sh
$ date -s "Fri May 19 14:02:12 UTC 2023"
```

### Verificar se o Elasticsearch está guardando os logs enviados pelo Filebeat (Apenas se estiver enviando diretamente para o Elasticsearch)
 ```sh
$ curl -XGET 'http://IP_ELK:9200/filebeat-*/_search?pretty'
http://172.20.1.32:9200/_cat/
http://172.20.1.32:9200/_license
http://172.20.1.32:9200/nginx-*/_mapping

```

## Referências
- [ ] [Setup ELK stack to monitor Spring application logs - Part 2](https://wayne-yuen.blogspot.com/2017/03/setup-elk-stack-to-monitor-spring.html)
- [ ] [Spring Boot Logs Aggregation and Monitoring Using ELK Stack](http://gitlab.ssp.ma.gov.br/desenvolvimento/devdocs/-/settings/integrations)
- [ ] [How to build a log collection system for Springboot projects in Kubernetes](https://medium.com/@lyzkevin2020/how-to-build-a-log-collection-system-for-springboot-projects-in-kubernetes-3f4c3e09dd6b)
- [ ] [Spring Boot Logging](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.logging)
- [ ] [Spring Boot Logs Aggregation and Monitoring Using ELK Stack](https://gist.github.com/meilinger/19f33179a0d3d94979b32fb3866f90c5)
- [ ] [Logstash and Filebeat in 5 minutes](https://gist.github.com/meilinger/19f33179a0d3d94979b32fb3866f90c5#logstash-and-filebeat-in-5-minutes)
- [ ] [Springboot + ELK + Docker](https://www.faun.dev/c/stories/jefsterjr/springboot-elk-docker/)
- [ ] [Springboot + ELK + Docker (Github)](https://github.com/jefsterjr/library/tree/main?ref=faun#springboot--elk--docker)
- [ ] [How To Install Elasticsearch, Logstash, and Kibana (Elastic Stack) on Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-install-elasticsearch-logstash-and-kibana-elastic-stack-on-ubuntu-22-04)
- [ ] [Integrate Filebeat, Kafka, Logstash, Elasticsearch And Kibana](https://facingissuesonit.com/2017/05/29/integrate-filebeat-kafka-logstash-elasticsearch-and-kibana/)
- [ ] [Spring Boot Logs Aggregation and Monitoring Using ELK Stack](https://auth0.com/blog/spring-boot-logs-aggregation-and-monitoring-using-elk-stack/)
- [ ] [A STACK ELASTIC - INSTALAÇÃO E CONFIGURAÇÃO](https://www.vivaolinux.com.br/artigo/Elastic-SIEM-Instalacao-e-Configuracao-do-LAB-Parte-I?pagina=2)
- [ ] [Installing ELK Stack in Docker](https://medium.com/analytics-vidhya/installing-elk-stack-in-docker-828df335e421)
- [ ] [Grok Patterns](https://github.com/elastic/elasticsearch/blob/main/libs/grok/src/main/resources/patterns/ecs-v1/grok-patterns)
- [ ] [Configura geoip.location](https://www.elastic.co/guide/en/elasticsearch/reference/current/geo-point.html)
- [ ] [Autenticação](https://anselmoborges.medium.com/ativando-a-autentica%C3%A7%C3%A3o-do-elasticsearch-e-kibana-de2835d40e14)

