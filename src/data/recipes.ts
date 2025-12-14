export interface Recipe {
    id: number;
    title: string;
    image: string;
    time: string;
    calories: number;
    tags: string[];
    description: string;
    ingredients: string[];
    instructions: string[];
}

export const recipes: Recipe[] = [
    {
        id: 1,
        title: "Omelete de Claras com Espinafre",
        image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop&q=60",
        time: "15 min",
        calories: 220,
        tags: ["High Protein", "Low Carb", "Café da Manhã"],
        description: "Uma opção leve e proteica para começar o dia com energia.",
        ingredients: [
            "3 claras de ovo",
            "1 mão cheia de espinafre fresco",
            "1 colher de chá de azeite",
            "Sal e pimenta a gosto",
            "1 fatia de tomate picado"
        ],
        instructions: [
            "Bata as claras com sal e pimenta.",
            "Aqueça o azeite em uma frigideira antiaderente.",
            "Refogue o espinafre até murchar.",
            "Despeje as claras e cozinhe em fogo médio.",
            "Adicione o tomate, dobre a omelete e sirva."
        ]
    },
    {
        id: 2,
        title: "Salada de Frango Grelhado",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60",
        time: "20 min",
        calories: 350,
        tags: ["Almoço", "Low Fat", "Sem Glúten"],
        description: "Mix de folhas verdes com peito de frango grelhado e molho cítrico.",
        ingredients: [
            "150g de peito de frango",
            "Mix de folhas (alface, rúcula)",
            "1/2 pepino fatiado",
            "Tomates cereja a gosto",
            "Limão e azeite para temperar"
        ],
        instructions: [
            "Tempere o frango com limão, sal e ervas.",
            "Grelhe o frango até ficar dourado e cozido.",
            "Em uma tigela, monte a salada com as folhas e legumes.",
            "Fatie o frango e coloque sobre a salada.",
            "Regue com azeite e sirva."
        ]
    },
    {
        id: 3,
        title: "Smoothie de Frutas Vermelhas",
        image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&auto=format&fit=crop&q=60",
        time: "5 min",
        calories: 180,
        tags: ["Lanche", "Vegano", "Detox"],
        description: "Refrescante e rico em antioxidantes, perfeito para o pré-treino.",
        ingredients: [
            "1 xícara de frutas vermelhas congeladas",
            "200ml de água de coco ou leite vegetal",
            "1 colher de chia",
            "Gelo a gosto"
        ],
        instructions: [
            "Coloque todos os ingredientes no liquidificador.",
            "Bata até obter uma mistura homogênea.",
            "Sirva imediatamente."
        ]
    },
    {
        id: 4,
        title: "Salmão Assado com Aspargos",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?w=800&auto=format&fit=crop&q=60",
        time: "30 min",
        calories: 450,
        tags: ["Jantar", "Omega 3", "Keto"],
        description: "Filé de salmão fresco assado com ervas finas e aspargos crocantes.",
        ingredients: [
            "1 filé de salmão (180g)",
            "6 aspargos frescos",
            "Limão siciliano",
            "Alecrim fresco",
            "Azeite de oliva"
        ],
        instructions: [
            "Pré-aqueça o forno a 200°C.",
            "Tempere o salmão e os aspargos com azeite, sal e limão.",
            "Coloque em uma assadeira e cubra com alecrim.",
            "Asse por 20-25 minutos.",
            "Sirva quente."
        ]
    },
    {
        id: 5,
        title: "Panqueca de Banana Funcional",
        image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&auto=format&fit=crop&q=60",
        time: "15 min",
        calories: 280,
        tags: ["Café da Manhã", "Sem Açúcar", "Fibras"],
        description: "Massa fofinha feita com banana, aveia e canela.",
        ingredients: [
            "1 banana madura",
            "1 ovo",
            "2 colheres de sopa de aveia em flocos finos",
            "Canela em pó a gosto",
            "1 fio de mel (opcional)"
        ],
        instructions: [
            "Amasse bem a banana.",
            "Misture com o ovo, a aveia e a canela.",
            "Aqueça uma frigideira untada com óleo de coco.",
            "Despeje a massa e doure dos dois lados.",
            "Finalize com mel se desejar."
        ]
    },
    {
        id: 6,
        title: "Wrap de Atum com Abacate",
        image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&auto=format&fit=crop&q=60",
        time: "10 min",
        calories: 320,
        tags: ["Lanche", "Rápido", "Integral"],
        description: "Sanduíche natural no pão folha integral com pasta de atum.",
        ingredients: [
            "1 fatia de pão folha integral (rap10 ou similar)",
            "1/2 lata de atum em água",
            "2 colheres de sopa de abacate amassado",
            "Folhas de alface",
            "Cenoura ralada"
        ],
        instructions: [
            "Misture o atum com o abacate para fazer uma pasta.",
            "Espalhe sobre o pão folha.",
            "Adicione a alface e a cenoura.",
            "Enrole bem firme e corte ao meio.",
            "Sirva frio."
        ]
    }
];
