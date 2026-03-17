from rag.indexador import colecao, modelo_embedding

BANCOS_CONHECIDOS = [
    "facta", "bmg", "pan", "c6", "daycoval", "brb", "icred", "itau",
    "picpay", "presenca", "finanto", "happy", "inter", "inbursa",
    "totalcash", "quero mais", "safra", "banrisul", "digio", "v8",
    "amigoz", "pine", "futuro", "handmais", "prata", "nbc", "caixa"
]

def detectar_banco(pergunta):
    pergunta_lower = pergunta.lower()
    for banco in BANCOS_CONHECIDOS:
        if banco in pergunta_lower:
            return banco
    return None


def buscar_trechos (pergunta, n_resultados=5):
    embedding = modelo_embedding.encode([pergunta]).tolist()[0]
    banco = detectar_banco(pergunta)

    if banco:

        try:
            todos = colecao.get()
            ids_banco = [
                todos["ids"][i]
                for i, meta in enumerate(todos["metadatas"])
                if banco.upper() in meta.get("fonte", "").upper()
            ]

            if ids_banco:
                resultados = colecao.query(
                    query_embeddings = [embedding],
                    n_results=min(n_resultados, len(ids_banco)),
                    where={"fonte": {"$in": list(set(
                        todos["metadatas"][todos["ids"].index(id)]["fonte"]
                        for id in ids_banco
                    ))}}
                )

                if resultados["documents"][0]:
                    return _formatar(resultados)
        except Exception as e:
            print(f"Erro no filtro por banco: {e}")

    resultados = colecao.query(
        query_embeddings=[embedding],
        n_results=n_resultados
    )
    return _formatar(resultados)

def _formatar(resultados):
    trechos = []
    for i, doc in enumerate(resultados["documents"][0]):
        fonte = resultados["metadatas"][0][i]["fonte"]
        trechos.append(f"[{fonte}]\n{doc}")
    return trechos