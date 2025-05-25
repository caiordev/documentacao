# Kibana

Kibana é uma plataforma de visualização e análise de dados que funciona em conjunto com o Elasticsearch. Permite criar dashboards, gráficos e realizar análises avançadas dos dados armazenados no Elasticsearch.

## Características Principais

- **Dashboards Interativos**: Crie painéis personalizados com visualizações de dados.
- **Visualizações Avançadas**: Gráficos, tabelas, mapas e outras formas de visualização.
- **Consultas em Tempo Real**: Explore seus dados com consultas em linguagem natural.
- **Alertas e Monitoramento**: Configure alertas baseados em condições específicas.
- **Canvas e Lens**: Ferramentas para criar apresentações e análises visuais.

## Como Usar

Para acessar o Kibana na SSP:

1. Acesse `http://kibana.ssp.ma.gov.br`
2. Faça login com suas credenciais
3. Navegue pelos dashboards existentes ou crie novos

## Exemplo de Consulta KQL

```
source.ip: "192.168.1.*" and status_code: 404
```

## Criando um Dashboard

1. Acesse "Dashboard" no menu lateral
2. Clique em "Create dashboard"
3. Adicione visualizações existentes ou crie novas
4. Organize e redimensione conforme necessário
5. Salve o dashboard com um nome descritivo

## Documentação Adicional

Para mais informações, consulte a [documentação oficial do Kibana](https://www.elastic.co/guide/en/kibana/current/index.html).
