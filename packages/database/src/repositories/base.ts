export interface BaseRepository<T, CreateDTO, UpdateDTO> {
  find(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface PublishableRepository<T, CreateDTO, UpdateDTO> extends BaseRepository<T, CreateDTO, UpdateDTO> {
  list(options?: { publishedOnly?: boolean }): Promise<T[]>;
  publish(id: string): Promise<T>;
  archive(id: string): Promise<T>;
}
