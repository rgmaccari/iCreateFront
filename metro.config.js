const { getDefaultConfig } = require('expo/metro-config'); //Configuração padrão do Metro usada pelo Expo
const path = require('path'); //Manipular caminhos
const os = require('os'); // Sistema operacional
const { FileStore } = require('metro-cache'); //Tipo de cache em disco do Metro

const projectRoot = __dirname; //Raiz do projeto.

const cacheRoot = path.join(os.tmpdir(), 'iMusician-metro-cache'); //Pasta de cache fora do OneDrive

const config = getDefaultConfig(projectRoot); //Carrega a configuração base do Metro para projetos Expo

config.resetCache = true; //Força limpeza de cache a cada start -> evita lixo de cache, mas deixa o primeiro boot mais lento

config.watchFolders = [projectRoot]; //Define quais pastas o Metro deve observar para hot reload (recarregar sem reiniciar o app)

config.cacheStores = [new FileStore({ root: cacheRoot })]; //Trocar o sistema de cache padrão pelo FileStore customizado, apontando para o cache fora do OneDrive

//Interceptar requisições internas de symbolication e evita o ENOENT
const originalEnhanceMiddleware = config.server?.enhanceMiddleware; //Guarda uma possível função original de middleware usada pelo Metro

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    //Cria um novo enhanceMiddleware (um gancho que intercepta requisições HTTP internas feitas ao servidor Metro)
    const wrapped = originalEnhanceMiddleware
      ? originalEnhanceMiddleware(middleware, server)
      : middleware; //Mantém o middleware original funcionando (se existe)

    return (req, res, next) => {
      //Retornaa uma função que será chamada a cada requisição interna feita ao servidor Metro
      if (req.url?.startsWith('/symbolicate')) {
        //Bloqueia a symbolication
        res.end(JSON.stringify({ stack: [] })); //Devolve uma resposta vazia, impedindo que ele tente abrir o arquivo InternalBytecode.js
        return;
      }
      return wrapped(req, res, next); //Deixa tods as outras requisições fluírem normalmente (servidor continua funcional)
    };
  },
}; //Evita o erro do "InternalBytecode.js", ignorando arquivos não localizados ao invés de tentar lê-los mesmo inexistentes.

module.exports = config; //Exporta o objeto final para o Metro poder usar.

//Metro:
//É o empacotador (bundler) JavaScript padrão, uma ferramenta que compila todo o código do projeto,
//incluindo dependências, assets (imagens e fontes), em um único arquivo para que o aplicativo possa rodar no dispositivo...
//O "metro.config.js" é onde podemos aplicar regras e tratamentos específicos para o "compilador"
