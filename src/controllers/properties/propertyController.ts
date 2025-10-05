import { Request, Response } from 'express';
import { getPropertyById, searchProperties } from '../../models/properties/propertyMock';

// GET /api/properties/:id
export const getProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const property = getPropertyById(id);
    
    if (!property) {
      res.status(404).json({
        success: false,
        error: { message: 'Propiedad no encontrada' }
      });
      return;
    }

    res.json({
      success: true,
      data: { property }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo propiedad' }
    });
  }
};

// GET /api/properties/popular
export const getPopularProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    
    const result = searchProperties({
      limit: Number(limit),
      minRating: 4.5
    });

    res.json({
      success: true,
      data: {
        properties: result.properties,
        total: result.total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error obteniendo propiedades populares' }
    });
  }
};
