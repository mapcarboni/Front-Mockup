"use client";

import React from "react";
import Link from "next/link";

export default function ProfilePage() {
    return (
        <div>
            <h1>Perfil do Usuário</h1>
            <Link href="/alunos">
                <button>Ver Alunos</button>
            </Link>
        </div>
    );
}
