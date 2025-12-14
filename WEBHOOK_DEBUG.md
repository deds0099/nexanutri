# Teste do Webhook N8N

## URL do Webhook
https://webhook.nexaapp.online/webhook/nexaapp

## Problema Identificado

O webhook está:
- ✅ Recebendo a requisição (Status 200)
- ❌ Retornando resposta vazia (body vazio)

## Payload Enviado

```json
{
  "imageUrl": "https://firebasestorage.googleapis.com/v0/b/nexanutri.firebasestorage.app/o/meal-photos%2FT8MItccQZXcIED1r2sbmoBKzcPZ2%2Fmeal_1765682614411%2Fimage.jpg?alt=media&token=24c68237-fc1f-4a92-b7ec-7b1c545f0b3e",
  "userId": "T8MItccQZXcIED1r2sbmoBKzcPZ2",
  "mealPhotoId": "5wehPApo3pAuBtE7FZ31",
  "timestamp": "2025-12-14T03:23:36.930Z"
}
```

## Resposta Esperada

```json
{
  "descricao": "string",
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
      "name": "Frango",
      "quantity": "150g",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6
    }
  ],
  "aviso_precisao": "Análise estimada ±15%"
}
```

## Ação Necessária

Verifique no n8n se:
1. O workflow está ativo
2. O nó de "Respond to Webhook" está configurado
3. O nó está retornando os dados no formato JSON correto
4. Não há erros no workflow

## Teste Manual

Você pode testar o webhook manualmente com curl:

```bash
curl -X POST https://webhook.nexaapp.online/webhook/nexaapp \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "userId": "test123",
    "mealPhotoId": "test_meal",
    "timestamp": "2025-12-14T00:00:00.000Z"
  }'
```

Se retornar vazio, o problema está no n8n.
