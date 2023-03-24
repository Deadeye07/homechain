import axios from 'axios';

export default class GooglePlacesService {
    static baseUrl = 'http://localhost:8000/';

    static async getPlaceDetails(placeId) {
       return await axios
           .get(`${this.baseUrl}placeDetails`, {
               params: {
                   placeId: placeId
               }
            });
    }
    
}