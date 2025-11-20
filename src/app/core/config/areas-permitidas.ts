import { polygon } from '@turf/helpers';

export interface AreaPermitida {
  nombre: string;
  polygon: any;
  centro: { lat: number; lng: number };
  descripcion?: string;
}

export const areasPermitidas: AreaPermitida[] = [
  {
    nombre: 'Oficina General Roca',
    descripcion: 'Área de trabajo General Roca - AMPLIADO PARA PRUEBAS',
    centro: { lat: -39.0333, lng: -67.5833 },
    polygon: polygon([[
      [-67.6200, -38.9800], // Noroeste (más amplio)
      [-67.5400, -38.9800], // Noreste (más amplio)
      [-67.5400, -39.0800], // Sureste (más amplio)
      [-67.6200, -39.0800], // Suroeste (más amplio)
      [-67.6200, -38.9800]  // Cierra el polígono
    ]])
  },
  {
    nombre: 'Oficina Neuquén',
    descripcion: 'Campus principal Neuquén',
    centro: { lat: -38.9516, lng: -68.0591 },
    polygon: polygon([[
      [-68.0650, -38.9450],
      [-68.0530, -38.9450],
      [-68.0530, -38.9580],
      [-68.0650, -38.9580],
      [-68.0650, -38.9450]
    ]])
  },
  {
    nombre: 'Oficina Cipolletti',
    descripcion: 'Sucursal Cipolletti',
    centro: { lat: -38.9337, lng: -67.9894 },
    polygon: polygon([[
      [-67.9950, -38.9280],
      [-67.9830, -38.9280],
      [-67.9830, -38.9400],
      [-67.9950, -38.9400],
      [-67.9950, -38.9280]
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
