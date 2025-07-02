'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2,
  Package,
  Scale,
  Tag,
  Truck,
  Eye
} from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface Category {
  id: string
  name: string
  description: string
  createdAt?: string
  updatedAt?: string
}

interface Unit {
  id: string
  name: string
  symbol: string
  abbreviation?: string
  type?: string
  baseUnit?: string
  conversionFactor?: number
  createdAt?: string
  updatedAt?: string
}

interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  address: string
  createdAt?: string
  updatedAt?: string
}

interface UnitType {
  value: string
  label: string
}

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('categorias-receitas')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showSuccess, showError } = useToast()

  // Estado para modal de visualização
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<any>(null)

  // Estados para cada tipo de dados
  const [categoriasReceitas, setCategoriasReceitas] = useState<Category[]>([])
  const [categoriasInsumos, setCategoriasInsumos] = useState<Category[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<Unit[]>([])
  const [fornecedores, setFornecedores] = useState<Supplier[]>([])

  // Estado para tipos de unidades (carregado dinamicamente)
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([])

  // Estado do formulário
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    symbol: '',
    type: 'WEIGHT',
    baseUnit: '',
    conversionFactor: 1,
    contact: '',
    phone: '',
    email: '',
    address: ''
  })

  const tabs = [
    { id: 'categorias-receitas', label: 'Categorias de Receitas', icon: Tag },
    { id: 'categorias-insumos', label: 'Categorias de Insumos', icon: Package },
    { id: 'unidades-medida', label: 'Unidades de Medida', icon: Scale },
    { id: 'fornecedores', label: 'Fornecedores', icon: Truck }
  ]

  // Carregar tipos de unidades dinamicamente do banco
  const loadUnitTypes = useCallback(async () => {
    try {
      console.log('🔄 Carregando tipos de unidades do banco...')
      const response = await api.get('/api/enums/unit-types')
      const types = Array.isArray(response.data) ? response.data : []
      setUnitTypes(types)
      
      // Definir o primeiro tipo como padrão se existir
      if (types.length > 0) {
        setFormData(prev => ({ ...prev, type: types[0].value }))
      }
      
      console.log('✅ Tipos de unidades carregados:', types)
    } catch (error) {
      console.error('❌ Erro ao carregar tipos de unidades:', error)
      // Fallback para valores padrão em caso de erro
      const fallbackTypes = [
        { value: 'WEIGHT', label: 'Peso' },
        { value: 'VOLUME', label: 'Volume' },
        { value: 'LENGTH', label: 'Comprimento' }
      ]
      setUnitTypes(fallbackTypes)
      showError('Erro ao carregar tipos de unidades, usando valores padrão')
    }
  }, [showError])

  // Carregar dados com useCallback para evitar warning
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando dados das configurações...')
      
      const [categoriasReceitasRes, categoriasInsumosRes, unidadesMedidaRes, fornecedoresRes] = await Promise.all([
        api.get('/api/recipe-categories'),
        api.get('/api/ingredient-categories'),
        api.get('/api/measurement-units'),
        api.get('/api/suppliers')
      ])

      const categoriasReceitasData = Array.isArray(categoriasReceitasRes.data) ? categoriasReceitasRes.data : []
      const categoriasInsumosData = Array.isArray(categoriasInsumosRes.data) ? categoriasInsumosRes.data : []
      const unidadesMedidaData = Array.isArray(unidadesMedidaRes.data) ? unidadesMedidaRes.data : []
      const fornecedoresData = Array.isArray(fornecedoresRes.data) ? fornecedoresRes.data : []

      setCategoriasReceitas(categoriasReceitasData)
      setCategoriasInsumos(categoriasInsumosData)
      setUnidadesMedida(unidadesMedidaData)
      setFornecedores(fornecedoresData)

      console.log('✅ Dados carregados:', {
        categoriasReceitas: categoriasReceitasData.length,
        categoriasInsumos: categoriasInsumosData.length,
        unidadesMedida: unidadesMedidaData.length,
        fornecedores: fornecedoresData.length
      })
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    // Carregar tipos de unidades primeiro, depois os dados
    loadUnitTypes().then(() => {
      loadData()
    })
  }, [loadUnitTypes, loadData])

  const handleView = (item: any) => {
    setViewingItem(item)
    setIsViewModalOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    const defaultType = unitTypes.length > 0 ? unitTypes[0].value : 'WEIGHT'
    setFormData({
      name: '',
      description: '',
      symbol: '',
      type: defaultType,
      baseUnit: '',
      conversionFactor: 1,
      contact: '',
      phone: '',
      email: '',
      address: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      description: item.description || '',
      symbol: item.symbol || item.abbreviation || '',
      type: item.type || (unitTypes.length > 0 ? unitTypes[0].value : 'WEIGHT'),
      baseUnit: item.baseUnit || '',
      conversionFactor: item.conversionFactor || 1,
      contact: item.contact || '',
      phone: item.phone || '',
      email: item.email || '',
      address: item.address || ''
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      console.log('📤 Enviando dados:', formData)

      // Validação básica
      if (!formData.name.trim()) {
        showError('Nome é obrigatório')
        return
      }

      let response: any
      let endpoint = ''
      let dataToSend: any = {}

      // Preparar dados baseado na aba ativa
      switch (activeTab) {
        case 'categorias-receitas':
          endpoint = '/api/recipe-categories'
          dataToSend = {
            name: formData.name,
            description: formData.description
          }
          break
        case 'categorias-insumos':
          endpoint = '/api/ingredient-categories'
          dataToSend = {
            name: formData.name,
            description: formData.description
          }
          break
        case 'unidades-medida':
          endpoint = '/api/measurement-units'
          if (!formData.symbol.trim()) {
            showError('Símbolo é obrigatório')
            return
          }
          dataToSend = {
            name: formData.name,
            abbreviation: formData.symbol,
            type: formData.type,
            baseUnit: formData.baseUnit || null,
            conversionFactor: formData.conversionFactor
          }
          break
        case 'fornecedores':
          endpoint = '/api/suppliers'
          dataToSend = {
            name: formData.name,
            contact: formData.contact,
            phone: formData.phone,
            email: formData.email,
            address: formData.address
          }
          break
      }

      if (editingItem) {
        // Editar item existente
        response = await api.put(`${endpoint}/${editingItem.id}`, dataToSend)
        
        // Atualizar estado local
        switch (activeTab) {
          case 'categorias-receitas':
            const updatedCategoriasReceitas = categoriasReceitas.map(item => 
              item.id === editingItem.id ? response.data as Category : item
            )
            setCategoriasReceitas(updatedCategoriasReceitas)
            break
          case 'categorias-insumos':
            const updatedCategoriasInsumos = categoriasInsumos.map(item => 
              item.id === editingItem.id ? response.data as Category : item
            )
            setCategoriasInsumos(updatedCategoriasInsumos)
            break
          case 'unidades-medida':
            const updatedUnidades = unidadesMedida.map(item => 
              item.id === editingItem.id ? response.data as Unit : item
            )
            setUnidadesMedida(updatedUnidades)
            break
          case 'fornecedores':
            const updatedFornecedores = fornecedores.map(item => 
              item.id === editingItem.id ? response.data as Supplier : item
            )
            setFornecedores(updatedFornecedores)
            break
        }
        showSuccess('Item atualizado com sucesso!')
      } else {
        // Criar novo item
        response = await api.post(endpoint, dataToSend)
        
        // Adicionar ao estado local
        switch (activeTab) {
          case 'categorias-receitas':
            setCategoriasReceitas([...categoriasReceitas, response.data as Category])
            break
          case 'categorias-insumos':
            setCategoriasInsumos([...categoriasInsumos, response.data as Category])
            break
          case 'unidades-medida':
            setUnidadesMedida([...unidadesMedida, response.data as Unit])
            break
          case 'fornecedores':
            setFornecedores([...fornecedores, response.data as Supplier])
            break
        }
        showSuccess('Item criado com sucesso!')
      }

      setIsModalOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      showError('Erro ao salvar item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return

    try {
      let endpoint = ''
      
      switch (activeTab) {
        case 'categorias-receitas':
          endpoint = '/api/recipe-categories'
          break
        case 'categorias-insumos':
          endpoint = '/api/ingredient-categories'
          break
        case 'unidades-medida':
          endpoint = '/api/measurement-units'
          break
        case 'fornecedores':
          endpoint = '/api/suppliers'
          break
      }

      await api.delete(`${endpoint}/${id}`)
      
      // Remover do estado local
      switch (activeTab) {
        case 'categorias-receitas':
          const filteredCategoriasReceitas = categoriasReceitas.filter(item => item.id !== id)
          setCategoriasReceitas(filteredCategoriasReceitas)
          break
        case 'categorias-insumos':
          const filteredCategoriasInsumos = categoriasInsumos.filter(item => item.id !== id)
          setCategoriasInsumos(filteredCategoriasInsumos)
          break
        case 'unidades-medida':
          const filteredUnidades = unidadesMedida.filter(item => item.id !== id)
          setUnidadesMedida(filteredUnidades)
          break
        case 'fornecedores':
          const filteredFornecedores = fornecedores.filter(item => item.id !== id)
          setFornecedores(filteredFornecedores)
          break
      }
      
      showSuccess('Item excluído com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao excluir:', error)
      showError('Erro ao excluir item')
    }
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'categorias-receitas':
        return categoriasReceitas
      case 'categorias-insumos':
        return categoriasInsumos
      case 'unidades-medida':
        return unidadesMedida
      case 'fornecedores':
        return fornecedores
      default:
        return []
    }
  }

  const getModalTitle = () => {
    const action = editingItem ? 'Editar' : 'Adicionar'
    switch (activeTab) {
      case 'categorias-receitas':
        return `${action} Categoria de Receita`
      case 'categorias-insumos':
        return `${action} Categoria de Insumo`
      case 'unidades-medida':
        return `${action} Unidade de Medida`
      case 'fornecedores':
        return `${action} Fornecedor`
      default:
        return `${action} Item`
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getTypeLabel = (type: string) => {
    const unitType = unitTypes.find(ut => ut.value === type)
    return unitType ? unitType.label : type
  }

  const renderViewModal = () => {
    if (!isViewModalOpen || !viewingItem) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalhes do Item
            </h2>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações básicas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {viewingItem.name}
                </p>
              </div>

              {(activeTab === 'categorias-receitas' || activeTab === 'categorias-insumos') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded min-h-[60px]">
                    {viewingItem.description || '-'}
                  </p>
                </div>
              )}

              {activeTab === 'unidades-medida' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Símbolo
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {viewingItem.symbol || viewingItem.abbreviation}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {getTypeLabel(viewingItem.type)}
                    </p>
                  </div>
                </>
              )}

              {activeTab === 'fornecedores' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contato
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {viewingItem.contact || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {viewingItem.phone || '-'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Informações secundárias */}
            <
(Content truncated due to size limit. Use line ranges to read in chunks)
