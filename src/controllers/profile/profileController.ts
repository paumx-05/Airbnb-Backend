import { Request, Response } from 'express';
import { findUserById, updateUser, updateUserPassword } from '../../models/auth/user';
import { hashPassword, comparePassword } from '../../utils/jwtMock';
import { validateName, validatePassword } from '../../utils/validation';

// PUT /api/profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { name, avatar, bio, location, phone } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    // Validaciones
    if (name && !validateName(name)) {
      res.status(400).json({
        success: false,
        error: { message: 'Nombre debe tener mínimo 2 caracteres' }
      });
      return;
    }

    // Actualizar datos
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (avatar) updateData.avatar = avatar;
    if (bio) updateData.bio = bio.trim();
    if (location) updateData.location = location.trim();
    if (phone) updateData.phone = phone.trim();

    const updatedUserResult = await updateUser(userId, updateData);
    
    if (!updatedUserResult.success || !updatedUserResult.data) {
      res.status(500).json({
        success: false,
        error: { message: updatedUserResult.error || 'Error actualizando perfil' }
      });
      return;
    }

    const updatedUser = updatedUserResult.data;

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          avatar: updatedUser.avatar,
          bio: (updatedUser as any).bio,
          location: (updatedUser as any).location,
          phone: (updatedUser as any).phone,
          createdAt: updatedUser.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando perfil' }
    });
  }
};

// POST /api/profile/change-password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validaciones
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: { message: 'Contraseña actual y nueva contraseña son requeridas' }
      });
      return;
    }

    if (!validatePassword(newPassword)) {
      res.status(400).json({
        success: false,
        error: { message: 'Nueva contraseña debe tener mínimo 8 caracteres' }
      });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({
        success: false,
        error: { message: 'La nueva contraseña debe ser diferente a la actual' }
      });
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    // Verificar contraseña actual
    if (!comparePassword(currentPassword, user.password)) {
      res.status(401).json({
        success: false,
        error: { message: 'Contraseña actual incorrecta' }
      });
      return;
    }

    // Actualizar contraseña
    const hashedNewPassword = hashPassword(newPassword);
    await updateUserPassword(userId, hashedNewPassword);

    res.json({
      success: true,
      data: { message: 'Contraseña actualizada exitosamente' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error cambiando contraseña' }
    });
  }
};

// GET /api/profile/settings
export const getProfileSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
      return;
    }

    // Configuración mock por defecto
    const settings = {
      notifications: {
        email: true,
        push: true,
        sound: true,
        marketing: false,
        propertyUpdates: true,
        searchAlerts: true,
        muteAll: false
      },
      privacy: {
        showProfile: true,
        showEmail: false,
        showPhone: false,
        showLocation: true
      },
      preferences: {
        language: 'es',
        timezone: 'America/Mexico_City',
        currency: 'MXN',
        theme: 'light'
      }
    };

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo configuración' }
    });
  }
};

// PUT /api/profile/settings
export const updateProfileSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { notifications, privacy, preferences } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
      return;
    }

    // Validar y procesar configuración
    const settings = {
      notifications: {
        email: Boolean(notifications?.email),
        push: Boolean(notifications?.push),
        sound: Boolean(notifications?.sound),
        marketing: Boolean(notifications?.marketing),
        propertyUpdates: Boolean(notifications?.propertyUpdates),
        searchAlerts: Boolean(notifications?.searchAlerts),
        muteAll: Boolean(notifications?.muteAll)
      },
      privacy: {
        showProfile: Boolean(privacy?.showProfile),
        showEmail: Boolean(privacy?.showEmail),
        showPhone: Boolean(privacy?.showPhone),
        showLocation: Boolean(privacy?.showLocation)
      },
      preferences: {
        language: preferences?.language || 'es',
        timezone: preferences?.timezone || 'America/Mexico_City',
        currency: preferences?.currency || 'MXN',
        theme: preferences?.theme || 'light'
      }
    };

    res.json({
      success: true,
      data: { 
        settings,
        message: 'Configuración actualizada exitosamente'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error actualizando configuración' }
    });
  }
};