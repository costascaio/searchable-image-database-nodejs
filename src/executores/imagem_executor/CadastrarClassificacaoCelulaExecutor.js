'use strict'

const Excecao = require('../../utils/enumeracoes/mensagem_excecoes');
const ObjetoExcecao = require('../../utils/enumeracoes/controle_de_excecoes');
const HttpStatus = require('http-status-codes');
const ValidarTipo = require('../../utils/validacao_de_tipos');
const UsuarioRepositorio = require('../../repositorios/usuario_repositorio');
const ImagemRepositorio = require('../../repositorios/imagem_repositorio');
const ValidadorDeSessao = require('../../utils/validador_de_sessao');
const ConverterPonto = require('../../utils/transformacao_de_pontos');
const ObterImagemExecutor = require('../../executores/imagem_executor/ObterImagemExecutor');
const ListarClassificacaoCelulaExecutor = require('../imagem_executor/ListarClassificacaoCelulaExecutor');

module.exports = {

    async Executar(req) {

        await ValidadorDeSessao.validarAcessoAServicos(req);
        await validarRequisicao(req);
        const id_usuario = parseInt(req.params.id_usuario);
        const id_imagem = parseInt(req.params.id_imagem);

        let parametros = {
            coord_x: req.body.coord_centro_nucleo_x,
            coord_y: req.body.coord_centro_nucleo_y,
            alturaCanvas: req.body.alturaCanvas,
            larguraCanvas: req.body.larguraCanvas,
            alturaOriginalImg: req.body.alturaOriginalImg,
            larguraOriginalImg: req.body.larguraOriginalImg
        }

        const celulaCadastrada = await ImagemRepositorio.cadastrarCelulaClassificada(id_imagem, req.body.id_lesao);
        if (!celulaCadastrada) {
            ObjetoExcecao.status_code = HttpStatus.INTERNAL_SERVER_ERROR;
            ObjetoExcecao.mensagem = Excecao.ERRO_AO_CADASTRAR_CELULA;
            throw ObjetoExcecao;   
        }
        
        let resultado = ConverterPonto.converterPontoParaArmazenarNoBanco(parametros);
        const classificacaoCadastrada = 
        await ImagemRepositorio.cadastrarClassificacaoCelula(id_usuario, celulaCadastrada.dataValues.id, resultado.coord_x, resultado.coord_y);

        if (classificacaoCadastrada) {

            const analista = await UsuarioRepositorio.obterAnalistaPorId(id_usuario);
            let novoTotalSegmentacoes = parseInt(analista.dataValues.total_classificacoes) + 1;

            const sqlQuery = `
                UPDATE analista
                SET total_classificacoes = ${novoTotalSegmentacoes}
                WHERE id = ${id_usuario}`;

            await UsuarioRepositorio.processarQuerySql(sqlQuery);
            const listaDeClassificacoes = await ListarClassificacaoCelulaExecutor.Executar(req);

            await atualizarLesaoMaisGraveNaImagem(id_imagem, listaDeClassificacoes);
            return await ObterImagemExecutor.Executar(req);            
        }
    }
};

async function validarRequisicao(req) {

    if (!ValidarTipo.ehNumero(req.params.id_usuario) || !ValidarTipo.ehNumero(req.params.id_imagem) ||
        !ValidarTipo.ehNumero(req.body.id_lesao) || !ValidarTipo.ehNumero(req.body.alturaCanvas) ||
        !ValidarTipo.ehNumero(req.body.larguraCanvas) || !ValidarTipo.ehNumero(req.body.alturaOriginalImg) || !ValidarTipo.ehNumero(req.body.larguraOriginalImg) || !ValidarTipo.ehNumero(req.body.coord_centro_nucleo_x) ||
        !ValidarTipo.ehNumero(req.body.coord_centro_nucleo_y)) {

        ObjetoExcecao.status_code = HttpStatus.BAD_REQUEST;
        ObjetoExcecao.mensagem = Excecao.PARAMETROS_INVALIDOS;
        throw ObjetoExcecao;
    }

    const usuarioTask = UsuarioRepositorio.obterUsuarioBasePorId(req.params.id_usuario);
    const analistaTask = UsuarioRepositorio.obterAnalistaPorId(req.params.id_usuario);
    const imagemTask = ImagemRepositorio.obterImagemPorId(req.params.id_imagem);
    const lesaoTask = ImagemRepositorio.obterLesaoPorId(req.body.id_lesao);
    const [usuario, analista, imagem, lesao] = await Promise.all([usuarioTask, analistaTask, imagemTask, lesaoTask]);

    if (!usuario) {
        ObjetoExcecao.status_code = HttpStatus.NOT_FOUND;
        ObjetoExcecao.mensagem = Excecao.USUARIO_BASE_NAO_ENCONTRATO;
        throw ObjetoExcecao;
    }

    if (!analista) {
        ObjetoExcecao.status_code = HttpStatus.FORBIDDEN;
        ObjetoExcecao.mensagem = Excecao.OPERACAO_PROIBIDA_PARA_O_USUARIO;
        throw ObjetoExcecao;
    }

    if (!lesao) {
        ObjetoExcecao.status_code = HttpStatus.NOT_FOUND;
        ObjetoExcecao.mensagem = Excecao.LESAO_NAO_ENCONTRADA;
        throw ObjetoExcecao;
    }

    if (!imagem) {
        ObjetoExcecao.status_code = HttpStatus.NOT_FOUND;
        ObjetoExcecao.mensagem = Excecao.IMAGEM_NAO_ENCONTRADA;
        throw ObjetoExcecao;
    }
}


async function atualizarLesaoMaisGraveNaImagem(id_imagem, listaDeClassificacoes){

    let idLesaoMaisGrave = 1;
    listaDeClassificacoes.celulas.forEach(celula => {
        if(celula.lesao.id > idLesaoMaisGrave) {
            idLesaoMaisGrave = celula.lesao.id;
        }
    });
    
    return ImagemRepositorio.atualizarLesaoImagem(id_imagem, idLesaoMaisGrave);
}