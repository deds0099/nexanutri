# Teste do Webhook N8N

## ✅ Status Atual
- **URL do Webhook**: `https://webhook.nexaapp.online/webhook/fe75d6ee-4030-4147-a612-6b2c5f67cb2c`
- **Cloud Function**: `analyzeMeal` com logs detalhados implementados
- **Último Deploy**: Realizado com sucesso

## 🔧 Logs de Debug Implementados

A Cloud Function agora mostra informações detalhadas:
- Status da resposta (200, 404, 500, etc)
- Headers completos da resposta
- Tamanho da resposta em bytes
- Primeiros 500 caracteres da resposta
- Campos JSON recebidos
- Validação de campos esperados

Para ver os logs:
```bash
firebase functions:log --only analyzeMeal
```

## 🧪 Script de Teste

Execute o script de teste para verificar se o webhook está funcionando:

```bash
node test-webhook-n8n.js
```

Este script envia uma imagem de teste diretamente ao webhook e valida a resposta.

---

## ⚠️ Importante sobre o Formato dos Dados

O aplicativo envia a **URL da imagem** em um JSON, não o arquivo binário!

**O que chega no N8N (JSON):**
```json
{
  "imageUrl": "https://firebasestorage.googleapis.com/...",
  "userId": "...",
  "mealPhotoId": "...",
  "timestamp": "..."
}
```

**Mas a Cloud Function faz o download e envia como FormData:**
- `file`: arquivo binário da imagem
- `userId`: ID do usuário
- `mealPhotoId`: ID da foto da refeição
- `timestamp`: timestamp da captura

## 📋 Checklist de Configuração N8N

Para o webhook funcionar corretamente, verifique:

1. **Nó Webhook**:
   - ✅ Method: POST
   - ✅ Path: `/fe75d6ee-4030-4147-a612-6b2c5f67cb2c`
   - ✅ Authentication: None
   - ✅ Mode: **Wait for response** (CRÍTICO!)

2. **Processamento da Imagem**:
   - O arquivo vem em `$binary.file` (não em JSON)
   - Enviar para API de análise (GPT-4 Vision, etc)

3. **Nó "Respond to Webhook"** (OBRIGATÓRIO):
   - Deve estar no final do workflow
   - Respond With: JSON
   - Estrutura esperada:
     ```json
     {
       "descricao": "Descrição da refeição",
       "calorias_totais_kcal": 450,
       "macro_nutrientes": {
         "proteinas_g": 35,
         "carboidratos_g": 45,
         "gorduras_totais_g": 12
       },
       "detalhes": {
         "fibras_g": 6,
         "acucares_g": 2,
         "sodio_mg": 380,
         "gorduras_saturadas_g": 3
       },
       "ingredientes": [
         {
           "name": "Nome",
           "quantity": "100g",
           "calories": 165,
           "protein": 31,
           "carbs": 0,
           "fat": 3.6
         }
       ],
       "aviso_precisao": "Análise estimada ±15%"
     }
     ```

## 🔍 Solução de Problemas

### Problema: Resposta Vazia

**Sintomas:**
```
[PROXY] ❌ Resposta vazia do webhook!
[PROXY] Tamanho da resposta: 0 bytes
```

**Soluções:**
1. Verifique se o workflow N8N está **ativo**
2. Confirme que o nó Webhook está em modo **"Wait for Response"**
3. Certifique-se de ter o nó **"Respond to Webhook"** no final
4. Verifique se não há erros no workflow N8N

### Problema: JSON Inválido

**Sintomas:**
```
[PROXY] Erro ao parsear JSON: Unexpected token...
```

**Soluções:**
1. O nó "Respond to Webhook" deve retornar JSON (não texto)
2. Verifique a estrutura dos dados retornados
3. Use o script `test-webhook-n8n.js` para validar

### Problema: Campos Ausentes

**Sintomas:**
```
[PROXY] ⚠️ Resposta não tem campos esperados
```

**Soluções:**
1. Verifique se o JSON tem `calorias_totais_kcal` e `descricao`
2. Confirme que `macro_nutrientes` existe com os campos de proteínas, carboidratos e gorduras
3. Revise a configuração do nó "Respond to Webhook"

## 📊 Exemplo de Logs de Sucesso

```
[PROXY] Iniciando análise para usuário T8MItccQZXcIED1r2sbmoBKzcPZ2
[PROXY] Baixando imagem de: https://firebasestorage.googleapis.com/...
[PROXY] Enviando para: https://webhook.nexaapp.online/webhook/fe75d6ee-4030-4147-a612-6b2c5f67cb2c
[PROXY] Imagem baixada. Tamanho: 245678 bytes
[PROXY] Response Status: 200
[PROXY] Response OK: true
[PROXY] Tamanho da resposta: 456 bytes
[PROXY] ✅ Resposta JSON parseada com sucesso
[PROXY] Campos recebidos: ['descricao', 'calorias_totais_kcal', 'macro_nutrientes', 'detalhes', 'ingredientes', 'aviso_precisao']
```
