export interface Frame {
  id: string
  name: string
  price: string
  sizes: string[]
  type: string
  categories: string[]
  color: string
  desc: string
  images: string[]
  keywords: string[]
}

export interface SearchResult {
  frames: Frame[]
  total: number
}

