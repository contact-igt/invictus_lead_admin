export interface User {
    email: string;
    password: string;
    role?: string;
  }
  

  export interface UserAdmin {
    id: number;
    email: string;
    role: string;
    country_code: string;
    profile_picture: string;
    phone_number: string;
    profile_types: [];
    username: string;
    clientId: number | null;
    clientName?: string;
  }
