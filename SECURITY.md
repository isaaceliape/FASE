# 🔒 Política de Segurança

## Relatar Vulnerabilidades

**NÃO** abra um issue público para reportar vulnerabilidades de segurança. Vulnerabilidades devem ser reportadas em privado.

### Como Reportar

1. **Email**: Abra uma issue privada no GitHub (selecione "Report a security vulnerability")
   - Ou envie para maintainer via GitHub Direct Message

2. **O que incluir:**
   - Descrição da vulnerabilidade
   - Passos para reproduzir (se possível)
   - Impacto potencial
   - Versão(ns) afetada(s)

3. **Tempo de resposta:**
   - Acknowledge: 48 horas
   - Análise: 5-7 dias
   - Fix: Após aprovação do reporter

## 🔐 Informações de Segurança

### Dependências

Este projeto **não tem dependências externas em produção**:

- ✅ Apenas Node.js built-in modules
- ✅ Sem pacotes npm externosa no runtime
- ✅ DevDependencies isoladas do pacote publicado

Verificar:
```bash
npm pack --dry-run
# Não incluirá node_modules
```

### Tokens e Credenciais

- ❌ **Nunca** commit tokens, chaves API, senhas
- ❌ **Nunca** use credenciais em variáveis de ambiente no repo
- ✅ Use GitHub Secrets para CI/CD

Exemplo seguro (`publicar-npm.yml`):
```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}  # ← Variável de ambiente privada
```

### Práticas de Segurança

#### Para Usuários

1. **Sempre use versões oficiais**
   ```bash
   npx fase-ai@latest  # Versão mais recente
   ```

2. **Verifique a fonte**
   - Oficial: `npm install -g fase-ai` → https://npmjs.com/package/fase-ai
   - GitHub: https://github.com/isaaceliape/FASE

3. **Checksums**
   ```bash
   npm view fase-ai@2.4.0  # Verificar integridade
   ```

#### Para Contribuidores

1. **Pre-commit hooks**
   - Todos os commits passam por validação
   - Nenhum pacote quebrado é commited

2. **GitHub Actions**
   - Verificação automática antes de publicar
   - Não publica com erros

3. **Code Review**
   - Todo código é revisado antes de merge
   - Sem push direto para main

### Dependências de Desenvolvimento

**Husky** e **lint-staged** usados apenas para desenvolvimento:
- ✅ Não inclusos no pacote publicado
- ✅ Apenas em `devDependencies`

Verificar no package.json:
```json
"devDependencies": {
  "husky": "^9.0.0",
  "lint-staged": "^15.0.0"
}
```

## 📋 Checklist de Segurança para Releases

Antes de publicar uma nova versão:

- [ ] Rodar `npm audit` para vulnerabilidades conhecidas
- [ ] Verificar `npm pack --dry-run` sem erros
- [ ] Testar instalação em ambiente limpo
- [ ] Revisar commits desde última release
- [ ] Atualizar CHANGELOG.md
- [ ] Criar git tag
- [ ] Verificar logs do GitHub Actions

## 🚨 Resposta a Incidentes

Se houver publicação de versão com vulnerabilidade:

1. **Imediatamente**
   - Deprecar versão: `npm deprecate fase-ai@X.X.X "Mensagem de deprecação"`
   - Fazer hotfix em nova versão

2. **Comunicar**
   - GitHub release com avisos
   - Issue alertando usuários

3. **Post-Mortem**
   - Documentar o que aconteceu
   - Como evitar no futuro
   - Melhorar processos

## 📖 Recursos

- [OWASP - Secure Coding Practices](https://owasp.org/www-community/attacks/Secure_Coding_Practices)
- [npm Security Best Practices](https://docs.npmjs.com/securing-your-packages)
- [GitHub Security](https://docs.github.com/en/code-security)

## Perguntas?

Abra uma issue (pública) com tag `[security]` para perguntas gerais sobre segurança.

---

**Versão**: 1.0
**Última atualização**: 2026-03-13
