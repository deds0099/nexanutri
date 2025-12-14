# Configurar CORS no Firebase Storage

## Passo 1: Instalar Google Cloud SDK

Se ainda não tiver, instale o Google Cloud SDK:
https://cloud.google.com/sdk/docs/install

## Passo 2: Fazer login

```bash
gcloud auth login
```

## Passo 3: Aplicar configuração CORS

```bash
gsutil cors set cors.json gs://nexanutri.appspot.com
```

## Passo 4: Verificar se foi aplicado

```bash
gsutil cors get gs://nexanutri.appspot.com
```

---

## Alternativa: Usar Firebase Console

1. Acesse: https://console.firebase.google.com/project/nexanutri/storage
2. Vá em "Rules" (Regras)
3. Substitua as regras por:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Publique as regras

---

## Se o problema persistir

O bucket correto é: `nexanutri.appspot.com`

Aguarde alguns minutos após aplicar as configurações CORS.
