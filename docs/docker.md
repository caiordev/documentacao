---
title: Docker - Instalação e Configuração
---
<!-- # Docker — Instalação e Configuração -->
# Docker
## Instalação
```sh
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
sudo apt update
apt-cache policy docker-ce
sudo apt install docker-ce
sudo systemctl status docker

```

### (Opcional) Executando o Docker sem privilégios de superuser
```sh
sudo usermod -aG docker ${USER}
su - ${USER}
id -nG
```
<!-- <docker/> -->

### Referência:
* [How to install and use docker on ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04-pt)
* [Docker: documentação oficial](https://docs.docker.com/)

