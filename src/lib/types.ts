// ===== TIPOS PRINCIPAIS =====

export type UserRole = 'admin' | 'client'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export type TripStatus = 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export interface Trip {
  id: string
  client_id: string
  destination: string
  country: string
  start_date: string | null
  end_date: string | null
  status: TripStatus
  title: string
  cover_image_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // relações
  profile?: Profile
}

// ===== ITINERÁRIO =====

export type ItineraryItemCategory =
  | 'flight'
  | 'hotel'
  | 'transfer'
  | 'tour'
  | 'restaurant'
  | 'activity'
  | 'other'

export interface ItineraryItem {
  id: string
  trip_id: string
  day_number: number
  date: string | null
  time: string | null
  title: string
  description: string | null
  location: string | null
  category: ItineraryItemCategory
  confirmation_code: string | null
  notes: string | null
  order_index: number
  latitude?: number | null
  longitude?: number | null
  created_at: string
  updated_at: string
}

// ===== FINANCEIRO =====

export type FinancialItemType = 'income' | 'expense'
export type FinancialItemCategory =
  | 'flight'
  | 'hotel'
  | 'transfer'
  | 'tour'
  | 'food'
  | 'shopping'
  | 'insurance'
  | 'visa'
  | 'other'
export type FinancialItemStatus = 'pending' | 'paid' | 'refunded'

