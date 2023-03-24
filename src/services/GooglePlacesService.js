import axios from 'axios';

export default class GooglePlacesService {

    static async getPlaceDetails(placeId) {
       return await axios
           .get(`http://localhost:8000/placeDetails`, {
               params: {
                   placeId: placeId
               }
            });
    }
    
}