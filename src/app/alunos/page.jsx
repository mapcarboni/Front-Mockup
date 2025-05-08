"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Pagination, Skeleton, Modal, Card } from "antd";
import useSessionStorage from "../../lib/sessionStorage";

export default function AlunosPage() {
    const [alunos, setAlunos] = useSessionStorage("alunos", []);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedAluno, setSelectedAluno] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [avaliacao, setAvaliacao] = useState(null);
    const [connectionError, setConnectionError] = useState(false); // Estado para erro de conexão

    const apiKey = "2sYG7tdpcCDS53GyusZSs4U4AWrDwj";
    const headers = { "x-api-key": apiKey };

    const fetchData = async (url, cacheKey, setData) => {
        setLoading(true);

        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            setData(JSON.parse(cachedData));
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.get(url, { headers });
            setData(data);
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            setConnectionError(false); // Resetando o erro de conexão
        } catch (error) {
            console.error(`Erro ao buscar dados de ${cacheKey}:`, error);
            setConnectionError(true); // Se erro, seta que houve erro de conexão
        }

        setLoading(false);
    };

    const fetchAlunos = () =>
        fetchData("http://localhost:3000/api/estudante", "alunosData", (data) => {
            setAlunos(data);
            setFilteredData(data);
        });

    const fetchAvaliacao = (alunoId) => fetchData(`http://localhost:3000/api/avaliacao/${alunoId}`, `avaliacao_${alunoId}`, setAvaliacao);

    useEffect(() => {
        fetchAlunos();
    }, []);

    const handleCardClick = (aluno) => {
        setSelectedAluno(aluno);
        fetchAvaliacao(aluno.id);
        setModalVisible(true);
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setAvaliacao(null);
    };

    const paginated = useMemo(() => filteredData.slice((current - 1) * pageSize, current * pageSize), [filteredData, current, pageSize]);

    return (
        <div style={{ padding: 20 }}>
            <h1>Lista de Alunos</h1>

            {/* Paginação */}
            <Pagination
                align="center"
                current={current}
                pageSize={pageSize}
                total={filteredData.length}
                onChange={setCurrent}
                onShowSizeChange={(current, size) => setPageSize(size)}
                style={{ marginTop: 20 }}
                showSizeChanger
                pageSizeOptions={[5, 10, 100]}
            />

            {/* Skeleton + Cards */}
            {loading ? (
                <Skeleton active />
            ) : connectionError ? (
                <p>Conexão com o backend ou banco de dados inexistente.</p> // Mensagem de erro de conexão
            ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 20 }}>
                    {paginated.map((aluno) => (
                        <Card
                            key={aluno.id}
                            style={{ width: 200, cursor: "pointer", borderRadius: 10, marginBottom: 20 }}
                            hoverable
                            onClick={() => handleCardClick(aluno)}
                            cover={<img alt={aluno.name} src={aluno.photo || "https://placehold.co/100x100"} />}
                        >
                            <Card.Meta title={aluno.name} description={aluno.numero_registro} />
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal de Detalhes do Aluno */}
            <Modal title={`Avaliação de ${selectedAluno?.name}`} open={modalVisible} onCancel={handleModalClose} onOk={handleModalClose} width={600}>
                {avaliacao ? (
                    <div>
                        <h3>Nota: {avaliacao.nota}</h3>
                        <p>
                            <strong>Professor: </strong>
                            {avaliacao.professor}
                        </p>
                        <p>
                            <strong>Comentário: </strong>
                            {avaliacao.comentario || "Nenhum comentário disponível."}
                        </p>
                    </div>
                ) : (
                    <p>Carregando avaliação...</p>
                )}
            </Modal>
        </div>
    );
}
