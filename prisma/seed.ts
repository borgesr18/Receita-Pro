import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

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

  console.log('✅ Usuários criados')

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
    }),
    prisma.measurementUnit.create({
      data: {
        name: 'Dúzia',
        abbreviation: 'dz',
        type: 'Duzia',
        conversionFactor: 12,
        userId: users[0].id
      }
    }),
    prisma.measurementUnit.create({
      data: {
        name: 'Pacote',
        abbreviation: 'pct',
        type: 'Pacote',
        conversionFactor: 1,
        userId: users[0].id
      }
    })
  ])

  console.log('✅ Unidades de medida criadas')

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
    }),
    prisma.recipeCategory.create({
      data: {
        name: 'Massas',
        description: 'Massas básicas para produtos compostos',
        userId: users[0].id
      }
    }),
    prisma.recipeCategory.create({
      data: {
        name: 'Recheios',
        description: 'Recheios doces e salgados',
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
    }),
    prisma.ingredientCategory.create({
      data: {
        name: 'Carnes',
        description: 'Carnes, frangos, peixes',
        userId: users[0].id
      }
    }),
    prisma.ingredientCategory.create({
      data: {
        name: 'Temperos',
        description: 'Sal, pimenta, ervas, especiarias',
        userId: users[0].id
      }
    })
  ])

  console.log('✅ Categorias criadas')

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
    }),
    prisma.supplier.create({
      data: {
        name: 'Frigorífico Central',
        contact: 'Ana Costa',
        phone: '(11) 5678-9012',
        email: 'vendas@frigorifico.com.br',
        userId: users[0].id
      }
    })
  ])

  console.log('✅ Fornecedores criados')

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

  console.log('✅ Canais de venda criados')

  const ingredients = await Promise.all([
    // Farinhas
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
    // Açúcares
    prisma.ingredient.create({
      data: {
        name: 'Açúcar Cristal',
        categoryId: ingredientCategories[3].id,
        unitId: units[0].id,
        pricePerUnit: 3.20,
        supplierId: suppliers[1].id,
        userId: users[0].id,
        ingredientType: 'Acucares',
        storageCondition: 'Ambiente_Seco',
        currentStock: 15000,
        minimumStock: 3000
      }
    }),
    // Gorduras
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
    // Fermentos
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
    // Laticínios
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
    }),
    // Carnes
    prisma.ingredient.create({
      data: {
        name: 'Frango Desfiado',
        categoryId: ingredientCategories[5].id,
        unitId: units[0].id,
        pricePerUnit: 18.50,
        supplierId: suppliers[3].id,
        userId: users[0].id,
        ingredientType: 'Derivados',
        storageCondition: 'Refrigerado',
        currentStock: 5000,
        minimumStock: 1000
      }
    }),
    // Temperos
    prisma.ingredient.create({
      data: {
        name: 'Sal Refinado',
        categoryId: ingredientCategories[6].id,
        unitId: units[1].id,
        pricePerUnit: 0.003,
        userId: users[0].id,
        ingredientType: 'Sal',
        storageCondition: 'Ambiente_Seco',
        currentStock: 10000,
        minimumStock: 2000
      }
    }),
    prisma.ingredient.create({
      data: {
        name: 'Tempero Completo',
        categoryId: ingredientCategories[6].id,
        unitId: units[1].id,
        pricePerUnit: 0.02,
        userId: users[0].id,
        ingredientType: 'Temperos',
        storageCondition: 'Ambiente_Seco',
        currentStock: 3000,
        minimumStock: 500
      }
    })
  ])

  console.log('✅ Ingredientes criados')

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
    }),
    prisma.product.create({
      data: {
        name: 'Pão Recheado de Frango',
        categoryId: recipeCategories[0].id,
        userId: users[0].id,
        averageWeight: 120,
        description: 'Pão recheado com frango temperado - produto composto'
      }
    })
  ])

  console.log('✅ Produtos criados')

  // Criar receitas básicas
  const recipes = await Promise.all([
    // Receita do Pão Francês (simples)
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
    // Receita do Bolo (simples)
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
    }),
    // Receita da Massa do Pão (para produto composto)
    prisma.recipe.create({
      data: {
        name: 'Massa de Pão Básica',
        description: 'Massa básica para pães recheados',
        categoryId: recipeCategories[3].id, // Massas
        userId: users[0].id,
        preparationTime: 120,
        ovenTemperature: 200,
        instructions: 'Misture farinha, sal e fermento. Adicione água morna e sove bem. Deixe fermentar por 1 hora.',
        technicalNotes: 'Massa para ser usada em produtos compostos'
      }
    }),
    // Receita do Recheio de Frango (para produto composto)
    prisma.recipe.create({
      data: {
        name: 'Recheio de Frango Temperado',
        description: 'Recheio saboroso de frango para pães',
        categoryId: recipeCategories[4].id, // Recheios
        userId: users[0].id,
        preparationTime: 30,
        instructions: 'Refogue o frango desfiado com temperos. Deixe esfriar antes de usar.',
        technicalNotes: 'Recheio para produtos compostos'
      }
    })
  ])

  console.log('✅ Receitas criadas')

  // Criar ingredientes das receitas
  await Promise.all([
    // Pão Francês - Ingredientes
    prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: recipes[0].id,
          ingredientId: ingredients[0].id // Farinha
        }
      },
      update: {},
      create: {
        recipeId: recipes[0].id,
        ingredientId: ingredients[0].id,
        quantity: 1000,
        percentage: 100.0,
        unitId: units[1].id, // gramas
        order: 1
      }
    }),
    prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: recipes[0].id,
          ingredientId: ingredients[1].id // Açúcar
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
          ingredientId: ingredients[3].id // Fermento
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
    }),
    prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: recipes[0].id,
          ingredientId: ingredients[6].id // Sal
        }
      },
      update: {},
      create: {
        recipeId: recipes[0].id,
        ingredientId: ingredients[6].id,
        quantity: 15,
        percentage: 1.5,
        unitId: units[1].id,
        order: 4
      }
    }),

    // Massa de Pão - Ingredientes
    prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: recipes[2].id,
          ingredientId: ingredients[0].id // Farinha
        }
      },
      update: {},
      create: {
        recipeId: recipes[2].id,
        ingredientId: ingredients[0].id,
        quantity: 500,
        percentage: 100.0,
        unitId: units[1].id,
        order: 1
      }
    }),
    prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: recipes[2].id,
          ingredientId: ingredients[3].id // Fermento
        }
      },
      update: {},
      create: {
        recipeId: recipes[2].id,
        ingredientId: ingredients[3].id,
        quantity: 5,
        percentage: 1.0,
        unitId: units[1].id,
        order: 2
      }
    }),
    prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: recipes[2].id,
          ingredientId: ingredients[6].id // Sal
        }
      },
      update: {},
      create: {
        recipeId: recipes[2].id,
        ingredientId: ingredients[6].id,
        quantity: 8,
        percentage: 1.6,
        unitId: units[1].id,
        order: 3
      }
    }),

    // Recheio de Frango - Ingredientes
    prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: recipes[3].id,
          ingredientId: ingredients[5].id // Frango
        }
      },
      update: {},
      create: {
        recipeId: recipes[3].id,
        ingredientId: ingredients[5].id,
        quantity: 200,
        percentage: 100.0,
        unitId: units[1].id,
        order: 1
      }
    }),
    prisma.recipeIngredient.upsert({
      where: {
        recipeId_ingredientId: {
          recipeId: recipes[3].id,
          ingredientId: ingredients[7].id // Tempero
        }
      },
      update: {},
      create: {
        recipeId: recipes[3].id,
        ingredientId: ingredients[7].id,
        quantity: 10,
        percentage: 5.0,
        unitId: units[1].id,
        order: 2
      }
    })
  ])

  console.log('✅ Ingredientes das receitas criados')

  // Criar receitas compostas para o Pão Recheado
  await Promise.all([
    prisma.productRecipe.create({
      data: {
        productId: products[2].id, // Pão Recheado de Frango
        recipeId: recipes[2].id,   // Massa de Pão Básica
        quantity: 1.0,             // 1x a receita da massa
        order: 1                   // Primeira etapa
      }
    }),
    prisma.productRecipe.create({
      data: {
        productId: products[2].id, // Pão Recheado de Frango
        recipeId: recipes[3].id,   // Recheio de Frango Temperado
        quantity: 0.5,             // 0.5x a receita do recheio
        order: 2                   // Segunda etapa
      }
    })
  ])

  console.log('✅ Receitas compostas criadas')

  // Criar preços dos produtos
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
    }),
    prisma.productPrice.upsert({
      where: { 
        productId_channelId_userId: {
          productId: products[2].id,
          channelId: salesChannels[0].id,
          userId: users[0].id
        }
      },
      update: {},
      create: {
        productId: products[2].id,
        channelId: salesChannels[0].id,
        userId: users[0].id,
        price: 3.50,
        profitMargin: 70
      }
    })
  ])

  console.log('✅ Preços dos produtos criados')
  console.log('🎉 Banco de dados populado com sucesso!')
  console.log('')
  console.log('📊 RESUMO:')
  console.log('- 3 usuários (admin, editor, viewer)')
  console.log('- 7 unidades de medida')
  console.log('- 5 categorias de receitas')
  console.log('- 7 categorias de ingredientes')
  console.log('- 4 fornecedores')
  console.log('- 3 canais de venda')
  console.log('- 8 ingredientes')
  console.log('- 3 produtos (1 simples, 1 bolo, 1 composto)')
  console.log('- 4 receitas (2 simples, 2 para composição)')
  console.log('- 1 produto com receitas compostas (Pão Recheado)')
  console.log('')
  console.log('🎯 TESTE O SISTEMA:')
  console.log('1. Crie uma produção do "Pão Recheado de Frango"')
  console.log('2. Veja o desconto automático dos ingredientes!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao popular banco:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

