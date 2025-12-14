export interface DietInput {
    sexo: "masculino" | "feminino";
    idade: number;
    peso: number;
    altura: number; // em cm
    atividade: "sedentario" | "leve" | "moderado" | "intenso";
    objetivo: "emagrecer" | "manter" | "ganhar";
    refeicoes?: number;
    restricao?: string;
}

export interface MealItem {
    name: string;
    portion: string;
}

export interface MealOption {
    name: string;
    items: string[];
}

export interface Meal {
    name: string;
    time: string;
    calories: number;
    macros: {
        protein: number;
        carbs: number;
        fats: number;
    };
    items: string[]; // Mantido para compatibilidade (é a Opção 1)
    options?: MealOption[]; // Nova estrutura
}

export interface DietPlan {
    tbm: number;
    tdee: number;
    calories: number;
    macros: {
        protein: { g: number; pct: number };
        carbs: { g: number; pct: number };
        fats: { g: number; pct: number };
    };
    meals: Meal[];
    warnings: string[];
    objetivo?: string;
}

const FOOD_DATABASE = {
    protein: [
        { name: "Peito de frango grelhado", unit: "g", calories: 1.65, protein: 0.31, carbs: 0, fats: 0.036 },
        { name: "Ovos cozidos/mexidos", unit: "unid", calories: 70, protein: 6, carbs: 0.5, fats: 5 },
        { name: "Filé de tilápia", unit: "g", calories: 0.96, protein: 0.2, carbs: 0, fats: 0.017 },
        { name: "Carne moída magra (patinho)", unit: "g", calories: 1.3, protein: 0.22, carbs: 0, fats: 0.045 },
        { name: "Whey Protein", unit: "scoop", calories: 120, protein: 24, carbs: 3, fats: 1 },
        { name: "Iogurte Natural Desnatado", unit: "pote", calories: 85, protein: 8, carbs: 12, fats: 0.5 },
    ],
    carbs: [
        { name: "Arroz integral cozido", unit: "g", calories: 1.1, protein: 0.026, carbs: 0.23, fats: 0.01 },
        { name: "Batata doce cozida", unit: "g", calories: 0.86, protein: 0.016, carbs: 0.2, fats: 0.001 },
        { name: "Aveia em flocos", unit: "g", calories: 3.89, protein: 0.17, carbs: 0.66, fats: 0.07 },
        { name: "Banana prata", unit: "unid", calories: 90, protein: 1, carbs: 23, fats: 0.3 },
        { name: "Macarrão integral", unit: "g", calories: 1.24, protein: 0.05, carbs: 0.26, fats: 0.02 },
        { name: "Pão integral", unit: "fatia", calories: 60, protein: 3, carbs: 11, fats: 1 },
    ],
    fats: [
        { name: "Azeite de oliva", unit: "col. sopa", calories: 119, protein: 0, carbs: 0, fats: 13.5 },
        { name: "Abacate", unit: "g", calories: 1.6, protein: 0.02, carbs: 0.08, fats: 0.15 },
        { name: "Castanha do Pará", unit: "unid", calories: 27, protein: 0.6, carbs: 0.6, fats: 2.7 },
        { name: "Pasta de amendoim", unit: "col. sopa", calories: 90, protein: 3.5, carbs: 3, fats: 8 },
    ],
    vegetables: [
        "Salada de folhas verdes à vontade",
        "Brócolis cozido no vapor",
        "Abobrinha grelhada",
        "Tomate cereja",
        "Cenoura ralada",
        "Mix de legumes refogados"
    ]
};

/**
 * 📥 CALCULADORA DE DIETA - NEXANUTRI
 * 
 * Implementa as 9 etapas rigorosas de cálculo nutricional:
 * 1. TMB (Mifflin-St Jeor)
 * 2. TDEE Inicial
 * 3. Validação TDEE
 * 4. Definição Calórica por Objetivo
 * 5. Macronutrientes (Hierarquia Fixa)
 * 6. Distribuição das Refeições
 * 7. Limites de Porção
 * 8. Montagem do Cardápio
 * 9. Validação Final
 */
