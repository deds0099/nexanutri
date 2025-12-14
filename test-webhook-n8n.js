// Script para testar o webhook N8N diretamente
// Uso: node test-webhook-n8n.js
// Requer Node.js 18+ (fetch API nativa)

const WEBHOOK_URL = 'https://webhook.nexaapp.online/webhook/fe75d6ee-4030-4147-a612-6b2c5f67cb2c';

async function testWebhook() {
    console.log('🔍 Testando webhook N8N...');
    console.log(`📡 URL: ${WEBHOOK_URL}\n`);

    try {
        // Criar uma imagem de teste simples (1x1 pixel PNG)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        const testImageBuffer = Buffer.from(testImageBase64, 'base64');

        // Criar FormData manualmente
        const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

        const formDataParts = [];

        // Adicionar arquivo
        formDataParts.push(`--${boundary}\r\n`);
        formDataParts.push(`Content-Disposition: form-data; name="file"; filename="test-image.jpg"\r\n`);
        formDataParts.push(`Content-Type: image/jpeg\r\n\r\n`);
        formDataParts.push(testImageBuffer);
        formDataParts.push(`\r\n`);

        // Adicionar userId
        formDataParts.push(`--${boundary}\r\n`);
        formDataParts.push(`Content-Disposition: form-data; name="userId"\r\n\r\n`);
        formDataParts.push(`test-user-123\r\n`);

        // Adicionar mealPhotoId
        formDataParts.push(`--${boundary}\r\n`);
        formDataParts.push(`Content-Disposition: form-data; name="mealPhotoId"\r\n\r\n`);
        formDataParts.push(`test-meal-456\r\n`);

        // Adicionar timestamp
        formDataParts.push(`--${boundary}\r\n`);
        formDataParts.push(`Content-Disposition: form-data; name="timestamp"\r\n\r\n`);
        formDataParts.push(`${new Date().toISOString()}\r\n`);

        // Finalizar
        formDataParts.push(`--${boundary}--\r\n`);

        // Converter para Buffer
        const formDataBuffer = Buffer.concat(
            formDataParts.map(part =>
                typeof part === 'string' ? Buffer.from(part, 'utf-8') : part
            )
        );

        console.log('📤 Enviando requisição...');
        console.log('   - Método: POST');
        console.log('   - Content-Type: multipart/form-data');
        console.log('   - Arquivo: test-image.jpg (1x1px PNG)');
        console.log('   - userId: test-user-123');
        console.log('   - mealPhotoId: test-meal-456\n');

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formDataBuffer,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': formDataBuffer.length.toString()
            }
        });

        console.log(`📨 Resposta recebida:`);
        console.log(`   - Status: ${response.status} ${response.statusText}`);
        console.log(`   - OK: ${response.ok}`);

        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });
        console.log(`   - Headers:`, headers);

        const responseText = await response.text();
        console.log(`\n📄 Body da resposta (${responseText.length} bytes):`);
        console.log(responseText.substring(0, 500));
        if (responseText.length > 500) {
            console.log(`... (truncado, total: ${responseText.length} bytes)`);
        }

        if (responseText && responseText.trim() !== '') {
            try {
                const json = JSON.parse(responseText);
                console.log('\n✅ JSON parseado com sucesso:');
                console.log(JSON.stringify(json, null, 2));

                // Validar estrutura esperada
                console.log('\n🔍 Validação da estrutura:');
                const requiredFields = [
                    'calorias_totais_kcal',
                    'macro_nutrientes',
                    'descricao'
                ];

                let allFieldsPresent = true;
                requiredFields.forEach(field => {
                    if (json[field] !== undefined) {
                        console.log(`   ✅ ${field}: presente`);
                    } else {
                        console.log(`   ❌ ${field}: AUSENTE`);
                        allFieldsPresent = false;
                    }
                });

                if (json.macro_nutrientes) {
                    const macroFields = ['proteinas_g', 'carboidratos_g', 'gorduras_totais_g'];
                    macroFields.forEach(field => {
                        if (json.macro_nutrientes[field] !== undefined) {
                            console.log(`   ✅ macro_nutrientes.${field}: ${json.macro_nutrientes[field]}`);
                        } else {
                            console.log(`   ❌ macro_nutrientes.${field}: AUSENTE`);
                            allFieldsPresent = false;
                        }
                    });
                }

                if (allFieldsPresent) {
                    console.log('\n🎉 SUCESSO! O webhook está retornando todos os campos esperados!');
                } else {
                    console.log('\n⚠️ ATENÇÃO: Alguns campos esperados estão ausentes. Verifique a configuração do N8N.');
                }

            } catch (e) {
                console.error('\n❌ Erro ao parsear JSON:', e.message);
                console.error('A resposta não é um JSON válido!');
                console.error('\nVerifique no N8N:');
                console.error('1. O nó "Respond to Webhook" está retornando JSON (não texto)?');
                console.error('2. A estrutura dos dados está correta?');
            }
        } else {
            console.error('\n❌ RESPOSTA VAZIA!');
            console.error('O webhook não está retornando dados.');
            console.error('\n🔧 Verifique no N8N:');
            console.error('1. Workflow está ATIVO?');
            console.error('2. Nó Webhook está em modo "Wait for Response"?');
            console.error('3. Tem um nó "Respond to Webhook" no final?');
            console.error('4. O nó está retornando JSON com os dados corretos?');
            console.error('\n💡 Dica: Verifique os logs de execução no N8N para ver se há erros.');
        }

    } catch (error) {
        console.error('\n❌ Erro ao testar webhook:', error.message);
        if (error.cause) {
            console.error('Causa:', error.cause);
        }
        console.error('\n🔧 Possíveis causas:');
        console.error('1. URL do webhook incorreta');
        console.error('2. Workflow N8N não ativo ou em erro');
        console.error('3. Problema de rede/firewall');
    }
}

testWebhook();
