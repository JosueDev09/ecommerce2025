// Función para crear un slug amigable para URLs
export function createProductSlug(nombre: string): string {
  const slug = nombre
    .toLowerCase()
    .normalize("NFD") // Normalizar caracteres especiales
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, "") // Eliminar caracteres especiales
    .trim()
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/-+/g, "-"); // Eliminar guiones múltiples
  
  return slug;
}

