import { polygon } from '@turf/helpers';

export interface AreaPermitida {
  nombre: string;
  polygon: any;
  centro: { lat: number; lng: number };
  descripcion?: string;
}

export const areasPermitidas: AreaPermitida[] = [
  {
    nombre: 'Oficina Neuquén',
    descripcion: 'Campus principal Neuquén',
    centro: { lat: -38.9516, lng: -68.0591 },
    polygon: polygon([[
      [-68.0650, -38.9450], // Noroeste
      [-68.0530, -38.9450], // Noreste
      [-68.0530, -38.9580], // Sureste
      [-68.0650, -38.9580], // Suroeste
      [-68.0650, -38.9450]  // Cierra el polígono
    ]])
  },
  {
    nombre: 'Oficina Cipolletti',
    descripcion: 'Sucursal Cipolletti',
    centro: { lat: -38.9337, lng: -67.9894 },
    polygon: polygon([[
      [-67.9950, -38.9280], // Noroeste
      [-67.9830, -38.9280], // Noreste
      [-67.9830, -38.9400], // Sureste
      [-67.9950, -38.9400], // Suroeste
      [-67.9950, -38.9280]  // Cierra el polígono
    ]])
  },
  {
    nombre: 'Oficina General Roca',
    descripcion: 'Sucursal General Roca',
    centro: { lat: -39.0333, lng: -67.5833 },
    polygon: polygon([[
      [-67.5900, -39.0270],
      [-67.5760, -39.0270],
      [-67.5760, -39.0400],
      [-67.5900, -39.0400],
      [-67.5900, -39.0270]
    ]])
  }
];

/**
 * Obtiene todas las áreas permitidas
 */
export function obtenerAreasPermitidas(): AreaPermitida[] {
  return areasPermitidas;
}

/**
 * Busca un área por nombre
 */
export function obtenerAreaPorNombre(nombre: string): AreaPermitida | undefined {
  return areasPermitidas.find(area =>
    area.nombre.toLowerCase().includes(nombre.toLowerCase())
  );
}
