from rag.indexador import colecao, modelo_embedding

def buscar_trechos (pergunta, n_resultados=5):
    embedding = modelo_embedding.encode([pergunta]).tolist()[0]

    resultados = colecao.query(
        query_embeddings=[embedding],
        n_results=n_resultados
    )

    trechos = []
    for i, doc in enumerate(resultados["documents"][0]):
        fonte = resultados["metadatas"][0][i]["fonte"]
        trechos.append(f"[{fonte}]\n{doc}")
    return trechos