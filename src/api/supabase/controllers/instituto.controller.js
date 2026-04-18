import * as InstitutosServices from "../services/institutos.service";
import boom from "@hapi/boom";

// Controlador para todos los institutos
export const getInstitutosList = async (req, res, next) => {
  try {
    // Manda a llamar al servicio para traer todos los institutos
    const institutosList = InstitutosServices.getCatIntitutosList();
    if (!institutosList) {
      throw boom.notFound("No hay institutos registrados");
    } else if (institutosList) {
      res.status(200).json(institutosList);
    }
  } catch (error) {
    next(error);
  }
};

export const getInstitutoItem = async (req, res, next) => {
  try {
    // Mandar a llamar al servicioi para traer todos los institutos
    const institutoItem = InsitutosServices.getInstitutoItem();
    if (!institutoItem) {
      throw boom.notFound("Instituto no encontrado");
    } else if (institutoItem) {
      res.status(200).json(institutoItem);
    }
  } catch (error) {
    next(error);
  }
};
