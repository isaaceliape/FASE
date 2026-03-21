#!/bin/bash

# Script para renomear commands do FASE para português brasileiro
# NOTA: Este script é histórico. Os comandos já estão nomeados em PT-BR
# Usar este script como referência para novas traduções de idiomas
# Usage: ./renomear-comandos.sh

cd "$(dirname "$0")/../comandos"

echo "🔄 Renomeando commands para PT-BR..."
echo ""

# Mapeamento: original (English) → novo (Português BR)
declare -A MAPEAMENTO=(
    ["help.md"]="ajuda.md"
    ["new-project.md"]="novo-projeto.md"
    ["plan-phase.md"]="planejar-fase.md"
    ["execute-phase.md"]="executar-fase.md"
    ["settings.md"]="configuracoes.md"
    ["new-milestone.md"]="novo-marco.md"
    ["add-phase.md"]="adicionar-fase.md"
    ["insert-phase.md"]="inserir-fase.md"
    ["remove-phase.md"]="remover-fase.md"
    ["pause-work.md"]="pausar-trabalho.md"
    ["resume-work.md"]="retomar-trabalho.md"
    ["progress.md"]="progresso.md"
    ["research-phase.md"]="pesquisar-fase.md"
    ["map-codebase.md"]="mapear-codigo.md"
    ["list-phase-assumptions.md"]="listar-premissas.md"
    ["verify-work.md"]="verificar-trabalho.md"
    ["validate-phase.md"]="validar-fase.md"
    ["audit-milestone.md"]="auditar-marco.md"
    # debug.md permanece igual
    ["check-todos.md"]="checar-tarefas.md"
    ["add-todo.md"]="adicionar-tarefa.md"
    ["add-tests.md"]="adicionar-testes.md"
    ["discuss-phase.md"]="discutir-fase.md"
    ["complete-milestone.md"]="completar-marco.md"
    ["plan-milestone-gaps.md"]="planejar-lacunas.md"
    ["cleanup.md"]="limpar.md"
    ["health.md"]="saude.md"
    ["update.md"]="atualizar.md"
    ["quick.md"]="rapido.md"
    ["reapply-patches.md"]="reaplicar-patches.md"
    ["set-profile.md"]="definir-perfil.md"
)

# Renomear arquivos
for original in "${!MAPEAMENTO[@]}"; do
    novo="${MAPEAMENTO[$original]}"
    if [ -f "$original" ]; then
        mv "$original" "$novo"
        echo "✅ $original → $novo"
    else
        echo "⚠️  $original não encontrado"
    fi
done

echo ""
echo "🎉 Renomeação completa!"
echo ""
echo "📋 Lista de novos comandos:"
ls -1 *.md | sort
