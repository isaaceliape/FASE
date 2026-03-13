#!/bin/bash
# Script para verificar se uma release está pronta para publicação

set -e

echo "🔍 VERIFICAÇÃO PRE-RELEASE DO FASE"
echo "=================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Erro
error() {
  echo -e "${RED}❌ $1${NC}"
  exit 1
}

# Success
success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Warning
warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Verificar se estamos em main
echo "1️⃣  Verificando branch..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  error "Você não está em 'main'. Branch atual: $CURRENT_BRANCH"
fi
success "Você está em 'main'"

# 2. Verificar se não há mudanças não commitadas
echo ""
echo "2️⃣  Verificando se há mudanças não commitadas..."
if ! git diff-index --quiet HEAD --; then
  error "Há mudanças não commitadas. Faça commit primeiro"
fi
success "Nenhuma mudança não commitada"

# 3. Verificar se está sincronizado com origin
echo ""
echo "3️⃣  Verificando sincronização com origem..."
git fetch origin > /dev/null 2>&1
if [ "$(git rev-list --count main..origin/main)" -gt 0 ]; then
  error "Sua branch 'main' está atrasada. Faça git pull primeiro"
fi
success "Você está sincronizado com origin"

# 4. Verificar integridade do pacote
echo ""
echo "4️⃣  Verificando integridade do pacote npm..."
cd bin
if ! npm pack --dry-run > /tmp/pack_check.txt 2>&1; then
  error "Falha ao criar pacote. Saída: $(cat /tmp/pack_check.txt)"
fi

# Verificar se há arquivos
if grep -q "total files: 0" /tmp/pack_check.txt; then
  error "Nenhum arquivo encontrado no pacote"
fi
success "Pacote npm válido"

# 5. Verificar versão
echo ""
echo "5️⃣  Verificando versão..."
VERSION=$(jq -r '.version' package.json)
echo "   Versão: $VERSION"

# Verificar se version tag existe
if git rev-parse "v$VERSION" > /dev/null 2>&1; then
  error "Tag v$VERSION já existe. Atualize a versão em package.json"
fi
success "Tag v$VERSION não existe (pronta para criar)"

# 6. Verificar CHANGELOG
echo ""
echo "6️⃣  Verificando CHANGELOG..."
cd ..
if ! grep -q "## \[$VERSION\]" CHANGELOG.md; then
  warning "Versão $VERSION não encontrada em CHANGELOG.md"
  echo "   Execute: vim CHANGELOG.md (e adicione a versão)"
else
  success "CHANGELOG atualizado com v$VERSION"
fi

# 7. Resumo
echo ""
echo "=================================="
echo -e "${GREEN}🎉 PRONTO PARA RELEASE!${NC}"
echo "=================================="
echo ""
echo "Próximos passos:"
echo "  1. git tag -a v$VERSION -m 'Release v$VERSION'"
echo "  2. git push origin main --tags"
echo "  3. GitHub Actions publicará automaticamente no npm"
echo ""
echo "Verifique em: https://github.com/isaaceliape/FASE/actions"
