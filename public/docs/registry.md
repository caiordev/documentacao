# Registry

O Registry é um repositório de imagens Docker que permite armazenar e distribuir imagens de contêineres de forma privada dentro da infraestrutura da SSP.

## Características Principais

- **Armazenamento Privado**: Armazena imagens Docker em um ambiente seguro e controlado.
- **Controle de Acesso**: Integração com o sistema de autenticação da SSP.
- **Eficiência**: Cache local para downloads mais rápidos.
- **Integração com CI/CD**: Funciona perfeitamente com os pipelines do GitLab.

## Como Usar

Para usar o Registry da SSP:

1. Faça login no registry:
   ```bash
   docker login registry.ssp.ma.gov.br
   ```

2. Para enviar uma imagem:
   ```bash
   docker tag minha-imagem:tag registry.ssp.ma.gov.br/projeto/minha-imagem:tag
   docker push registry.ssp.ma.gov.br/projeto/minha-imagem:tag
   ```

3. Para baixar uma imagem:
   ```bash
   docker pull registry.ssp.ma.gov.br/projeto/minha-imagem:tag
   ```

## Boas Práticas

- Use tags específicas em vez de `latest`
- Adicione metadados úteis às suas imagens
- Limpe regularmente imagens não utilizadas

## Documentação Adicional

Para mais informações, consulte a [documentação oficial do Docker Registry](https://docs.docker.com/registry/).
