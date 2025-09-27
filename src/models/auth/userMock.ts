import { User, UserDB } from '../../types/auth';

// Base de datos mock en memoria
const userDB: UserDB = {
  users: [
    {
      id: '1',
      email: 'demo@airbnb.com',
      name: 'Usuario Demo',
      password: '$2a$10$hashedpassword', // bcrypt hash simulado
      avatar: 'https://via.placeholder.com/150',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ],
  nextId: 2
};

// Funciones CRUD mock
export const findUserByEmail = (email: string): User | null => {
  return userDB.users.find(user => user.email === email) || null;
};

export const createUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const newUser: User = {
    ...userData,
    id: userDB.nextId.toString(),
    createdAt: new Date().toISOString()
  };
  userDB.users.push(newUser);
  userDB.nextId++;
  return newUser;
};

export const findUserById = (id: string): User | null => {
  return userDB.users.find(user => user.id === id) || null;
};

export const getAllUsers = (): User[] => {
  return userDB.users.map(user => ({
    ...user,
    password: '***' // Ocultar password en respuestas
  }));
};

export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const userIndex = userDB.users.findIndex(user => user.id === id);
  if (userIndex === -1) return null;
  
  userDB.users[userIndex] = { ...userDB.users[userIndex], ...updates };
  return userDB.users[userIndex];
};

export const deleteUser = (id: string): boolean => {
  const userIndex = userDB.users.findIndex(user => user.id === id);
  if (userIndex === -1) return false;
  
  userDB.users.splice(userIndex, 1);
  return true;
};
