curl \
    -H "token_autenticacao: bac8db9147ac80b4ba8a05bb0de7c4fd" \
    -H "Content-Type: application/json" \
    --data '{
        "primeiro_nome": "Cyrus",
        "ultimo_nome": "",
        "email": "cyrus@test.database.cric.com.br",
        "senha": "123.456",
        "ativo": 1,
        "api_key": "123.456.789.0",
        "codico_crc": "1234.5678-90"
    }' \
    -X GET "http://localhost:3000/api/v1/usuarios-citopatologista"
