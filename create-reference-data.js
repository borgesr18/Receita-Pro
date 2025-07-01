const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createReferenceData() {
  try {
    console.log('🌱 Criando dados de referência padrão...')

    // Buscar o usuário de teste
    const user = await prisma.user.findFirst({
      where: { email: 'teste@receitas.com' }
    })

    if (!user) {
      console.error('Usuário de teste não encontrado!')
      return
    }

    console.log('👤 Usuário encontrado:', user.email)

    // Criar categorias padrão
    const categories = await Promise.all([
      prisma.ingredientCategory.upsert({
        where: { name_userId: { name: 'Farinhas', userId: user.id } },
        update: {},
        create: {
          name: 'Farinhas',
          description: 'Farinhas de trigo, centeio, aveia, etc.',
          userId: user.id
        }
      }),
      prisma.ingredientCategory.upsert({
        where: { name_userId: { name: 'Gorduras', userId: user.id } },
        update: {},
        create: {
          name: 'Gorduras',
          description: 'Manteigas, óleos, margarinas',
          userId: user.id
        }
      }),
      prisma.ingredientCategory.upsert({
        where: { name_userId: { name: 'Fermentos', userId: user.id } },
        update: {},
        create: {
          name: 'Fermentos',
          description: 'Fermentos biológicos e químicos',
          userId: user.id
        }
      }),
      prisma.ingredientCategory.upsert({
        where: { name_userId: { name: 'Açúcares', userId: user.id } },
        update: {},
        create: {
          name: 'Açúcares',
          description: 'Açúcar cristal, refinado, mascavo',
          userId: user.id
        }
      }),
      prisma.ingredientCategory.upsert({
        where: { name_userId: { name: 'Laticínios', userId: user.id } },
        update: {},
        create: {
          name: 'Laticínios',
          description: 'Leite, queijos, iogurtes',
          userId: user.id
        }
      })
    ])

    console.log('✅ Categorias criadas:', categories.length)

    // Criar unidades de medida padrão
    const units = await Promise.all([
      prisma.measurementUnit.upsert({
        where: { name_userId: { name: 'Quilograma', userId: user.id } },
        update: {},
        create: {
          name: 'Quilograma',
          abbreviation: 'kg',
          type: 'WEIGHT',
          baseUnit: 'g',
          conversionFactor: 1000,
          userId: user.id
        }
      }),
      prisma.measurementUnit.upsert({
        where: { name_userId: { name: 'Grama', userId: user.id } },
        update: {},
        create: {
          name: 'Grama',
          abbreviation: 'g',
          type: 'WEIGHT',
          baseUnit: 'g',
          conversionFactor: 1,
          userId: user.id
        }
      }),
      prisma.measurementUnit.upsert({
        where: { name_userId: { name: 'Litro', userId: user.id } },
        update: {},
        create: {
          name: 'Litro',
          abbreviation: 'L',
          type: 'VOLUME',
          baseUnit: 'ml',
          conversionFactor: 1000,
          userId: user.id
        }
      }),
      prisma.measurementUnit.upsert({
        where: { name_userId: { name: 'Mililitro', userId: user.id } },
        update: {},
        create: {
          name: 'Mililitro',
          abbreviation: 'ml',
          type: 'VOLUME',
          baseUnit: 'ml',
          conversionFactor: 1,
          userId: user.id
        }
      }),
      prisma.measurementUnit.upsert({
        where: { name_userId: { name: 'Unidade', userId: user.id } },
        update: {},
        create: {
          name: 'Unidade',
          abbreviation: 'un',
          type: 'UNIT',
          baseUnit: 'un',
          conversionFactor: 1,
          userId: user.id
        }
      })
    ])

    console.log('✅ Unidades criadas:', units.length)

    // Criar fornecedores padrão
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { name_userId: { name: 'Fornecedor Padrão', userId: user.id } },
        update: {},
        create: {
          name: 'Fornecedor Padrão',
          contact: 'contato@fornecedor.com',
          phone: '(11) 99999-9999',
          address: 'Rua dos Fornecedores, 123',
          userId: user.id
        }
      }),
      prisma.supplier.upsert({
        where: { name_userId: { name: 'Distribuidora ABC', userId: user.id } },
        update: {},
        create: {
          name: 'Distribuidora ABC',
          contact: 'vendas@abc.com',
          phone: '(11) 88888-8888',
          address: 'Av. Principal, 456',
          userId: user.id
        }
      })
    ])

    console.log('✅ Fornecedores criados:', suppliers.length)

    console.log('🎉 Dados de referência criados com sucesso!')

  } catch (error) {
    console.error('❌ Erro ao criar dados de referência:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createReferenceData()

