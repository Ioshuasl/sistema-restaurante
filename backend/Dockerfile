# --- Estágio 1: Build ---
# Utiliza uma imagem base oficial do Node.js. A tag 'alpine' refere-se a uma versão leve,
# ideal para produção, diminuindo o tamanho final da imagem.
# Escolhemos a versão 20, uma versão LTS (Long Term Support) estável.
FROM node:22-alpine AS build

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia os arquivos de definição de dependências para o diretório de trabalho.
# Copiamos estes arquivos primeiro para aproveitar o cache do Docker.
# Se esses arquivos não mudarem, o Docker não reinstalará as dependências a cada build.
COPY package.json package-lock.json* ./

# Instala as dependências de produção. O flag '--production' garante que
# apenas as dependências listadas em "dependencies" sejam instaladas.
RUN npm install --production

# Copia o restante do código-fonte da aplicação para o contêiner.
COPY . .

# --- Estágio 2: Produção ---
# Cria um estágio final a partir de uma imagem base limpa para um ambiente de produção mais seguro e enxuto.
FROM node:22-alpine

# Define o diretório de trabalho.
WORKDIR /app

# Copia as dependências instaladas e o código-fonte do estágio de build.
# Isso resulta em uma imagem final menor, sem as ferramentas de build.
COPY --from=build /app .

# Expõe a porta em que a sua aplicação Express provavelmente roda.
# O Easypanel fará o mapeamento desta porta automaticamente.
# Se sua aplicação usa uma porta diferente, altere o valor abaixo.
EXPOSE 3000

# Adiciona um usuário não-root para executar a aplicação por motivos de segurança.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Cria o diretório de uploads
RUN mkdir -p /app/public/uploads && \
    # Dá a posse do diretório ao usuário da aplicação
    chown -R appuser:appgroup /app/public/uploads

USER appuser

# Define o comando padrão para iniciar a aplicação quando o contêiner for executado.
# Este comando é o mesmo que o script "start" no seu package.json.
CMD ["npm", "start"]