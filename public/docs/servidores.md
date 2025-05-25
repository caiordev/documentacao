# Servidores

A infraestrutura de servidores da SSP é composta por diversos equipamentos físicos e virtuais que hospedam os sistemas e serviços utilizados pela Secretaria de Segurança Pública.

## Características Principais

- **Virtualização**: Ambiente baseado em VMware para gerenciamento de máquinas virtuais.
- **Alta Disponibilidade**: Configuração em cluster para garantir continuidade dos serviços.
- **Monitoramento**: Sistema de monitoramento 24/7 com alertas automáticos.
- **Backup**: Rotinas automatizadas de backup com retenção configurável.

## Servidores Principais

| Nome | Função | Sistema Operacional |
|------|--------|---------------------|
| SRV-APP01 | Aplicações Web | Ubuntu Server 20.04 LTS |
| SRV-DB01 | Banco de Dados Principal | Oracle Linux 8 |
| SRV-DB02 | Banco de Dados Réplica | Oracle Linux 8 |
| SRV-ELASTIC | Elasticsearch/Kibana | Ubuntu Server 20.04 LTS |
| SRV-GITLAB | GitLab e Registry | Ubuntu Server 20.04 LTS |

## Acesso aos Servidores

Para acessar os servidores:

1. Utilize SSH com chave privada (recomendado) ou credenciais de rede
2. Todo acesso é registrado e auditado
3. Utilize o jumphost para acessar servidores internos

```bash
# Exemplo de acesso via jumphost
ssh -J usuario@jumphost.ssp.ma.gov.br usuario@servidor-interno
```

## Políticas de Segurança

- Atualizações de segurança são aplicadas mensalmente
- Firewall configurado para permitir apenas tráfego necessário
- Antivírus e sistemas de detecção de intrusão ativos
- Logs centralizados para análise de segurança

## Contato para Suporte

Para problemas relacionados aos servidores, entre em contato com a equipe de infraestrutura pelo e-mail: infra@ssp.ma.gov.br
