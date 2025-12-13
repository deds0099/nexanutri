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

export interface Meal {
    name: string;
    time: string;
    calories: number;
    macros: {
        protein: number;
        carbs: number;
        fats: number;
    };
    items: string[];
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
}

const FOOD_DATABASE = {
    protein: [
        { name: "Peito de via grelhado", unit: "g", calories: 1.65, protein: 0.31, carbs: 0, fats: 0.036 },
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

export function calculateDiet(input: DietInput): DietPlan {
    // ETAPA 1: Cálculo da TMB (Mifflin-St Jeor)
    let tmb = 0;
    if (input.sexo === "masculino") {
        tmb = (10 * input.peso) + (6.25 * input.altura) - (5 * input.idade) + 5;
    } else {
        tmb = (10 * input.peso) + (6.25 * input.altura) - (5 * input.idade) - 161;
    }

    // ETAPA 2: Gasto Calórico Total (TDEE)
    const activityFactors = {
        sedentario: 1.2,
        leve: 1.375,
        moderado: 1.55,
        intenso: 1.725
    };
    const tdee = tmb * activityFactors[input.atividade];

    // ETAPA 3: Ajuste Calórico por Objetivo
    let targetCalories = tdee;
    const warnings: string[] = [];

    if (input.objetivo === "emagrecer") {
        // Déficit entre 15% e 25% (usando 20% como média segura)
        targetCalories = tdee * 0.80;

        // Limites de segurança
        const minCalories = input.sexo === "masculino" ? 1500 : 1200;
        if (targetCalories < minCalories) {
            targetCalories = minCalories;
            warnings.push(`Ajustamos as calorias para o mínimo de segurança (${minCalories} kcal).`);
        }
    } else if (input.objetivo === "ganhar") {
        // Superávit entre 10% e 20% (usando 15% como média)
        targetCalories = tdee * 1.15;
    } else {
        // Manutenção
        targetCalories = tdee;
    }

    targetCalories = Math.round(targetCalories);

    // ETAPA 4: Distribuição de Macronutrientes
    let proteinGrams = 0;

    if (input.objetivo === "emagrecer") {
        proteinGrams = 2.0 * input.peso; // Faixa 1.8-2.2
    } else if (input.objetivo === "manter") {
        proteinGrams = 1.8 * input.peso; // Faixa 1.6-2.0
    } else {
        proteinGrams = 2.2 * input.peso; // Faixa 1.8-2.4
    }

    // Gorduras: 25% do total calórico (Faixa 20-30%)
    const fatCalories = targetCalories * 0.25;
    const fatGrams = fatCalories / 9;

    // Carboidratos: O que sobrar
    const proteinCalories = proteinGrams * 4;
    const remainingCalories = targetCalories - proteinCalories - fatCalories;
    const carbGrams = remainingCalories / 4;

    const macros = {
        protein: { g: Math.round(proteinGrams), pct: Math.round((proteinCalories / targetCalories) * 100) },
        fats: { g: Math.round(fatGrams), pct: Math.round((fatCalories / targetCalories) * 100) },
        carbs: { g: Math.round(carbGrams), pct: Math.round((remainingCalories / targetCalories) * 100) }
    };

    // ETAPA 5: Distribuição das Refeições
    const totalMeals = input.refeicoes || 5;
    const meals: Meal[] = [];

    // Definição aproximada de distribuição baseada no número de refeições
    let distribution: Record<string, number> = {};

    if (totalMeals === 3) {
        distribution = { "Café da Manhã": 0.30, "Almoço": 0.40, "Jantar": 0.30 };
    } else if (totalMeals === 4) {
        distribution = { "Café da Manhã": 0.25, "Almoço": 0.35, "Lanche": 0.15, "Jantar": 0.25 };
    } else {
        // 5 ou mais (padrão 5)
        distribution = {
            "Café da Manhã": 0.20,
            "Lanche da Manhã": 0.10,
            "Almoço": 0.35,
            "Lanche da Tarde": 0.15,
            "Jantar": 0.20
        };
    }

    // ETAPA 6: Montagem do Cardápio (Algoritmo Simplificado)
    let currentTime = 7.5; // 7:30

    for (const [mealName, pct] of Object.entries(distribution)) {
        const mealCalories = Math.round(targetCalories * pct);
        const mealItems: string[] = [];

        // Seleção simples baseada no tipo de refeição
        if (mealName.includes("Café")) {
            const carbs = Math.round((mealCalories * 0.4) / 60); // Pão (aprox. 60kcal/fatia)
            const protein = Math.round((mealCalories * 0.3) / 70); // Ovos (aprox. 70kcal/unid)
            const fruit = 1;

            if (carbs > 0) mealItems.push(`${carbs} fatias de pão integral`);
            if (protein > 0) mealItems.push(`${protein} ovos mexidos`);
            mealItems.push(`${fruit} fatia de mamão ou fruta média`);
            mealItems.push("Café sem açúcar");
        }
        else if (mealName.includes("Almoço") || mealName.includes("Jantar")) {
            // Regra de 3 para calcular gramas aproximados
            // Arroz (1.1 kcal/g), Feijão (caldo + grão ~ 0.7 kcal/g - simplificado na db n tem, mas vamos usar arroz como base carbo)
            // Proteína (1.65 kcal/g frango)

            const carbCals = mealCalories * 0.4;
            const protCals = mealCalories * 0.3;
            const fatCals = mealCalories * 0.1; // Resto vem dos alimentos

            const riceGrams = Math.round(carbCals / 1.1);
            const proteinGramsFood = Math.round(protCals / 1.65); // Frango base
            const beansGrams = Math.round(riceGrams / 2); // Metade do arroz em feijão

            mealItems.push(`${riceGrams}g de arroz integral (ou batata/macarrão)`);
            mealItems.push(`${beansGrams}g de feijão`);
            mealItems.push(`${proteinGramsFood}g de frango grelhado ou peixe`);
            mealItems.push("Salada de folhas verdes à vontade");
            mealItems.push("1 col. sopa de azeite de oliva");
        }
        else {
            // Lanches
            mealItems.push("1 iogurte natural ou fruta");
            mealItems.push("15g de oleaginosas (castanhas)");
            if (mealCalories > 200) mealItems.push("1 scoop de Whey Protein");
        }

        const timeString = `${Math.floor(currentTime).toString().padStart(2, '0')}:${(currentTime % 1 * 60).toString().padStart(2, '0')}`;

        meals.push({
            name: mealName,
            time: timeString,
            calories: mealCalories,
            macros: {
                protein: Math.round(mealCalories * (macros.protein.pct / 100) / 4),
                carbs: Math.round(mealCalories * (macros.carbs.pct / 100) / 4),
                fats: Math.round(mealCalories * (macros.fats.pct / 100) / 9)
            },
            items: mealItems
        });

        currentTime += 3; // +3 horas aprox
    }

    // ETAPA 7: Validação Final (Ajuste fino visual na UI)

    return {
        tbm: Math.round(tmb),
        tdee: Math.round(tdee),
        calories: targetCalories,
        macros,
        meals,
        warnings
    };
}
