// Types for meal photo analysis feature (PRO plan)

// Ingrediente individual da refeição
export interface MealIngredient {
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

// Estrutura de análise retornada pelo webhook
export interface MealAnalysis {
    descricao: string;
    calorias_totais_kcal: number;
    macro_nutrientes: {
        proteinas_g: number;
        carboidratos_g: number;
        gorduras_totais_g: number;
    };
    detalhes: {
        fibras_g: number;
        acucares_g: number;
        sodio_mg: number;
        gorduras_saturadas_g: number;
    };
    ingredientes: MealIngredient[];
    aviso_precisao: string;
}

export interface MealPhoto {
    id: string;
    userId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    capturedAt: Date;
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    analysis?: MealAnalysis;
    status: 'uploading' | 'analyzing' | 'completed' | 'error';
    errorMessage?: string;
}

export interface WebhookPayload {
    imageUrl: string;
    userId: string;
    mealPhotoId: string;
    timestamp: string;
}

export interface WebhookResponse {
    descricao: string;
    calorias_totais_kcal: number;
    macro_nutrientes: {
        proteinas_g: number;
        carboidratos_g: number;
        gorduras_totais_g: number;
    };
    detalhes: {
        fibras_g: number;
        acucares_g: number;
        sodio_mg: number;
        gorduras_saturadas_g: number;
    };
    ingredientes: MealIngredient[];
    aviso_precisao: string;
}

export interface DailyNutritionSummary {
    date: string; // YYYY-MM-DD
    totalCalories: number;
    totalMacros: {
        protein: number;
        carbs: number;
        fats: number;
    };
    mealsCount: number;
    meals: MealPhoto[];
}
