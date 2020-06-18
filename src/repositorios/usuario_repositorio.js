"use strict";

const Sequelize = require("sequelize");

const UsuarioBaseModel = require("../models/UsuarioBaseModel");
const db = require("../database");

module.exports = {

    async processarQuerySql(sqlQuery) {

        let resultado;

        await db.query(
            sqlQuery,
            {
                type: Sequelize.QueryTypes.SELECT
            }
        )
            .then((results) => {
                resultado = results;
            });

        return resultado;
    },


    async cadastrarUsuarioBase(usuario, senhaCriptografada, status) {

        return UsuarioBaseModel.create({
            primeiro_nome: usuario.primeiro_nome,
            ultimo_nome: usuario.ultimo_nome,
            email: usuario.email,
            senha: senhaCriptografada,
            ativo: status
        });
    },

    async obterUsuarioBasePorEmail(email) {
        return await UsuarioBaseModel.findOne({
            where: {
                email: email
            }
        });
    },

    async obterUsuarioBasePorId(id_usuario) {
        return UsuarioBaseModel.findByPk(id_usuario);
    },

    async verificarEmailExistente(email) {

        if (await this.obterUsuarioBasePorEmail(email)) {
            return true;
        }
        return false;
    },

    async ListarTodosUsuarios() {
        return UsuarioBaseModel.findAll();
    },

    async change_password(email, new_hashed_password) {
        var user =  await UsuarioBaseModel.findOne({
            where: {
                email: email
            }
        });
        user.senha = new_hashed_password;
        user.save();

        return user;
    }
};
