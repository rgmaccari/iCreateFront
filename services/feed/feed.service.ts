import api from "../api/api";
import { FeedItem } from "./feed";

export class FeedService {
  static async getFeedForUser(): Promise<FeedItem[]> {
    console.log("Acionando o FeedService - getFeedForUser()");
    const response = await api.get<FeedItem[]>(`/recommendation-items/feed`);
    return response.data;
  }
}
