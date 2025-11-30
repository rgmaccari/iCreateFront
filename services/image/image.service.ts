import api from '../api/api';
import { Image } from './image';
import { ImageCreateDto } from './image.create.dto';

export class ImageService {
  static async create(projectCode: number, formData: FormData): Promise<Image[]> {
    console.log('Acionando o ImageService - create()');
    const formDataEntries: any[] = [];
    formData.forEach((value, key) => formDataEntries.push([key, value]));

    const response = await api.post(`/images/${projectCode}`, formData, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async update(code: number, image: ImageCreateDto): Promise<Image> {
    console.log('Acionando o ImageService - update()');
    const response = await api.put<Image>(`/images/${code}`, image);
    return response.data;
  }

  static async findByCode(code: number): Promise<Image> {
    console.log('Acionando o ImageService - findByCode()');
    const response = await api.get(`/images/${code}`);
    return response.data;
  }

  static async findAllByProjectCode(projectCode: number): Promise<Image[]> {
    console.log('Acionando o ImageService - findAllByProjectCode()');
    const response = await api.get(`/images/all/${projectCode}`);
    return response.data;
  }

  static async findAllImages(): Promise<Image[]> {
    console.log('Acionando o ImageService - findAllImages()');
    const response = await api.get(`/images/allByUser`);
    return response.data;
  }

  static async deleteByCode(code: number): Promise<void> {
    console.log('Acionando o ImageService - deleteByCode()');
    await api.delete(`/images/${code}`);
  }
}
