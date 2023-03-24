import axios from 'axios';

export default class GooglePlacesService {
    //static baseUrl = 'http://localhost:8000/';
    static baseUrl = 'https://a4r7lrhpce.execute-api.us-east-1.amazonaws.com/'

    static async getPlaceDetails(placeId) {
       return await axios
           .get(`${this.baseUrl}placeDetails`, {
               params: {
                   placeId: placeId
               }
            });
    }
    
}