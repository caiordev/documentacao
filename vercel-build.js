// vercel-build.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Executar o build normal do Vite
console.log('Executando build do Vite...');
execSync('npm run build', { stdio: 'inherit' });

// Criar pasta documentacao na raiz de dist
console.log('Criando estrutura de pastas para o base path...');
const documentacaoPath = path.resolve('dist/documentacao');
if (!fs.existsSync(documentacaoPath)) {
  fs.mkdirSync(documentacaoPath, { recursive: true });
}

// Copiar os assets para a pasta documentacao/assets
console.log('Copiando assets...');
const assetsPath = path.resolve('dist/assets');
const documentacaoAssetsPath = path.resolve('dist/documentacao/assets');

if (!fs.existsSync(documentacaoAssetsPath)) {
  fs.mkdirSync(documentacaoAssetsPath, { recursive: true });
}

// Copiar todos os arquivos da pasta assets para documentacao/assets
fs.readdirSync(assetsPath).forEach(file => {
  const srcPath = path.join(assetsPath, file);
  const destPath = path.join(documentacaoAssetsPath, file);
  fs.copyFileSync(srcPath, destPath);
});

// Copiar o index.html para a pasta documentacao
console.log('Copiando index.html...');
fs.copyFileSync(
  path.resolve('dist/index.html'),
  path.resolve('dist/documentacao/index.html')
);

// Copiar outras pastas se necessário (auth, docs, etc.)
const otherFolders = ['auth', 'docs'];
otherFolders.forEach(folder => {
  const srcFolder = path.resolve(`dist/${folder}`);
  const destFolder = path.resolve(`dist/documentacao/${folder}`);
  
  if (fs.existsSync(srcFolder)) {
    console.log(`Copiando pasta ${folder}...`);
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }
    
    // Copiar arquivos recursivamente
    function copyFolderSync(src, dest) {
      if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(file => {
          const srcFile = path.join(src, file);
          const destFile = path.join(dest, file);
          copyFolderSync(srcFile, destFile);
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    
    copyFolderSync(srcFolder, destFolder);
  }
});

console.log('Build para Vercel concluído com sucesso!');
