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
        image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop&q=60",
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
    },
    {
        id: 7,
        title: "Iogurte com Granola e Frutas",
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=60",
        time: "5 min",
        calories: 210,
        tags: ["Café da Manhã", "Vegetariano", "Fibras"],
        description: "Uma tigela nutritiva e refrescante de iogurte natural com granola caseira.",
        ingredients: [
            "1 pote de iogurte natural desnatado",
            "2 colheres de sopa de granola sem açúcar",
            "1/2 maçã picada",
            "1 fio de mel"
        ],
        instructions: [
            "Coloque o iogurte em uma tigela.",
            "Cubra com a granola e a maçã.",
            "Finalize com o mel e sirva."
        ]
    },
    {
        id: 8,
        title: "Tapioca de Queijo Branco e Tomate",
        image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&auto=format&fit=crop&q=60",
        time: "10 min",
        calories: 300,
        tags: ["Café da Manhã", "Sem Glúten", "Rápido"],
        description: "Tapioca fininha recheada com queijo cottage e temperos frescos.",
        ingredients: [
            "3 colheres de sopa de goma de tapioca",
            "2 colheres de queijo cottage",
            "Tomate picado e orégano"
        ],
        instructions: [
            "Peneire a goma em uma frigideira quente.",
            "Quando firmar, adicione o recheio.",
            "Dobre ao meio e sirva quente."
        ]
    },
    {
        id: 9,
        title: "Espaguete de Abobrinha à Bolonhesa",
        image: "https://images.unsplash.com/photo-1555543788-297587d55375?w=800&auto=format&fit=crop&q=60",
        time: "25 min",
        calories: 380,
        tags: ["Jantar", "Low Carb", "Keto"],
        description: "Substitua a massa tradicional por fios de abobrinha nutritivos.",
        ingredients: [
            "1 abobrinha grande fatiada em fios",
            "150g de carne moída magra",
            "Molho de tomate caseiro",
            "Manjericão fresco"
        ],
        instructions: [
            "Refogue a carne moída com temperos.",
            "Adicione o molho de tomate.",
            "Em outra panela, passe a abobrinha rapidamente no azeite.",
            "Sirva a abobrinha com o molho por cima."
        ]
    },
    {
        id: 10,
        title: "Poke de Salmão Fit",
        image: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=800&auto=format&fit=crop&q=60",
        time: "20 min",
        calories: 420,
        tags: ["Almoço", "Omega 3", "Bowl"],
        description: "Tigela havaiana saudável com cubos de salmão e arroz integral.",
        ingredients: [
            "100g de salmão cru em cubos",
            "1/2 xícara de arroz integral cozido",
            "Pepino, manga e cenoura em cubos",
            "Molho de soja light e gergelim"
        ],
        instructions: [
            "Monte o bowl começando pelo arroz.",
            "Disponha o salmão e os acompanhamentos ao redor.",
            "Regue com o molho e salpique gergelim."
        ]
    },
    {
        id: 11,
        title: " mingau de Aveia Proteico",
        image: "https://images.unsplash.com/photo-1505253304499-02095fe41708?w=800&auto=format&fit=crop&q=60",
        time: "10 min",
        calories: 290,
        tags: ["Café da Manhã", "Pré-treino", "High Protein"],
        description: "Mingau cremoso enriquecido com whey protein ou claras.",
        ingredients: [
            "3 colheres de aveia em flocos",
            "200ml de leite desnatado ou água",
            "1 scoop de whey protein baunilha",
            "Morangos picados para decorar"
        ],
        instructions: [
            "Cozinhe a aveia com o leite até engrossar.",
            "Espere amornar um pouco e misture o whey.",
            "Sirva com os morangos por cima."
        ]
    },
    {
        id: 12,
        title: "Tacos de Alface com Carne",
        image: "https://images.unsplash.com/photo-1624300603348-e8cb7b3c25d8?w=800&auto=format&fit=crop&q=60",
        time: "20 min",
        calories: 340,
        tags: ["Jantar", "Low Carb", "Divertido"],
        description: "Versão leve dos tacos mexicanos usando folhas de alface.",
        ingredients: [
            "Folhas de alface americana lavadas",
            "200g de patinho moído temperado",
            "Vinagrete de tomate e cebola",
            "Abacate em cubos"
        ],
        instructions: [
            "Refogue a carne até ficar bem sequinha.",
            "Use as folhas de alface como 'conchas'.",
            "Recheie com carne, vinagrete e abacate.",
            "Coma com as mãos!"
        ]
    }
];
