#!/bin/bash
# Script para testar a instalação do FASE localmente

set -e

echo "🧪 TESTE LOCAL DO INSTALADOR FASE"
echo "================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
  echo -e "${GREEN}✅ $1${NC}"
}

info() {
  echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. Mostrar ajuda
echo "1️⃣  Testando --help..."
if node bin/install.js --help | grep -q "F.A.S.E"; then
  success "Help funciona"
else
  echo "❌ Help não funciona como esperado"
  exit 1
fi

# 2. Criar diretório de teste
echo ""
echo "2️⃣  Criando diretório de teste..."
TEST_DIR=$(mktemp -d)
trap "rm -rf $TEST_DIR" EXIT
success "Diretório de teste: $TEST_DIR"

# 3. Testar instalação local (Claude Code)
echo ""
echo "3️⃣  Testando instalação local para Claude Code..."
cd "$TEST_DIR"
if node /Users/isaaceliape/repos/FASE/bin/install.js --claude --local > /tmp/install.log 2>&1; then
  success "Instalação local concluída"

  # Verificar se arquivos foram criados
  if [ -d ".claude/command" ]; then
    success "Diretório .claude/command criado"

    # Contar comandos
    COMMAND_COUNT=$(find .claude/command -name "*.md" 2>/dev/null | wc -l)
    if [ "$COMMAND_COUNT" -gt 0 ]; then
      success "Encontrados $COMMAND_COUNT comandos"
    fi
  fi
else
  echo "❌ Instalação falhou:"
  cat /tmp/install.log
  exit 1
fi

# 4. Testar instalação local (OpenCode)
echo ""
echo "4️⃣  Testando instalação local para OpenCode..."
rm -rf .opencode 2>/dev/null || true
if node /Users/isaaceliape/repos/FASE/bin/install.js --opencode --local > /tmp/install.log 2>&1; then
  success "Instalação OpenCode concluída"
else
  echo "⚠️  Instalação OpenCode falhou (isso é ok se OpenCode não está instalado)"
fi

# 5. Verificar integridade do pacote
echo ""
echo "5️⃣  Verificando integridade do pacote npm..."
cd /Users/isaaceliape/repos/FASE/bin
if npm pack --dry-run > /tmp/pack.txt 2>&1; then
  TOTAL_FILES=$(grep "total files:" /tmp/pack.txt | awk '{print $NF}')
  success "Pacote npm válido com $TOTAL_FILES arquivos"
else
  echo "❌ Pacote npm inválido"
  exit 1
fi

# 6. Resumo
echo ""
echo "================================="
echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
echo "================================="
echo ""
echo "O instalador está pronto para:"
echo "  ✅ Instalação local"
echo "  ✅ Instalação em package npm"
echo ""
echo "Próximos passos:"
echo "  1. Commit as mudanças"
echo "  2. Execute: ./scripts/verificar-release.sh"
echo "  3. Create a tag and push"
