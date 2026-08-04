export interface Company {
  name: string
  shortName: string
  email: string
  phone: string
  whatsapp: string
  tagline: string
  footerTagline: string
  about: string
  address: string
  mapEmbed: string
  social: {
    whatsapp: string
    facebook: string
    instagram: string
  }
}

export interface NavLink {
  id: string
  label: string
  href: string
}

export interface Category {
  id: string
  title: string
  icon: string
  description: string
  image: string
}

export interface Property {
  id: number
  title: string
  price: string
  location: string
  bhk: string
  area: string
  type: string
  image: string
  gallery?: string[]
  description?: string
  bathrooms?: string
  parking?: string
  facing?: string
  floor?: string
  status?: string
  furnishing?: string
  amenities?: string[]
}

export interface WhyChooseItem {
  id: string
  title: string
  icon: string
  desc: string
}

export interface Location {
  id: string
  name: string
  image: string
}

export interface Associate {
  id: string
  name: string
  image: string
}

export interface Review {
  id: string
  name: string
  rating: number
  date: string
  text: string
}

export type HeroMediaType = 'video' | 'image'

export interface HeroMedia {
  /** Homepage shows either video or photo — never both. */
  type: HeroMediaType
  video: string
  /** Used as the hero photo when type is "image". */
  poster: string
}

export interface VisitSection {
  title: string
  description: string
  points: string[]
}

export interface CareerJob {
  id: string
  title: string
  location: string
  type: string
  description: string
}

export interface CareerApplication {
  id: string
  jobId: string
  jobTitle: string
  name: string
  phone: string
  email: string
  message: string
  cvFileName?: string
  cvData?: string
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  createdAt: string
}

export interface Booking {
  id: string
  name: string
  phone: string
  requirement: string
  date: string
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled'
  createdAt: string
}

export interface FormEmailSettings {
  enabled: boolean
  toEmail: string
  ccEmail: string
  subject: string
  templateId: string
}

export interface EmailConfig {
  publicKey: string
  serviceId: string
  siteVisit: FormEmailSettings
  career: FormEmailSettings
}

export interface SiteData {
  company: Company
  navLinks: NavLink[]
  categories: Category[]
  properties: Property[]
  whyChoose: WhyChooseItem[]
  locations: Location[]
  reviews: Review[]
  hero: HeroMedia
  visitSection: VisitSection
  careers: CareerJob[]
  careerApplications: CareerApplication[]
  bookings: Booking[]
  associates: Associate[]
  bankingAssociates: Associate[]
  emailConfig: EmailConfig
}
