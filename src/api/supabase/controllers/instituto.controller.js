import * as InstitutosServices from "../services/institutos.service";
import boom from "@hapi/boom";

// Controlador para todos los institutos
export const getInstitutosList = async (req, res, next) => {
  try {
    // Manda a llamar al servicio para traer todos los institutos
    const institutosList = await InstitutosServices.getCatIntitutosList();
    if (!institutosList) {
      throw boom.notFound("No hay institutos registrados");
    } else if (institutosList) {
      res.status(200).json(institutosList);
    }
  } catch (error) {
    next(error);
  }
};

export const addInstitutoItem = async (req, res, next) => {
  try {
    const data = req.body;
    const newInstituto = await InstitutosServices.addInstitutoItem(data);
    res.status(201).json(newInstituto);
  } catch (error) {
    next(error);
  }
};

export const getInstitutoItem = async (req, res, next) => {
  try {
    // Mandar a llamar al servicioi para traer todos los institutos
    const { id } = req.params;
    const { keyType } = req.query; // Esto captura el ?keyType=OK

    if(!keyType) {
      await InstitutosServices.getInstitutoItem(id);
    }
    const institutoItem = await InstitutosServices.getInstitutoItem(
      id,
      keyType,
    );
    if (!institutoItem) {
      throw boom.notFound("Instituto no encontrado");
    } else if (institutoItem) {
      res.status(200).json(institutoItem);
    }
  } catch (error) {
    next(error);
  }
};