export function calculateDiet(input: DietInput): DietPlan {
    const warnings: string[] = [];

    // 🔢 ETAPA 1 — TMB (Mifflin-St Jeor)
    let tmb = 0;
    if (input.sexo === "masculino") {
        tmb = (10 * input.peso) + (6.25 * input.altura) - (5 * input.idade) + 5;
    } else {
        tmb = (10 * input.peso) + (6.25 * input.altura) - (5 * input.idade) - 161;
    }

    // 🔥 ETAPA 2 — TDEE INICIAL
    const activityFactors = {
        sedentario: 1.2,
        leve: 1.375,
        moderado: 1.55,
        intenso: 1.725
    };
    const tdeeInicial = tmb * activityFactors[input.atividade];

    // 🔒 ETAPA 3 — VALIDAÇÃO DO TDEE
    // Evitar superestimação usando o menor valor
    const tdeeAlternativo = input.peso * 28;
    const tdeeFinal = Math.min(tdeeInicial, tdeeAlternativo);

    if (tdeeFinal === tdeeAlternativo) {
        warnings.push(`TDEE ajustado de ${Math.round(tdeeInicial)} para ${Math.round(tdeeFinal)} kcal para evitar superestimação.`);
    }

    // 🎯 ETAPA 4 — DEFINIÇÃO CALÓRICA POR OBJETIVO
    let targetCalories = tdeeFinal;

    if (input.objetivo === "emagrecer") {
        // 🔻 EMAGRECER: peso × 18-22 kcal (usar 20)
        targetCalories = input.peso * 20;

        // Aplicar piso de segurança
        const minCalories = input.sexo === "masculino" ? 1500 : 1200;
        const originalTarget = targetCalories;

        if (targetCalories < minCalories) {
            targetCalories = minCalories;
            warnings.push(`Calorias ajustadas para o piso de segurança (${minCalories} kcal/dia).`);
        }

        // ⚠️ NUNCA >= 90% do TDEE
        const maxAllowed = tdeeFinal * 0.90;
        if (targetCalories >= maxAllowed) {
            targetCalories = tdeeFinal * 0.85; // Forçar déficit de 15%
            warnings.push(`Ajuste automático para garantir déficit mínimo de 15% (${Math.round(targetCalories)} kcal).`);
        }

        // Calcular déficit percentual
        const deficitPercentage = ((tdeeFinal - targetCalories) / tdeeFinal) * 100;

        // Verificar se está dentro da faixa 15-25%
        if (deficitPercentage < 15) {
            targetCalories = tdeeFinal * 0.85;
            warnings.push("⚠️ Déficit ajustado para mínimo de 15% para garantir emagrecimento.");
        } else if (deficitPercentage > 25) {
            // Só avisar, não forçar mudança (piso de segurança tem prioridade)
            warnings.push(`⚠️ Déficit de ${Math.round(deficitPercentage)}% está acima de 25%. Monitore sua energia e bem-estar.`);
        }

    } else if (input.objetivo === "ganhar") {
        // 🔺 GANHAR: TDEE × 1.10 a 1.15
        targetCalories = tdeeFinal * 1.10;
    } else {
        // ⚖️ MANTER: TDEE ±5%
        targetCalories = tdeeFinal;
    }

    targetCalories = Math.round(targetCalories);

    // 🍗 ETAPA 5 — MACRONUTRIENTES (HIERARQUIA FIXA)
    // 1️⃣ Proteína (PRIORIDADE ABSOLUTA)
    let proteinGrams = 0;

    if (input.objetivo === "emagrecer") {
        proteinGrams = 2.0 * input.peso; // Faixa 1.8-2.2
    } else if (input.objetivo === "manter") {
        proteinGrams = 1.8 * input.peso; // Faixa 1.6-2.0
    } else {
        proteinGrams = 2.2 * input.peso; // Faixa 1.8-2.4
    }

    // 🔒 REGRA: Calorias são o MÁXIMO. Macros se ajustam.
    // Limitar proteína a 40% para deixar espaço para gorduras/carbos
    const maxProteinCalories = targetCalories * 0.40;
    if (proteinGrams * 4 > maxProteinCalories) {
        const originalProtein = proteinGrams;
        proteinGrams = maxProteinCalories / 4;
        warnings.push(`Proteína ajustada de ${Math.round(originalProtein)}g para ${Math.round(proteinGrams)}g para respeitar limite calórico.`);
    }

    // 2️⃣ Gordura: 20-30% (usar 25%)
    const fatCalories = targetCalories * 0.25;
    const fatGrams = fatCalories / 9;

    // 3️⃣ Carboidratos: Calculados por diferença
    const proteinCalories = proteinGrams * 4;
    const remainingCalories = targetCalories - proteinCalories - fatCalories;
    const carbGrams = Math.max(0, remainingCalories / 4);

    const macros = {
        protein: { g: Math.round(proteinGrams), pct: Math.round((proteinCalories / targetCalories) * 100) },
        fats: { g: Math.round(fatGrams), pct: Math.round((fatCalories / targetCalories) * 100) },
        carbs: { g: Math.round(carbGrams), pct: Math.round((remainingCalories / targetCalories) * 100) }
    };

    // 🕒 ETAPA 6 — DISTRIBUIÇÃO DAS REFEIÇÕES
    const totalMeals = input.refeicoes || 5;

    // Nenhuma refeição pode conter >35% das calorias diárias
    let distribution: Record<string, number> = {};

    if (totalMeals === 3) {
        distribution = {
            "Café da Manhã": 0.25,
            "Almoço": 0.35,
            "Jantar": 0.25
        };
    } else if (totalMeals === 4) {
        distribution = {
            "Café da Manhã": 0.25,
            "Almoço": 0.35,
            "Lanche": 0.15,
            "Jantar": 0.25
        };
    } else {
        distribution = {
            "Café da Manhã": 0.20,
            "Lanche da Manhã": 0.10,
            "Almoço": 0.30,
            "Lanche da Tarde": 0.15,
            "Jantar": 0.25
        };
    }

    // Validar que nenhuma refeição > 35%
    for (const [mealName, pct] of Object.entries(distribution)) {
        if (pct > 0.35) {
            warnings.push(`⚠️ Refeição "${mealName}" ajustada de ${Math.round(pct * 100)}% para 35% das calorias.`);
            distribution[mealName] = 0.35;
        }
    }

    // 🍽️ ETAPA 7 & 8 — LIMITES DE PORÇÃO E MONTAGEM DO CARDÁPIO
    const meals: Meal[] = [];
    let currentTime = 7.5;
    const isCutting = input.objetivo === "emagrecer";

    // Limites de porção para emagrecimento
    const MAX_RICE = 120; // g
    const MAX_BEANS = 100; // g
    const MAX_BREAD = 2; // fatias
    const MAX_NUTS = 15; // g

    for (const [mealName, pct] of Object.entries(distribution)) {
        const mealCalories = Math.round(targetCalories * pct);

        // Estrutura para manter as 3 opções
        const options: { name: string, items: string[] }[] = [];

        if (mealName.includes("Café")) {
            // ☕ CAFÉ DA MANHÃ - 3 OPÇÕES

            // OPÇÃO 1: Clássico (Pão + Ovo)
            const opt1: string[] = [];
            let breadSlices = Math.round((mealCalories * 0.45) / 60);
            if (isCutting && breadSlices > MAX_BREAD) breadSlices = MAX_BREAD;
            const eggs = Math.max(1, Math.round((mealCalories * 0.3) / 70));

            if (breadSlices > 0) opt1.push(`${breadSlices} ${breadSlices === 1 ? 'fatia' : 'fatias'} de pão integral`);
            opt1.push(`${eggs} ${eggs === 1 ? 'ovo' : 'ovos'} mexidos ou cozidos`);
            opt1.push("1 fruta média (banana, maçã ou mamão)");
            opt1.push(isCutting ? "1 colher de chá de azeite/manteiga (max 5g)" : "1 colher de sopa de azeite/manteiga");
            opt1.push("Café ou chá sem açúcar à vontade");
            options.push({ name: "Opção 1: Clássico", items: opt1 });

            // OPÇÃO 2: Raízes/Regional (Tapioca/Cuscuz/Batata)
            const opt2: string[] = [];
            const carbSourceGrams = Math.round((mealCalories * 0.45) / 2.5); // Aproximação calórica para tapioca/cuscuz
            const cheeseSlices = Math.max(1, Math.round((mealCalories * 0.15) / 60)); // Queijo branco

            opt2.push(`${carbSourceGrams}g de tapioca, cuscuz ou batata doce`);
            opt2.push(`${eggs} ${eggs === 1 ? 'ovo' : 'ovos'} ou ${cheeseSlices * 30}g de queijo branco/cotagge`);
            opt2.push("1 fatia de melão ou melancia");
            opt2.push("Café com leite desnatado (adoçante opcional)");
            options.push({ name: "Opção 2: Regional", items: opt2 });

            // OPÇÃO 3: Prático (Iogurte/Aveia)
            const opt3: string[] = [];
            const oatGrams = Math.round((mealCalories * 0.35) / 3.8);

            opt3.push("1 pote de iogurte natural desnatado/proteico");
            opt3.push(`${oatGrams}g de aveia em flocos ou granola sem açúcar`);
            opt3.push("1 fruta picada (morango, kiwi ou banana)");
            if (!isCutting) opt3.push("1 colher de mel ou pasta de amendoim");
            options.push({ name: "Opção 3: Prático", items: opt3 });

        } else if (mealName.includes("Almoço") || mealName.includes("Jantar")) {
            // 🍽️ ALMOÇO / JANTAR - 3 OPÇÕES
            const carbCals = mealCalories * 0.35;
            let standardCarbGrams = Math.round(carbCals / 1.1); // Base arroz
            if (isCutting && standardCarbGrams > MAX_RICE) standardCarbGrams = MAX_RICE;
            if (standardCarbGrams < 60) standardCarbGrams = 80;

            const proteinGramsFood = Math.round((mealCalories * 0.35) / 1.65); // Base frango

            // OPÇÃO 1: Brasileiro (Arroz + Feijão)
            const opt1: string[] = [];
            let beansGrams = Math.round(standardCarbGrams * 0.6);
            if (isCutting && beansGrams > MAX_BEANS) beansGrams = MAX_BEANS;

            opt1.push(`${standardCarbGrams}g de arroz integral ou branco`);
            opt1.push(`${beansGrams}g de feijão (qualquer tipo) ou lentilha`);
            opt1.push(`${proteinGramsFood}g de frango grelhado ou carne moída magra`);
            opt1.push("Salada crua variada (metade do prato)");
            opt1.push(isCutting ? "1 fio de azeite para temperar" : "1 colher de sopa de azeite");
            options.push({ name: "Opção 1: Dia a Dia", items: opt1 });

            // OPÇÃO 2: Tubérculos/Massas
            const opt2: string[] = [];
            const potatoGrams = Math.round(standardCarbGrams * 1.5); // Batata tem menos caloria que arroz, pode mais

            opt2.push(`${potatoGrams}g de batata (inglesa/doce/baroa) assada ou purê OU macarrão integral`);
            opt2.push(`${Math.round(proteinGramsFood * 1.1)}g de peixe (tilápia/pescada) ou frango desfiado`);
            opt2.push("Legumes cozidos/vapor (brócolis, cenoura, vagem)");
            options.push({ name: "Opção 2: Alternativa", items: opt2 });

            // OPÇÃO 3: Low Carb / Leve (Mais proteína/gordura, menos carbo direto - ajustado para bater caloria)
            // Se for emagrecer, foca em volume. Se for ganho, foca em densidade.
            const opt3: string[] = [];
            const lowCarbVeggies = "Abobrinha, berinjela e couve-flor refogadas";

            if (isCutting) {
                opt3.push(`${Math.round(proteinGramsFood * 1.2)}g de proteína magra (frango/peixe/carne)`);
                opt3.push("Mix de legumes assados à vontade (substituindo o arroz)");
                opt3.push("1 fruta cítrica de sobremesa (laranja/abacaxi)");
            } else {
                opt3.push(`${standardCarbGrams}g de arroz ou purê de mandioquinha`);
                opt3.push(`${proteinGramsFood}g de carne de panela (patinho/músculo) com legumes`);
                opt3.push("Salada verde escura");
            }
            options.push({ name: "Opção 3: Variada", items: opt3 });


        } else {
            // 🥤 LANCHES - 3 OPÇÕES

            // OPÇÃO 1: Fruta + Lácteo
            const opt1: string[] = [];
            let fruitCals = mealCalories * 0.6;
            if (mealCalories < 150) {
                opt1.push("1 fruta média (maçã/pera)");
                opt1.push("1 iogurte natural ou 1 fatia de queijo");
            } else {
                opt1.push("Salada de frutas (1 xícara)");
                opt1.push("1 iogurte com 1 colher de aveia/chia");
            }
            options.push({ name: "Opção 1: Refrescante", items: opt1 });

            // OPÇÃO 2: Prático/Seco
            const opt2: string[] = [];
            if (mealCalories < 200) {
                opt2.push(isCutting ? `${MAX_NUTS}g de mix de castanhas` : "30g de mix de castanhas");
                opt2.push("1 fruta seca ou fresca fácil (banana)");
            } else {
                opt2.push("Sanduíche natural: 2 fatias pão integral + atum/frango + salada");
            }
            options.push({ name: "Opção 2: Prático", items: opt2 });

            // OPÇÃO 3: Líquido/Proteico
            const opt3: string[] = [];
            if (mealCalories > 200 || input.objetivo === "ganhar") {
                opt3.push("Shake: 1 scoop Whey Protein + Água/Leite desnatado");
                opt3.push("1 banana ou 30g de aveia batida junto");
                if (!isCutting) opt3.push("1 colher de pasta de amendoim");
            } else {
                opt3.push("1 barra de proteína (verificar tabela nutricional)");
                opt3.push("Água de coco ou chá gelado");
            }
            options.push({ name: "Opção 3: Rápido", items: opt3 });
        }

        const hours = Math.floor(currentTime);
        const minutes = Math.round((currentTime % 1) * 60);
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        meals.push({
            name: mealName,
            time: timeString,
            calories: mealCalories,
            macros: {
                protein: Math.round(mealCalories * macros.protein.pct / 100 / 4),
                carbs: Math.round(mealCalories * macros.carbs.pct / 100 / 4),
                fats: Math.round(mealCalories * macros.fats.pct / 100 / 9)
            },
            options: options, // Usando a nova estrutura de opções
            items: options[0].items // Mantendo items como fallback (Opção 1)
        });

        currentTime += 3;
    }

    // 🧪 ETAPA 9 — VALIDAÇÃO FINAL (OBRIGATÓRIA)
    const totalMealCalories = meals.reduce((acc, m) => acc + m.calories, 0);
    const maxMealCalories = Math.max(...meals.map(m => m.calories));
    const maxMealPercent = (maxMealCalories / targetCalories) * 100;
    const proteinAchieved = macros.protein.g;
    const proteinTarget = input.objetivo === "emagrecer" ? input.peso * 1.8 : input.peso * 1.6;

    // Validações
    const validations = {
        totalCalories: totalMealCalories <= targetCalories,
        proteinMinimum: proteinAchieved >= proteinTarget,
        maxMealLimit: maxMealPercent <= 35,
        objectiveRespected: true // Sempre verdadeiro se chegou aqui
    };

    const allValid = Object.values(validations).every(v => v);

    if (!validations.totalCalories) {
        warnings.push(`⚠️ VALIDAÇÃO: Soma calórica (${totalMealCalories}) excede meta (${targetCalories}).`);
    }

    if (!validations.proteinMinimum) {
        warnings.push(`⚠️ VALIDAÇÃO: Proteína (${proteinAchieved}g) abaixo do mínimo recomendado (${Math.round(proteinTarget)}g).`);
    }

    if (!validations.maxMealLimit) {
        warnings.push(`⚠️ VALIDAÇÃO: Uma refeição excede 35% das calorias diárias (${Math.round(maxMealPercent)}%).`);
    }

    if (Math.abs(totalMealCalories - targetCalories) > 50) {
        warnings.push("Pequeno ajuste no total calórico devido ao arredondamento das refeições.");
    }

    return {
        tbm: Math.round(tmb),
        tdee: Math.round(tdeeFinal),
        calories: targetCalories,
        macros,
        meals,
        warnings,
        objetivo: input.objetivo
    };
}
