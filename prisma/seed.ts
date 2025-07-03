import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@receitapro.com' },
      update: {},
      create: {
        email: 'admin@receitapro.com',
        name: 'Administrador',
        role: 'ADMIN'
      }
    }),
    prisma.user.upsert({
      where: { email: 'editor@receitapro.com' },
      update: {},
      create: {
        email: 'editor@receitapro.com',
        name: 'Editor',
        role: 'EDITOR'
      }
    }),
    prisma.user.upsert({
      where: { email: 'viewer@receitapro.com' },
      update: {},
      create: {
        email: 'viewer@receitapro.com',
        name: 'Visualizador',
        role: 'VIEWER'
      }
    })
  ])

  console.log('✅ Created users')

  const units = await Promise.all([
    prisma.measurementUnit.create({
      data: {
        name: 'Quilograma',
        abbreviation: 'kg',
        type: 'Peso',
        baseUnit: 'g',
        conversionFactor: 1000,
        userId: users[0].id
      }
    }),
    prisma.measurementUnit.create({
      data: {
        name: 'Grama',
        abbreviation: 'g',
        type: 'Peso',
        baseUnit: 'g',
        conversionFactor: 1,
        userId: users[0].id
      }
    }),
    prisma.measurementUnit.create({
      data: {
        name: 'Litro',
        abbreviation: 'L',
        type: 'Volume',
        baseUnit: 'ml',
        conversionFactor: 1000,
        userId: users[0].id
      }
    }),
    prisma.measurementUnit.create({
      data: {
        name: 'Mililitro',
        abbreviation: 'ml',
        type: 'Volume',
        baseUnit: 'ml',
        conversionFactor: 1,
        userId: users[0].id
      }
    }),
    prisma.measurementUnit.create({
      data: {
        name: 'Unidade',
        abbreviation: 'un',
        type: 'Unidade',
        conversionFactor: 1,
        userId: users[0].id
      }
    })
  ])

  console.log('✅ Created measurement units')

  const recipeCategories = await Promise.all([
    prisma.recipeCategory.create({
      data: {
        name: 'Pães',
        description: 'Pães tradicionais e especiais',
        userId: users[0].id
      }
    }),
    prisma.recipeCategory.create({
      data: {
        name: 'Bolos',
        description: 'Bolos doces e salgados',
        userId: users[0].id
      }
    }),
    prisma.recipeCategory.create({
      data: {
        name: 'Doces',
        description: 'Doces e sobremesas',
        userId: users[0].id
      }
    })
  ])

  const ingredientCategories = await Promise.all([
    prisma.ingredientCategory.create({
      data: {
        name: 'Farinhas',
        description: 'Farinhas de trigo, milho, etc.',
        userId: users[0].id
      }
    }),
    prisma.ingredientCategory.create({
      data: {
        name: 'Gorduras',
        description: 'Óleos, manteigas, margarinas',
        userId: users[0].id
      }
    }),
    prisma.ingredientCategory.create({
      data: {
        name: 'Fermentos',
        description: 'Fermentos biológicos e químicos',
        userId: users[0].id
      }
    }),
    prisma.ingredientCategory.create({
      data: {
        name: 'Açúcares',
        description: 'Açúcar cristal, refinado, mel',
        userId: users[0].id
      }
    }),
    prisma.ingredientCategory.create({
      data: {
        name: 'Laticínios',
        description: 'Leite, queijos, iogurtes',
        userId: users[0].id
      }
    })
  ])

  console.log('✅ Created categories')

  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Moinho São Paulo',
        contact: 'João Silva',
        phone: '(11) 3456-7890',
        email: 'vendas@moinhosp.com.br',
        userId: users[0].id
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Usina Central',
        contact: 'Maria Santos',
        phone: '(11) 2345-6789',
        email: 'comercial@usinacentral.com.br',
        userId: users[0].id
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'Laticínios Bela Vista',
        contact: 'Carlos Oliveira',
        phone: '(11) 4567-8901',
        email: 'pedidos@belavista.com.br',
        userId: users[0].id
      }
    })
  ])

  console.log('✅ Created suppliers')

  const salesChannels = await Promise.all([
    prisma.salesChannel.create({
      data: {
        name: 'Varejo',
        description: 'Vendas diretas ao consumidor final',
        userId: users[0].id
      }
    }),
    prisma.salesChannel.create({
      data: {
        name: 'Atacado',
        description: 'Vendas para revendedores',
        userId: users[0].id
      }
    }),
    prisma.salesChannel.create({
      data: {
        name: 'Delivery',
        description: 'Entregas via aplicativos',
        userId: users[0].id
      }
    })
  ])

  console.log('✅ Created sales channels')


  const ingredients = await Promise.all([
    prisma.ingredient.create({
      data: {
        name: 'Farinha de Trigo Especial',
        categoryId: ingredientCategories[0].id,
        unitId: units[0].id,
        pricePerUnit: 4.50,
        supplierId: suppliers[0].id,
        userId: users[0].id,
        ingredientType: 'Farinha',
        storageCondition: 'Ambiente_Seco',
        currentStock: 25000,
        minimumStock: 5000
      }
    }),
    prisma.ingredient.create({
      data: {
        name: 'Açúcar Cristal',
        categoryId: ingredientCategories[3].id,
        unitId: units[0].id,
        pricePerUnit: 3.20,
        supplierId: suppliers[1].id,
        userId: users[0].id,
        ingredientType: 'Açúcares',
        storageCondition: 'Ambiente_Seco',
        currentStock: 15000,
        minimumStock: 3000
      }
    }),
    prisma.ingredient.create({
      data: {
        name: 'Manteiga sem Sal',
        categoryId: ingredientCategories[1].id,
        unitId: units[0].id,
        pricePerUnit: 12.80,
        supplierId: suppliers[2].id,
        userId: users[0].id,
        ingredientType: 'Gorduras',
        storageCondition: 'Refrigerado',
        currentStock: 8000,
        minimumStock: 1000
      }
    }),
    prisma.ingredient.create({
      data: {
        name: 'Fermento Biológico Seco',
        categoryId: ingredientCategories[2].id,
        unitId: units[1].id,
        pricePerUnit: 0.08,
        userId: users[0].id,
        ingredientType: 'Fermentos',
        storageCondition: 'Ambiente_Seco',
        currentStock: 2000,
        minimumStock: 500
      }
    }),
    prisma.ingredient.create({
      data: {
        name: 'Leite Integral',
        categoryId: ingredientCategories[4].id,
        unitId: units[2].id,
        pricePerUnit: 4.20,
        supplierId: suppliers[2].id,
        userId: users[0].id,
        ingredientType: 'Derivados',
        storageCondition: 'Refrigerado',
        currentStock: 12000,
        minimumStock: 2000
      }
    })
  ])

  console.log('✅ Created ingredients')

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Pão Francês',
        categoryId: recipeCategories[0].id,
        userId: users[0].id,
        averageWeight: 50,
        description: 'Pão francês tradicional'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Bolo de Chocolate Premium',
        categoryId: recipeCategories[1].id,
        userId: users[0].id,
        averageWeight: 1200,
        description: 'Bolo de chocolate com cobertura especial'
      }
    })
  ])

  console.log('✅ Created products')

  await Promise.all([
    prisma.productPrice.upsert({
      where: { 
        productId_channelId_userId: {
          productId: products[0].id,
          channelId: salesChannels[0].id,
          userId: users[0].id
        }
      },
      update: {},
      create: {
        productId: products[0].id,
        channelId: salesChannels[0].id,
        userId: users[0].id,
        price: 0.50,
        profitMargin: 60
      }
    }),
    prisma.productPrice.upsert({
      where: { 
        productId_channelId_userId: {
          productId: products[0].id,
          channelId: salesChannels[1].id,
          userId: users[0].id
        }
      },
      update: {},
      create: {
        productId: products[0].id,
        channelId: salesChannels[1].id,
        userId: users[0].id,
        price: 0.35,
        profitMargin: 40
      }
    }),
    prisma.productPrice.upsert({
      where: { 
        productId_channelId_userId: {
          productId: products[1].id,
          channelId: salesChannels[0].id,
          userId: users[0].id
        }
      },
      update: {},
      create: {
        productId: products[1].id,
        channelId: salesChannels[0].id,
        userId: users[0].id,
        price: 25.00,
        profitMargin: 65
      }
    })
  ])

  console.log('✅ Created product prices')

  const recipes = await Promise.all([
    prisma.recipe.create({
      data: {
        name: 'Pão Francês Tradicional',
        description: 'Receita clássica de pão francês com fermentação natural',
        categoryId: recipeCategories[0].id,
        productId: products[0].id,
        userId: users[0].id,
        preparationTime: 180,
        ovenTemperature: 220,
        instructions: 'Dissolva o fermento em água morna. Misture todos os ingredientes e sove por 10 minutos. Deixe fermentar por 1 hora. Modele os pães e deixe crescer por 45 minutos. Asse por 15-18 minutos.',
        technicalNotes: 'Temperatura da água deve estar entre 32-35°C. Use farinha com 11-12% de proteína.'
      }
    }),
    prisma.recipe.create({
      data: {
        name: 'Bolo de Chocolate Premium',
        description: 'Bolo de chocolate úmido com cobertura cremosa',
        categoryId: recipeCategories[1].id,
        productId: products[1].id,
        userId: users[0].id,
        preparationTime: 90,
        ovenTemperature: 180,
        instructions: 'Pré-aqueça o forno. Bata a manteiga com açúcar. Adicione ovos um a um. Alterne ingredientes secos com leite. Asse por 35-40 minutos.',
        technicalNotes: 'Para um bolo mais úmido, adicione 1 colher de sopa de café forte à massa.'
      }
    })
  ])

  console.log('✅ Created recipes')

  await Promise.all([
    prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: recipes[0].id,
          ingredientId: ingredients[0].id
        }
      },
      update: {},
      create: {
        recipeId: recipes[0].id,
        ingredientId: ingredients[0].id,
        quantity: 1000,
        percentage: 100.0,
        unitId: units[1].id,
        order: 1
      }
    }),
    prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: recipes[0].id,
          ingredientId: ingredients[1].id
        }
      },
      update: {},
      create: {
        recipeId: recipes[0].id,
        ingredientId: ingredients[1].id,
        quantity: 30,
        percentage: 3.0,
        unitId: units[1].id,
        order: 2
      }
    }),
    prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: recipes[0].id,
          ingredientId: ingredients[3].id
        }
      },
      update: {},
      create: {
        recipeId: recipes[0].id,
        ingredientId: ingredients[3].id,
        quantity: 8,
        percentage: 0.8,
        unitId: units[1].id,
        order: 3
      }
    })
  ])

  console.log('✅ Created recipe ingredients')
  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
