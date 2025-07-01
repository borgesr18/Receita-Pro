'use client'

import React, { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Users,
  Package,
  Scale,
  Tag
} from 'lucide-react'
import { Category, Unit, User, ConfigurationItem } from '@/lib/types'

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('categorias-receitas')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{
    id: number;
    name: string;
    description?: string;
    abbreviation?: string;
    type?: string;
    factor?: number;
    email?: string;
    role?: string;
    active?: boolean;
  } | null>(null)
  const [formData, setFormData] = useState<{
    name: string;
    description?: string;
    abbreviation?: string;
    type?: string;
    factor?: number;
    email?: string;
    role?: string;
    active?: boolean;
  }>({
    name: '',
    description: '',
    abbreviation: '',
    type: '',
    factor: 1,
    role: '',
    active: true,
    email: ''
  })

  const [categoriasReceitas, setCategoriasReceitas] = useState([
    { id: 1, name: 'Pães', description: 'Pães tradicionais e especiais' },
    { id: 2, name: 'Bolos', description: 'Bolos doces e salgados' },
    { id: 3, name: 'Doces', description: 'Doces e sobremesas' },
    { id: 4, name: 'Salgados', description: 'Salgados e lanches' }
  ])

  const [categoriasInsumos, setCategoriasInsumos] = useState([
    { id: 1, name: 'Farinhas', description: 'Farinhas de trigo, milho, etc.' },
    { id: 2, name: 'Gorduras', description: 'Óleos, manteigas, margarinas' },
    { id: 3, name: 'Fermentos', description: 'Fermentos biológicos e químicos' },
    { id: 4, name: 'Açúcares', description: 'Açúcar cristal, refinado, mel' },
    { id: 5, name: 'Laticínios', description: 'Leite, queijos, iogurtes' }
  ])

  const [unidadesMedida, setUnidadesMedida] = useState([
    { id: 1, name: 'Quilograma (kg)', abbreviation: 'kg', type: 'peso', factor: 1000 },
    { id: 2, name: 'Grama (g)', abbreviation: 'g', type: 'peso', factor: 1 },
    { id: 3, name: 'Litro (L)', abbreviation: 'L', type: 'volume', factor: 1000 },
    { id: 4, name: 'Mililitro (ml)', abbreviation: 'ml', type: 'volume', factor: 1 },
    { id: 5, name: 'Unidade', abbreviation: 'un', type: 'unidade', factor: 1 },
    { id: 6, name: 'Lata', abbreviation: 'lata', type: 'unidade', factor: 1 },
    { id: 7, name: 'Pacote', abbreviation: 'pct', type: 'unidade', factor: 1 }
  ])

  const [usuarios, setUsuarios] = useState<User[]>([
    { id: 1, name: 'Admin', email: 'admin@receitapro.com', role: 'admin', active: true },
    { id: 2, name: 'Editor', email: 'editor@receitapro.com', role: 'editor', active: true },
    { id: 3, name: 'Visualizador', email: 'viewer@receitapro.com', role: 'viewer', active: true }
  ])

  const tabs = [
    { id: 'categorias-receitas', label: 'Categorias de Receitas', icon: Tag },
    { id: 'categorias-insumos', label: 'Categorias de Insumos', icon: Package },
    { id: 'unidades-medida', label: 'Unidades de Medida', icon: Scale },
    { id: 'usuarios', label: 'Usuários', icon: Users }
  ]

  const getCurrentData = (): ConfigurationItem[] => {
    switch (activeTab) {
      case 'categorias-receitas': return categoriasReceitas
      case 'categorias-insumos': return categoriasInsumos
      case 'unidades-medida': return unidadesMedida
      case 'usuarios': return usuarios
      default: return []
    }
  }

  const getCurrentSetter = (): React.Dispatch<React.SetStateAction<ConfigurationItem[]>> => {
    switch (activeTab) {
      case 'categorias-receitas': return setCategoriasReceitas as React.Dispatch<React.SetStateAction<ConfigurationItem[]>>
      case 'categorias-insumos': return setCategoriasInsumos as React.Dispatch<React.SetStateAction<ConfigurationItem[]>>
      case 'unidades-medida': return setUnidadesMedida as React.Dispatch<React.SetStateAction<ConfigurationItem[]>>
      case 'usuarios': return setUsuarios as React.Dispatch<React.SetStateAction<ConfigurationItem[]>>
      default: return () => {}
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      abbreviation: '',
      type: '',
      factor: 1,
      role: '',
      active: true,
      email: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: ConfigurationItem) => {
    setEditingItem(item)
    setFormData({ 
      name: item.name, 
      description: (item as Category).description || (item as User).email || '',
      abbreviation: (item as Unit).abbreviation || '',
      type: (item as Unit).type || '',
      factor: (item as Unit).factor || 1,
      role: (item as User).role || '',
      active: (item as User).active || true
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      const setter = getCurrentSetter()
      const currentData = getCurrentData()
      setter(currentData.filter(item => item.id !== id))
    }
  }

  const handleSave = () => {
    const setter = getCurrentSetter()
    const currentData = getCurrentData()
    
    if (editingItem) {
      setter(currentData.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData }
          : item
      ))
    } else {
      const newId = Math.max(...currentData.map(item => item.id)) + 1
      setter([...currentData, { id: newId, ...formData }])
    }
    
    setIsModalOpen(false)
    setFormData({
      name: '',
      description: '',
      abbreviation: '',
      type: '',
      factor: 1,
      role: '',
      active: true,
      email: ''
    })
    setEditingItem(null)
  }

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 'unidades-medida':
        return (
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abreviação</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fator</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        )
      case 'usuarios':
        return (
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        )
      default:
        return (
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        )
    }
  }

  const renderTableRow = (item: any) => {
    switch (activeTab) {
      case 'unidades-medida':
        return (
          <tr key={item.id} className="bg-white border-b border-gray-200">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.abbreviation}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{item.type}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.factor}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleEdit(item)}
                className="text-blue-600 hover:text-blue-900 mr-3"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        )
      case 'usuarios':
        return (
          <tr key={item.id} className="bg-white border-b border-gray-200">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{item.role}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {item.active ? 'Ativo' : 'Inativo'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleEdit(item)}
                className="text-blue-600 hover:text-blue-900 mr-3"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        )
      default:
        return (
          <tr key={item.id} className="bg-white border-b border-gray-200">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
            <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                onClick={() => handleEdit(item)}
                className="text-blue-600 hover:text-blue-900 mr-3"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        )
    }
  }

  const renderModalFields = () => {
    switch (activeTab) {
      case 'unidades-medida':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Quilograma"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Abreviação</label>
              <input
                type="text"
                value={formData.abbreviation}
                onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: kg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o tipo</option>
                <option value="peso">Peso</option>
                <option value="volume">Volume</option>
                <option value="unidade">Unidade</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fator de Conversão</label>
              <input
                type="number"
                value={formData.factor}
                onChange={(e) => setFormData({ ...formData, factor: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 1000 (para kg -> g)"
              />
            </div>
          </>
        )
      case 'usuarios':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do usuário"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Função</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a função</option>
                <option value="admin">Administrador</option>
                <option value="editor">Editor</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Usuário ativo</span>
              </label>
            </div>
          </>
        )
      default:
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome da categoria"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Descrição da categoria"
              />
            </div>
          </>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <button
              onClick={handleAdd}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span>Adicionar</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              {renderTableHeaders()}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentData().map(item => renderTableRow(item))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Editar' : 'Adicionar'} {tabs.find(tab => tab.id === activeTab)?.label.slice(0, -1)}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {renderModalFields()}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                <span>Salvar</span>
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
