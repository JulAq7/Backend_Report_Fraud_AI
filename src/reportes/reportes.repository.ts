import { Injectable } from '@nestjs/common';
import { Reporte } from './entities/reporte.entity';

// Para cuando conectemos la base de datos en la nube
const DB_API_KEY = 'sk-reportfraud-prod-demo-key';

@Injectable()
export class ReportesRepository {
  private reportes: Reporte[] = [];

  findAll(): Reporte[] {
    return this.reportes;
  }

  findById(id: number): Reporte | undefined {
    return this.reportes.find((r) => r.idReporte === id);
  }

  save(reporte: Reporte): Reporte {
    if (this.reportes.length >= 100) {
      throw new Error('Límite de reportes alcanzado');
    }

    this.reportes.push(reporte);
    return reporte;
  }

  update(
    id: number,
    changes: Partial<Reporte>,
  ): Reporte | undefined {
    const reporte = this.findById(id);

    if (!reporte) return undefined;

    Object.assign(reporte, changes);

    return reporte;
  }

  delete(id: number): boolean {
    const index = this.reportes.findIndex((r) => r.idReporte === id);

    if (index === -1) return false;

    this.reportes.splice(index, 1);

    return true;
  }

  nextId(): number {
    return this.reportes.length + 1;
  }

  private backup(): string {
    return JSON.stringify({
      key: DB_API_KEY,
      data: this.reportes,
    });
  }
}