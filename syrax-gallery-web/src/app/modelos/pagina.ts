// Espejo de PageResponse
export interface Pagina<T> {
  content: T[];
  totalElementos: number;
  totalPages: number;
  size: number;
  number: number;
}