export interface FinancialItem {
  id: string
  trip_id: string
  type: FinancialItemType
  category: FinancialItemCategory
  description: string
  amount: number
  currency: string
  amount_brl: number | null
  status: FinancialItemStatus
  due_date: string | null
  paid_date: string | null
  receipt_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ===== DOCUMENTOS =====

export type DocumentType =
  | 'passport'
  | 'visa'
  | 'ticket'
  | 'voucher'
  | 'insurance'
  | 'other'

export interface Document {
  id: string
  trip_id: string
  type: DocumentType
  title: string
  description: string | null
  file_url: string | null
  expiry_date: string | null
  notes: string | null
  order_index: number
  created_at: string
  updated_at: string
}

// ===== REQUISITOS (Documentação necessária) =====

export interface Requirement {
  id: string
  trip_id: string
  title: string
  description: string | null
  is_completed: boolean
  deadline: string | null
  notes: string | null
  order_index: number
  created_at: string
  updated_at: string
}

// ===== MALA INTELIGENTE =====

export type PackingItemCategory =
  | 'clothing'
  | 'documents'
  | 'health'
  | 'electronics'
  | 'toiletries'
  | 'accessories'
  | 'other'

export interface PackingItem {
  id: string
  trip_id: string
  category: PackingItemCategory
  item_name: string
  quantity: number
  is_packed: boolean
  is_essential: boolean
  notes: string | null
  order_index: number
  created_at: string
  updated_at: string
}

// ===== CHECKLIST =====

export interface ChecklistItem {
  id: string
  trip_id: string
  section: string
  title: string
  description: string | null
  is_completed: boolean
  deadline: string | null
  order_index: number
  created_at: string
  updated_at: string
}

// ===== CENTRAL ESTRATÉGICA =====

export interface StrategicSection {
  id: string
  trip_id: string
  title: string
  content: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface StrategicLink {
  id: string
  trip_id: string
  title: string
  url: string
  description: string | null
  category: string | null
  order_index: number
  created_at: string
  updated_at: string
}

// ===== TUTORIAIS =====

export type TutorialType = 'video' | 'youtube' | 'pdf' | 'link'

export interface Tutorial {
  id: string
  trip_id: string
  title: string
  description: string | null
  type: TutorialType
  url: string
  thumbnail_url: string | null
  duration_minutes: number | null
  order_index: number
  created_at: string
  updated_at: string
}

// ===== GALERIA =====

export type GalleryItemType = 'photo' | 'video'

export interface GalleryItem {
  id: string
  trip_id: string
  type: GalleryItemType
  title: string | null
  description: string | null
  file_url: string
  thumbnail_url: string | null
  location: string | null
  taken_at: string | null
  order_index: number
  created_at: string
  updated_at: string
}

// ===== RESTAURANTES =====

export type RestaurantCategory =
  | 'fine_dining'
  | 'casual'
  | 'street_food'
  | 'cafe'
  | 'bar'
  | 'other'

export interface Restaurant {
  id: string
  trip_id: string
  name: string
  category: RestaurantCategory
  cuisine: string | null
  address: string | null
  opening_hours: string | null
  google_maps_url: string | null
  website_url: string | null
  reservation_required: boolean
  price_range: 1 | 2 | 3 | 4 | null
  rating: number | null
  attica_notes: string | null
  is_recommended: boolean
  order_index: number
  created_at: string
  updated_at: string
}

// ===== DICAS DE FOTOGRAFIA =====

export interface PhotographyTip {
  id: string
  trip_id: string
  title: string
  description: string | null
  location: string | null
  best_time: string | null
  tip_text: string
  image_url: string | null
  order_index: number
  created_at: string
  updated_at: string
}

// ===== INFORMAÇÕES CULTURAIS =====

export interface CulturalInfo {
  id: string
  trip_id: string
  category: string
  title: string
  content: string
  is_important: boolean
  order_index: number
  created_at: string
  updated_at: string
}

// ===== VOCABULÁRIO =====

export interface Vocabulary {
  id: string
  trip_id: string
  portuguese: string
  local_language: string
  pronunciation: string | null
  category: string | null
  order_index: number
  created_at: string
  updated_at: string
}

// ===== CONTRATOS =====

export type ContractStatus = 'draft' | 'sent' | 'signed' | 'cancelled'

export interface Contract {
  id: string
  trip_id: string
  title: string
  content: string | null
  file_url: string | null
  status: ContractStatus
  sent_at: string | null
  signed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ===== DESTINO =====

export interface Destination {
  name: string
  country: string
  capital: string
  language: string
  currency: string
  voltage: string
  timezone_offset: number
  best_season: string
  visa_required: boolean
  visa_info: string
  vaccines: string[]
  documents_needed: string[]
  latitude: number
  longitude: number
}

// ===== WIDGETS =====
export interface TripWidget {
  id: string
  trip_id: string
  travel_style: string | null
  ideal_duration: string | null
  custom_notes: string | null
  show_weather: boolean
  show_currency: boolean
  show_map_button: boolean
  created_at: string
  updated_at: string
}

// ===== OPERAÇÕES =====
export type TransactionType = 'income' | 'expense'
export type TransactionCategory = 'service_fee' | 'commission' | 'salary' | 'rent' | 'marketing' | 'tools' | 'travel' | 'tax' | 'other'
export type TransactionStatus = 'confirmed' | 'pending' | 'cancelled'

export interface CompanyTransaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  description: string
  amount: number
  currency: string
  date: string
  client_id: string | null
  trip_id: string | null
  status: TransactionStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'
export type PaymentMethod = 'pix' | 'credit_card' | 'bank_transfer' | 'cash' | 'other'

export interface ClientPayment {
  id: string
  client_id: string
  trip_id: string | null
  description: string
  amount: number
  due_date: string | null
  paid_date: string | null
  status: PaymentStatus
  payment_method: PaymentMethod | null
  notes: string | null
  created_at: string
  updated_at: string
  // relações
  profile?: { id: string; full_name: string | null; email: string }
  trip?: { id: string; title: string } | null
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
export type TaskCategory = 'itinerary' | 'documents' | 'payment' | 'client_contact' | 'booking' | 'other'

export interface PlannerTask {
  id: string
  title: string
  description: string | null
  trip_id: string | null
  client_id: string | null
  due_date: string | null
  priority: TaskPriority
  status: TaskStatus
  category: TaskCategory
  notes: string | null
  order_index: number
  created_at: string
  updated_at: string
  // relações
  profile?: { id: string; full_name: string | null; email: string } | null
  trip?: { id: string; title: string } | null
}
