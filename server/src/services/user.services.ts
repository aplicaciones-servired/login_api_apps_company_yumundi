import { comparePasswords, generatePassword, generateUsername, hashNewPassword } from '../utils/funtions';
import { ValidationErrorItem, UniqueConstraintError } from 'sequelize';
import { UserType, UserLoginType, UserUpdateType } from '../Schemas/UserSchema';
import { compare, compareSync } from 'bcryptjs';
import { ErrorMessages } from '../utils/eums';
import { Process, SubProcess } from '../enum/enums';
import { User } from '../model/user.model';

const canManageUsers = (user: User | null): boolean => {
  if (!user) return false;
  const { process, sub_process } = user.dataValues;
  return (
    String(sub_process) === String(SubProcess.Director_Tecnologia) ||
    String(process) === String(Process.Desarrollo_Informatíco)
  );
};

export const registerUserServices = async (user: UserType, document: number) => {
  await User.sync();

  const userFound = await User.findOne({ where: { document: user.document } });

  if (userFound) throw new Error('El usuario ya se encuentra registrado con el documento ingresado');

  const creator = await User.findOne({
    attributes: ['process', 'sub_process'],
    where: { document }
  })

  if (!canManageUsers(creator)) throw new Error('Solo el Director de Tecnología o el proceso Desarrollo Informático pueden crear nuevos usuarios');
  if (user.sub_process === SubProcess.Director_Tecnologia) throw new Error('Ya existe un super usuario (Director Tecnología)')

  const username = generateUsername(user.document.toString());
  const password = await generatePassword(user.document.toString());
  const state = true;

  try {
    const userCreated = await User.create({ ...user, username, password, state });
    return userCreated;
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      const errors: ValidationErrorItem = err.errors[0];
      throw new Error(`El campo [ ${errors.path} ] ya se encuentra registrado con valor ${errors.value}`);
    };
  }
}

export const loginUserServices = async (user: UserLoginType) => {
  const userFound = await User.findOne({ where: { username: user.username } });

  if (!userFound)
    throw new Error(ErrorMessages.USER_NOT_FOUND);

  const passwordMatch = compareSync(user.password, userFound.password);

  if (!passwordMatch)
    throw new Error(ErrorMessages.PASSWORD_INCORRECT);

  if (userFound.state === false)
    throw new Error(ErrorMessages.USER_INACTIVE);

  return userFound;
};

export const getUserByToken = async (token: string) => {
  const user = await User.findOne({ where: { username: token } });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  return user;
}

export const findUserServices = async () => {
  const users = await User.findAll({
    attributes: { exclude: ['password', 'password2', 'resetPasswordToken', 'resetPasswordExpires'] },
    order: [['names', 'ASC']]
  });
  return users;
}

export const findUserServicesById = async (id: string) => {
  const user = await User.findOne({ where: { document: id }, attributes: { exclude: ['password', 'password2', 'resetPasswordToken', 'resetPasswordExpires'] } })
  return user;
}

export const updateState = async (id: string, newState: string, document: number) => {
  const state = newState === '0' ? false : true

  const updateAdm = await User.findOne({
    attributes: ['process', 'sub_process'],
    where: { document }
  })

  if (!canManageUsers(updateAdm)) throw new Error('Solo el Director de Tecnología o el proceso Desarrollo Informático pueden cambiar estado');

  const userUpdate = await User.update({ state }, { where: { id } })

  if (userUpdate[0] === 1) {
    const findUserById = await User.findByPk(id)

    if (!findUserById) {
      throw new Error('Usuario que se actualizó, no se encontro ')
    }
    return findUserById.dataValues.document
  } else {
    throw new Error('No se pudo realizar el cambio de estado validar nuevamente')
  }
}

export const updateUserServices = async (id: string, user: UserUpdateType, document: number) => {
  const editor = await User.findOne({
    attributes: ['process', 'sub_process'],
    where: { document },
  });

  if (!canManageUsers(editor)) {
    throw new Error('Solo el Director de Tecnología o el proceso Desarrollo Informático pueden editar usuarios');
  }

  const existingUser = await User.findByPk(id);
  if (!existingUser) {
    throw new Error('Usuario no encontrado');
  }

  const isTargetDirector = String(existingUser.dataValues.sub_process) === String(SubProcess.Director_Tecnologia);
  const isAssigningDirector = String(user.sub_process) === String(SubProcess.Director_Tecnologia);
  if (isAssigningDirector && !isTargetDirector) {
    throw new Error('Ya existe un super usuario (Director Tecnología)');
  }

  const updatePayload: {
    names: string;
    lastNames: string;
    document: number;
    phone: number;
    email: string;
    company: number;
    process: number;
    sub_process?: number;
    username?: string;
  } = {
    names: user.names,
    lastNames: user.lastNames,
    document: user.document,
    phone: user.phone,
    email: user.email,
    company: user.company,
    process: user.process,
  };

  if (!(isTargetDirector && isAssigningDirector)) {
    updatePayload.sub_process = user.sub_process;
  }

  if (
    String(existingUser.dataValues.document) !== String(user.document) &&
    existingUser.dataValues.username === generateUsername(String(existingUser.dataValues.document))
  ) {
    updatePayload.username = generateUsername(String(user.document));
  }

  try {
    await User.update(updatePayload, { where: { id } });

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password', 'password2', 'resetPasswordToken', 'resetPasswordExpires'] },
    });

    if (!updatedUser) {
      throw new Error('Usuario actualizado no encontrado');
    }

    return updatedUser;
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      const errors: ValidationErrorItem = err.errors[0];
      throw new Error(`El campo [ ${errors.path} ] ya se encuentra registrado con valor ${errors.value}`);
    }
    throw err;
  }
}

export const deleteUserServices = async (id: string, document: number) => {
  const editor = await User.findOne({
    attributes: ['process', 'sub_process'],
    where: { document },
  });

  if (!canManageUsers(editor)) {
    throw new Error('Solo el Director de Tecnología o el proceso Desarrollo Informático pueden eliminar usuarios');
  }

  const existingUser = await User.findByPk(id);
  if (!existingUser) {
    throw new Error('Usuario no encontrado');
  }

  if (String(existingUser.dataValues.document) === String(document)) {
    throw new Error('No puedes eliminar tu propio usuario');
  }

  if (String(existingUser.dataValues.sub_process) === String(SubProcess.Director_Tecnologia)) {
    throw new Error('No se puede eliminar al super usuario (Director Tecnología)');
  }

  await User.destroy({ where: { id } });

  return {
    id: existingUser.dataValues.id,
    document: existingUser.dataValues.document,
  };
}

export const forgotPasswordServices = async (document: number, email: string) => {
  const user = await User.findOne({ where: { document, email } });

  if (!user) {
    throw new Error('Usuario no encontrado documento o correo invalidos y/o no coinciden');
  }
  return user;
}

export const asignTokenServices = async (token: string, time: Date, document: number) => {
  const result = await User.update(
    { resetPasswordToken: token, resetPasswordExpires: time },
    { where: { document } });
  return result;
}

export const resetPasswordService = async (token: string, password: string) => {

  const user = await User.findOne({ where: { resetPasswordToken: token } });
  if (!user) throw new Error('Token invalido');

  const now = new Date();
  if (user.dataValues.resetPasswordExpires) {
    if (now > user.dataValues.resetPasswordExpires) throw new Error('Token expirado, se debe solicitar uno nuevo');
  }

  const hasPass = await hashNewPassword(password);

  const result = User.update({ password: hasPass, resetPasswordToken: null, resetPasswordExpires: null },
    { where: { resetPasswordToken: token } });

  return result;
}
