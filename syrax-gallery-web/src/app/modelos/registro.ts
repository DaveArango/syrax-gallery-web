// Espejo de RegistrarZentysRequest (POST /api/zentys)
export interface RegistrarZentysRequest {
  nombre: string;
  runiapos: string; // correo
  indior: string;   // intereses
  clave: string;
}

// Espejo de RegistrarAzantysRequest (POST /api/azantys)
export interface RegistrarAzantysRequest {
  nombre: string;
  kostion: string;  // especialidad
  runiapos: string; // correo
  clave: string;
}

// Del registro solo se usa el id; cada backend devuelve además los datos del perfil
export interface CuentaCreadaResponse {
  id: string;
  nombre: string;
}
