const API_KEY = '809819e4fe0f45859a21ebbf40f659e2';
const BASE_URL = '/api';

export const getDatosMundial = async () => {
  try {
    // WC es el código para la World Cup (Mundial)
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