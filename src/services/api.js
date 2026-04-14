const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY;
const BASE_URL = '/api';

export const getDatosMundial = async () => {
  try {
    const response = await fetch(`${BASE_URL}/competitions/WC/matches`, {
      headers: { 'X-Auth-Token': API_KEY }
    });
    
    if (!response.ok) throw new Error('Error al traer datos de la API');
    
    const data = await response.json();
    return data.matches; 
  } catch (error) {
    console.error(error);
    return [];
  }
};