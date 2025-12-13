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

    // STRICT RULE: Calorie Limits for Emagrecimento
    if (input.objetivo === "emagrecer") {
        // Minimum deficit 15%, Max deficit 25%.
        // Safe starting point: 20% deficit
        targetCalories = tdee * 0.80;

        // REGRAS DE BLOQUEIO DE ERRO CALÓRICO
        // 1. Never >= 90% TDEE
        if (targetCalories >= tdee * 0.90) {
            targetCalories = tdee * 0.85; // Reset to 15% deficit mandatory
            warnings.push("Ajuste automático para garantir déficit calórico mínimo de 15%.");
        }

        // 2. Safety Floors
        const minCalories = input.sexo === "masculino" ? 1500 : 1200;
        if (targetCalories < minCalories) {
            targetCalories = minCalories;

            // Check if min calories violates the < 90% TDEE rule? 
            // If TDEE is very low (e.g. small sedentary woman), min 1200 might be > 90% TDEE.
            // In that extreme case, safety floor usually wins in medical contexts, 
            // but the prompt implies strict strictness. 
            // However, 1200 is widely regarded as absolute floor. We stick to floor but warn.

            if (targetCalories >= tdee * 0.90) {
                warnings.push(`Cuidado: Calorias (${Math.round(targetCalories)}) próximas ao seu gasto total devido ao limite mínimo de segurança.`);
            } else {
                warnings.push(`Ajustamos as calorias para o mínimo de segurança (${minCalories} kcal).`);
            }
        }
    } else if (input.objetivo === "ganhar") {
        targetCalories = tdee * 1.15;
    } else {
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

    // Priority Rule: Calories is MAX. Macros adjust.
    // Ensure protein doesn't eat entire budget.
    const maxProteinCalories = targetCalories * 0.40; // Cap protein at 40% to leave room for fats/carbs
    if (proteinGrams * 4 > maxProteinCalories) {
        proteinGrams = maxProteinCalories / 4;
    }

    // Gorduras: 25% do total calórico
    const fatCalories = targetCalories * 0.25;
    const fatGrams = fatCalories / 9;

    // Carboidratos: O que sobrar
    const proteinCalories = proteinGrams * 4;
    const remainingCalories = targetCalories - proteinCalories - fatCalories;
    const carbGrams = Math.max(0, remainingCalories / 4);

    const macros = {
        protein: { g: Math.round(proteinGrams), pct: Math.round((proteinCalories / targetCalories) * 100) },
        fats: { g: Math.round(fatGrams), pct: Math.round((fatCalories / targetCalories) * 100) },
        carbs: { g: Math.round(carbGrams), pct: Math.round((remainingCalories / targetCalories) * 100) }
    };

    // ETAPA 5: Distribuição das Refeições
    const totalMeals = input.refeicoes || 5;

    // Distribution percentages
    let distribution: Record<string, number> = {};
    if (totalMeals === 3) {
        distribution = { "Café da Manhã": 0.30, "Almoço": 0.40, "Jantar": 0.30 };
    } else if (totalMeals === 4) {
        distribution = { "Café da Manhã": 0.25, "Almoço": 0.35, "Lanche": 0.15, "Jantar": 0.25 };
    } else {
        distribution = {
            "Café da Manhã": 0.20,
            "Lanche da Manhã": 0.10,
            "Almoço": 0.35,
            "Lanche da Tarde": 0.15,
            "Jantar": 0.20
        };
    }

    // ETAPA 6: Montagem do Cardápio (Com Regras de Porção)
    const meals: Meal[] = [];
    let currentTime = 7.5;

    for (const [mealName, pct] of Object.entries(distribution)) {
        const mealCalories = Math.round(targetCalories * pct);
        const mealItems: string[] = [];

        // Porção caps (apenas para emagrecimento)
        const isCutting = input.objetivo === "emagrecer";

        // Limits
        const MAX_RICE = 120; // g
        const MAX_BREAD = 2; // fatias
        const MAX_OIL = 1; // colher de chá (approx 5g fat?) No, 1 tsp oil is ~5g fat. User said "1 colher de chá".

        if (mealName.includes("Café")) {
            // Logic for breakfast
            let carbsPortion = Math.round((mealCalories * 0.45) / 60); // Break in slices (60kcal/slice)

            if (isCutting && carbsPortion > MAX_BREAD) carbsPortion = MAX_BREAD;

            const proteinUnits = Math.round((mealCalories * 0.3) / 70); // Eggs

            if (carbsPortion > 0) mealItems.push(`${carbsPortion} fatias de pão integral`);

            // If we capped bread, maybe add fruit?
            mealItems.push(`1 fruta média ou fatia de mamão`);

            if (proteinUnits > 0) mealItems.push(`${Math.max(1, proteinUnits)} ovos mexidos`);
            else mealItems.push(`1 ovo mexido`); // Min 1

            mealItems.push("Café ou chá sem açúcar");

        } else if (mealName.includes("Almoço") || mealName.includes("Jantar")) {
            // Lunch/Dinner logic
            const carbCals = mealCalories * 0.35; // Slightly lower carb for meals
            // Rice: 1.1 kcal/g approximately (cooked)
            let riceGrams = Math.round(carbCals / 1.1);

            // Apply Cap
            if (isCutting && riceGrams > MAX_RICE) {
                riceGrams = MAX_RICE;
                // Calories lost from carb cap are simply "saved" (deficit) or shifted to veg volume effectively
            }
            if (riceGrams < 50) riceGrams = 80; // Minimum sensible portion

            // Protein: 1.65 kcal/g (chicken breast)
            const proteinGramsFood = Math.round((mealCalories * 0.35) / 1.65);

            // Beans: half of rice usually
            const beansGrams = Math.round(riceGrams / 2);

            mealItems.push(`${riceGrams}g de arroz integral (ou batata/macarrão)`);
            mealItems.push(`${beansGrams}g de feijão`);
            mealItems.push(`${proteinGramsFood}g de frango grelhado/peixe ou carne magra`);

            // Oil Cap
            if (isCutting) {
                mealItems.push("1 colher de chá de azeite de oliva (max)");
            } else {
                mealItems.push("1 col. sopa de azeite de oliva");
            }

            mealItems.push("Salada de folhas verdes à vontade");
            mealItems.push("Legumes cozidos (brócolis/cenoura) à vontade");

        } else {
            // Snacks
            if (mealCalories < 150) {
                mealItems.push("1 fruta média");
                mealItems.push("1 iogurte natural");
            } else {
                mealItems.push("1 iogurte natural com 15g de aveia");
                mealItems.push("1 fruta média");
                if (mealCalories > 300) mealItems.push("1 scoop de Whey Protein");
            }
        }

        const timeString = `${Math.floor(currentTime).toString().padStart(2, '0')}:${(currentTime % 1 * 60).toString().padStart(2, '0')}`;

        meals.push({
            name: mealName,
            time: timeString,
            calories: mealCalories,
            macros: {
                // Estimation for UI
                protein: Math.round(mealCalories * macros.protein.pct / 100 / 4),
                carbs: Math.round(mealCalories * macros.carbs.pct / 100 / 4),
                fats: Math.round(mealCalories * macros.fats.pct / 100 / 9)
            },
            items: mealItems
        });

        currentTime += 3;
    }

    // ETAPA 7: Validação Final
    const totalMealCalories = meals.reduce((acc, m) => acc + m.calories, 0);

    // Sanity check for sum (allow small rounding diff)
    // In our logic mealCalories is derived from targetCalories * pct, so sum should match targetCalories exactly or off by 1-2.

    if (Math.abs(totalMealCalories - targetCalories) > 50) {
        warnings.push("Nota: Pequeno ajuste no total calórico devido ao arredondamento das refeições.");
    }

    return {
        tbm: Math.round(tmb),
        tdee: Math.round(tdee),
        calories: targetCalories,
        macros,
        meals,
        warnings
    };
}
