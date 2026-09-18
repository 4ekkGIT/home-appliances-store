const products = [
    {
        id: 1,
        name: "Холодильник Bosch Serie 4",
        category: "Холодильники",
        brand: "Bosch",
        price: 350000,
        available: true,
        image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=700&q=80",
        description: "Современный двухкамерный холодильник для дома.",
        characteristics: [
            ["Объем", "347 л"],
            ["Энергокласс", "A++"],
            ["Система", "No Frost"]
        ]
    },
    {
        id: 2,
        name: "Стиральная машина Samsung",
        category: "Стиральные машины",
        brand: "Samsung",
        price: 220000,
        available: true,
        image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=700&q=80",
        description: "Стиральная машина с удобным управлением и загрузкой 7 кг.",
        characteristics: [
            ["Загрузка", "7 кг"],
            ["Обороты", "1200 об/мин"],
            ["Тип", "Автоматическая"]
        ]
    },
    {
        id: 3,
        name: "Телевизор LG Smart TV",
        category: "Телевизоры",
        brand: "LG",
        price: 280000,
        available: true,
        image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=700&q=80",
        description: "Телевизор с большим экраном и Smart TV.",
        characteristics: [
            ["Диагональ", "55 дюймов"],
            ["Разрешение", "4K"],
            ["Тип экрана", "LED"]
        ]
    },
    {
        id: 4,
        name: "Пылесос Dyson V12",
        category: "Пылесосы",
        brand: "Dyson",
        price: 180000,
        available: true,
        image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=700&q=80",
        description: "Беспроводной пылесос для быстрой уборки дома.",
        characteristics: [
            ["Тип", "Беспроводной"],
            ["Работа", "60 минут"],
            ["Фильтр", "HEPA"]
        ]
    },
    {
        id: 5,
        name: "Кофемашина DeLonghi",
        category: "Кухонная техника",
        brand: "DeLonghi",
        price: 160000,
        available: true,
        image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=700&q=80",
        description: "Автоматическая кофемашина для приготовления кофе.",
        characteristics: [
            ["Тип", "Автоматическая"],
            ["Давление", "15 бар"],
            ["Кофе", "Зерновой"]
        ]
    },
    {
        id: 6,
        name: "Духовой шкаф Bosch",
        category: "Кухонная техника",
        brand: "Bosch",
        price: 250000,
        available: true,
        image: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=700&q=80",
        description: "Встраиваемый духовой шкаф для современной кухни.",
        characteristics: [
            ["Объем", "71 л"],
            ["Режимы", "13"],
            ["Тип", "Встраиваемый"]
        ]
    }
];

const orders = [
    {
        id: 1001,
        customer: "Иван Иванов",
        product: "Холодильник Bosch Serie 4",
        quantity: 1,
        total: 350000,
        status: "Новый"
    },
    {
        id: 1002,
        customer: "Анна Петрова",
        product: "Телевизор LG Smart TV",
        quantity: 1,
        total: 280000,
        status: "В обработке"
    },
    {
        id: 1003,
        customer: "Алексей Смирнов",
        product: "Пылесос Dyson V12",
        quantity: 2,
        total: 360000,
        status: "Выполнен"
    }
];