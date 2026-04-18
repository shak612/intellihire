import { DataSource } from 'typeorm';

export async function enablePgVector(dataSource: DataSource): Promise<void> {
  await dataSource.query('CREATE EXTENSION IF NOT EXISTS vector');
}